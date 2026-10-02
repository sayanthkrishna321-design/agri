"""
Agent Orchestration Layer for AgriSentinel X.
Orchestrates intent classification, missing field detection, tool execution (Weather & Insurance Rules),
contradiction checks, and grounded narrative generation.
"""

from typing import Dict, Any, Optional, List, Union
import logging

from agri_agent.exceptions import WeatherError, InsuranceRuleError, AgriAgentError
from agri_agent.models import (
    AgentRequest,
    AgentStructuredOutput,
    AgentStatus,
    AgentIntent,
    WeatherResponse,
    InsuranceRuleResponse,
)
from agri_agent.weather import get_weather
from agri_agent.insurance_rules import evaluate_insurance_rules
from agri_agent.groq_provider import GroqProvider
from agri_agent.config import DEMO_RULES_NOTICE, WEATHER_LOSS_DISCLAIMER

logger = logging.getLogger(__name__)

# Keywords for Intent Routing (English + Hinglish)
WEATHER_KEYWORDS = [
    "weather", "rain", "rainfall", "temperature", "forecast", "precipitation", "climate", "heatwave", "drought", "flood",
    "baarish", "mausam", "garmi", "sookha", "varsha", "taapman", "basaat", "barsat"
]
INSURANCE_KEYWORDS = [
    "insurance", "claim", "eligible", "eligibility", "pmfby", "compensation", "payout", "loss", "damage", "policy", "bima",
    "beema", "khutthi", "nuksan", "nuksaan", "fasal", "paise", "muawza"
]
UNSUPPORTED_KEYWORDS = ["stock market", "crypto", "bitcoin", "election", "politics", "movie", "football", "cricket", "gaming"]


class AgriSentinelAgent:
    """
    Main Agricultural AI Agent Orchestrator.
    Can be imported directly into Django REST Framework views or services.
    """

    def __init__(
        self,
        groq_provider: Optional[GroqProvider] = None,
        gemini_provider: Optional[GroqProvider] = None,
    ):
        # gemini_provider is retained as a deprecated constructor keyword.
        self.groq_provider = groq_provider or gemini_provider or GroqProvider()
        self.gemini_provider = self.groq_provider

    def classify_intent(self, query: str, has_insurance_fields: bool, has_geo_fields: bool) -> AgentIntent:
        """Determines query intent based on keywords and provided structured parameters."""
        q_lower = query.lower()

        # Check unsupported topics
        if any(term in q_lower for term in UNSUPPORTED_KEYWORDS):
            return AgentIntent.UNSUPPORTED

        has_w_kw = any(term in q_lower for term in WEATHER_KEYWORDS)
        has_i_kw = any(term in q_lower for term in INSURANCE_KEYWORDS)

        if (has_w_kw and has_i_kw) or (has_insurance_fields and has_geo_fields):
            return AgentIntent.COMPREHENSIVE_ASSESSMENT
        elif has_i_kw or has_insurance_fields:
            return AgentIntent.INSURANCE_ELIGIBILITY
        elif has_w_kw or has_geo_fields:
            return AgentIntent.WEATHER_QUERY
        else:
            return AgentIntent.GENERAL_AGRI_QUERY

    def _detect_missing_information(
        self, intent: AgentIntent, request: AgentRequest
    ) -> List[str]:
        """Identifies missing mandatory fields required for tool execution."""
        missing = []

        if intent in [AgentIntent.WEATHER_QUERY, AgentIntent.COMPREHENSIVE_ASSESSMENT]:
            if request.latitude is None:
                missing.append("latitude")
            if request.longitude is None:
                missing.append("longitude")

        if intent in [AgentIntent.INSURANCE_ELIGIBILITY, AgentIntent.COMPREHENSIVE_ASSESSMENT]:
            if not request.crop_name or not request.crop_name.strip():
                missing.append("crop_name")
            if not request.claimed_cause or not request.claimed_cause.strip():
                missing.append("claimed_cause")

        return missing

    def _check_contradictions(
        self, claimed_cause: Optional[str], weather: Optional[WeatherResponse]
    ) -> List[str]:
        """Detects contradictions between reported claim cause and weather evidence."""
        contradictions = []
        if not claimed_cause or not weather or not weather.summary:
            return contradictions

        cause_lower = claimed_cause.lower()
        summary = weather.summary

        if "drought" in cause_lower and summary.total_precipitation_mm >= 100.0:
            contradictions.append(
                f"CONTRADICTION DETECTED: Farmer reported severe drought, but weather tool recorded heavy rainfall of {summary.total_precipitation_mm}mm during the requested period."
            )
        elif "flood" in cause_lower and summary.total_precipitation_mm <= 10.0:
            contradictions.append(
                f"CONTRADICTION DETECTED: Farmer reported flood/excessive rain, but weather tool recorded total rainfall of only {summary.total_precipitation_mm}mm."
            )

        return contradictions

    def _get_claim_checklist(self) -> List[str]:
        """Generates standard, safe claim preparation checklist without inventing deadlines."""
        return [
            "Notify insurance company or local agriculture office within 72 hours of loss occurrence.",
            "Gather essential documents: Land Record (Khasra/Khatauni), Sowing Certificate, Bank Passbook, and Premium Receipt.",
            "Take geotagged photos or video evidence showing damaged field boundaries.",
            "Cooperate with local Joint Inspection Team during physical loss survey.",
        ]

    def process_request(self, request_data: Union[Dict[str, Any], AgentRequest]) -> AgentStructuredOutput:
        """
        Processes farmer query and structured parameters, invoking tools and composing grounded output.
        """
        # Parse and validate top-level request
        if isinstance(request_data, dict):
            try:
                request = AgentRequest(**request_data)
            except Exception as e:
                return AgentStructuredOutput(
                    answer=f"Invalid request format: {str(e)}",
                    tools_used=[],
                    missing_information=["valid_request_payload"],
                    recommended_next_steps=[],
                    uncertainty_notes=[],
                    sources=[],
                    proof_of_origin={},
                    error_status=str(e),
                    status=AgentStatus.ERROR,
                    intent=AgentIntent.UNSUPPORTED,
                    disclaimers=[],
                )
        else:
            request = request_data

        has_insurance_fields = bool(request.crop_name and request.claimed_cause)
        has_geo_fields = bool(request.latitude is not None and request.longitude is not None)

        intent = self.classify_intent(request.query, has_insurance_fields, has_geo_fields)

        # Handle unsupported queries immediately
        if intent == AgentIntent.UNSUPPORTED:
            return AgentStructuredOutput(
                answer="I am specialized in agricultural crop weather and insurance eligibility. I cannot answer queries unrelated to farming, weather, or crop insurance.",
                tools_used=[],
                missing_information=[],
                recommended_next_steps=[],
                uncertainty_notes=["Query topic is outside agricultural domain scope."],
                sources=[],
                proof_of_origin={"domain_check": "Agent domain filter -> Out of scope"},
                error_status=None,
                status=AgentStatus.UNSUPPORTED_QUERY,
                intent=intent,
                disclaimers=[],
            )

        # Check missing mandatory information
        missing_info = self._detect_missing_information(intent, request)
        if missing_info:
            missing_readable = ", ".join(f"'{m}'" for m in missing_info)
            return AgentStructuredOutput(
                answer=f"To assist you accurately with your request, please provide the missing information: {missing_readable}.",
                tools_used=[],
                missing_information=missing_info,
                recommended_next_steps=[],
                uncertainty_notes=["Assessment pending missing mandatory input parameters."],
                sources=[],
                proof_of_origin={"missing_fields_check": f"Missing required fields: {missing_info}"},
                error_status=None,
                status=AgentStatus.MISSING_INFO,
                intent=intent,
                disclaimers=[],
            )

        # Tool Execution
        tools_used: List[str] = []
        weather_res: Optional[WeatherResponse] = None
        insurance_res: Optional[InsuranceRuleResponse] = None
        sources: List[str] = []
        uncertainty_notes: List[str] = []
        proof_of_origin: Dict[str, str] = {}
        error_status: Optional[str] = None
        disclaimers: List[str] = []

        # Execute Weather Tool
        if intent in [AgentIntent.WEATHER_QUERY, AgentIntent.COMPREHENSIVE_ASSESSMENT] or has_geo_fields:
            try:
                weather_res = get_weather(
                    latitude=request.latitude,
                    longitude=request.longitude,
                    start_date=request.start_date,
                    end_date=request.end_date,
                )
                tools_used.append("OpenMeteoWeatherTool")
                sources.append(weather_res.data_source)
                proof_of_origin["weather_total_rainfall"] = f"Open-Meteo ({weather_res.data_source}): {weather_res.summary.total_precipitation_mm}mm"
                proof_of_origin["weather_max_temperature"] = f"Open-Meteo ({weather_res.data_source}): {weather_res.summary.max_temperature_c}°C"
                if weather_res.warnings:
                    uncertainty_notes.extend(weather_res.warnings)
            except WeatherError as we:
                logger.error("Weather tool execution failed (%s)", type(we).__name__)
                error_status = f"Weather Tool Error: {we.message if hasattr(we, 'message') else str(we)}"
                uncertainty_notes.append("Weather evidence is currently unavailable due to API retrieval failure.")
            except Exception as ex:
                logger.error("Unexpected weather tool failure (%s)", type(ex).__name__)
                error_status = f"Weather Tool Error: {str(ex)}"
                uncertainty_notes.append("Weather evidence is currently unavailable.")

        # Execute Insurance Rule Checker
        if intent in [AgentIntent.INSURANCE_ELIGIBILITY, AgentIntent.COMPREHENSIVE_ASSESSMENT] or has_insurance_fields:
            try:
                insurance_res = evaluate_insurance_rules(
                    crop_name=request.crop_name,
                    claimed_cause=request.claimed_cause,
                    weather_data=weather_res,
                    sowing_date=request.start_date,
                    loss_date=request.end_date,
                    policy_id=request.policy_id,
                    land_holding_hectares=request.land_holding_hectares,
                )
                tools_used.append("DeterministicInsuranceRuleChecker")
                sources.append("AgriSentinel Explicit Demo Rule Engine")
                disclaimers.append(DEMO_RULES_NOTICE)
                disclaimers.append(WEATHER_LOSS_DISCLAIMER)
                if insurance_res.proof_of_origin:
                    proof_of_origin.update(insurance_res.proof_of_origin)
                proof_of_origin["insurance_eligibility_decision"] = f"Deterministic Rule Engine -> Potentially Eligible: {insurance_res.is_potentially_eligible}"
            except InsuranceRuleError as ie:
                logger.error("Insurance rule checker failed (%s)", type(ie).__name__)
                error_status = (error_status + " | " if error_status else "") + f"Insurance Rule Error: {str(ie)}"

        # Check Contradictions between claim & weather evidence
        contradiction_notes = self._check_contradictions(request.claimed_cause, weather_res)
        if contradiction_notes:
            uncertainty_notes.extend(contradiction_notes)
            proof_of_origin["contradiction_check"] = contradiction_notes[0]

        # Recommended Next Steps (Checklist)
        next_steps = []
        if insurance_res or intent in [AgentIntent.INSURANCE_ELIGIBILITY, AgentIntent.COMPREHENSIVE_ASSESSMENT]:
            next_steps = self._get_claim_checklist()

        # Determine Overall Status
        if contradiction_notes:
            status = AgentStatus.CONTRADICTION_DETECTED
        elif error_status and not weather_res and not insurance_res:
            status = AgentStatus.ERROR
        elif error_status:
            status = AgentStatus.PARTIAL_SUCCESS
        else:
            status = AgentStatus.SUCCESS

        # Generate Grounded LLM Narrative
        ai_explanation = self.groq_provider.generate(
            query=request.query,
            weather=weather_res,
            insurance=insurance_res,
            missing_info=None,
            uncertainty_notes=uncertainty_notes,
        )

        return AgentStructuredOutput(
            answer=ai_explanation,
            tools_used=tools_used,
            weather_evidence=weather_res,
            insurance_check=insurance_res,
            missing_information=[],
            recommended_next_steps=next_steps,
            uncertainty_notes=uncertainty_notes,
            sources=sources,
            proof_of_origin=proof_of_origin,
            error_status=error_status,
            status=status,
            intent=intent,
            disclaimers=disclaimers,
        )


def run_agent(query: str, **kwargs) -> AgentStructuredOutput:
    """
    Convenience entry point to run AgriSentinel Agent.

    Example Usage (Importable into Django REST Framework):
        from agri_agent import run_agent

        result = run_agent(
            query="Did heavy rain make my rice crop eligible for insurance?",
            latitude=19.0760,
            longitude=72.8777,
            crop_name="Rice",
            claimed_cause="Heavy Rainfall",
            start_date="2026-09-01",
            end_date="2026-09-07"
        )
        print(result.answer)
        print(result.tools_used)
    """
    agent = AgriSentinelAgent()
    req_dict = {"query": query, **kwargs}
    return agent.process_request(req_dict)
