"""
Pydantic schemas and structured output data models for AgriSentinel X.
"""

from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import date, datetime, timezone
from pydantic import BaseModel, Field, field_validator, model_validator


class WeatherMode(str, Enum):
    FORECAST = "forecast"
    HISTORICAL = "historical"
    RECENT_PAST = "recent_past"
    HYBRID = "hybrid"


class WeatherRequest(BaseModel):
    """Input payload for weather request."""
    latitude: float = Field(..., description="Latitude in decimal degrees (-90 to 90)")
    longitude: float = Field(..., description="Longitude in decimal degrees (-180 to 180)")
    start_date: Optional[str] = Field(None, description="Start date in YYYY-MM-DD format")
    end_date: Optional[str] = Field(None, description="End date in YYYY-MM-DD format")
    timezone: str = Field("auto", description="Timezone for weather data aggregation")

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-90.0 <= v <= 90.0):
            raise ValueError(f"Latitude must be between -90.0 and 90.0, got {v}")
        return round(v, 4)

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (-180.0 <= v <= 180.0):
            raise ValueError(f"Longitude must be between -180.0 and 180.0, got {v}")
        return round(v, 4)

    @field_validator("start_date", "end_date")
    @classmethod
    def validate_date_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError(f"Date '{v}' must be in YYYY-MM-DD format")

    @model_validator(mode="after")
    def validate_date_range(self) -> "WeatherRequest":
        if self.start_date and self.end_date:
            d_start = datetime.strptime(self.start_date, "%Y-%m-%d").date()
            d_end = datetime.strptime(self.end_date, "%Y-%m-%d").date()
            if d_start > d_end:
                raise ValueError(f"start_date ({self.start_date}) cannot be after end_date ({self.end_date})")
        return self


class DailyWeatherMetrics(BaseModel):
    """Daily weather observation or forecast metrics."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    precipitation_mm: float = Field(..., description="Total daily precipitation in millimeters")
    temp_max_c: float = Field(..., description="Maximum temperature in degrees Celsius")
    temp_min_c: float = Field(..., description="Minimum temperature in degrees Celsius")
    temp_mean_c: Optional[float] = Field(None, description="Mean temperature in degrees Celsius")
    max_wind_speed_kmh: Optional[float] = Field(None, description="Maximum wind speed in km/h")
    is_forecast: bool = Field(False, description="True if value is a forecast prediction; False if actual historical observation")


class WeatherSummary(BaseModel):
    """Aggregated metrics across requested period."""
    total_precipitation_mm: float
    max_temperature_c: float
    min_temperature_c: float
    avg_temperature_c: float
    max_wind_speed_kmh: float
    total_days: int
    dry_days_count: int
    heavy_rain_days_count: int


class WeatherResponse(BaseModel):
    """Structured result returned by WeatherTool."""
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    start_date: str
    end_date: str
    mode: WeatherMode
    data_source: str
    retrieved_at: str
    daily_data: List[DailyWeatherMetrics] = Field(default_factory=list)
    summary: WeatherSummary
    warnings: List[str] = Field(default_factory=list)


# --- Insurance Rule Models ---

class InsuranceRuleInput(BaseModel):
    """Input payload for deterministic insurance rule checker."""
    policy_id: Optional[str] = Field(None, description="Insurance policy or scheme reference ID")
    crop_name: str = Field(..., description="Target crop (e.g. Rice, Wheat, Cotton, Maize)")
    state: Optional[str] = Field(None, description="State / Region")
    district: Optional[str] = Field(None, description="District / County")
    sowing_date: Optional[str] = Field(None, description="Date crop was sown (YYYY-MM-DD)")
    loss_date: Optional[str] = Field(None, description="Date loss incident occurred (YYYY-MM-DD)")
    claimed_cause: str = Field(..., description="Claimed cause of loss (e.g., Drought, Heavy Rainfall, Flood, Heatwave)")
    weather_data: Optional[WeatherResponse] = Field(None, description="Validated weather data context")


class RuleEvaluationDetail(BaseModel):
    """Evaluation result for an individual rule."""
    rule_id: str
    rule_name: str
    category: str
    is_demo_rule: bool = True
    passed: bool
    threshold_checked: str
    actual_value: str
    rationale: str
    rule_citation: str = Field("PMFBY Operational Guidelines (Demo Rule)", description="Source scheme document citation")
    fact_source: str = Field("Deterministic Insurance Rule Engine", description="Source tool or input")


class InsuranceRuleResponse(BaseModel):
    """Output payload from deterministic insurance rule checker."""
    crop_name: str
    claimed_cause: str
    is_potentially_eligible: bool
    confidence: str = Field("DEMO_RULE_EVALUATION", description="Indicates rule status")
    rule_evaluations: List[RuleEvaluationDetail] = Field(default_factory=list)
    compliance_notes: List[str] = Field(default_factory=list)
    disclaimer: str
    verified_against_official_documents: bool = False
    proof_of_origin: Dict[str, str] = Field(default_factory=dict, description="Fact provenance mapping")


# --- Agent Orchestrator Models ---

class AgentIntent(str, Enum):
    WEATHER_QUERY = "weather_query"
    INSURANCE_ELIGIBILITY = "insurance_eligibility"
    COMPREHENSIVE_ASSESSMENT = "comprehensive_assessment"
    GENERAL_AGRI_QUERY = "general_agri_query"
    UNSUPPORTED = "unsupported"


class AgentStatus(str, Enum):
    SUCCESS = "SUCCESS"
    PARTIAL_SUCCESS = "PARTIAL_SUCCESS"
    MISSING_INFO = "MISSING_INFO"
    CONTRADICTION_DETECTED = "CONTRADICTION_DETECTED"
    UNSUPPORTED_QUERY = "UNSUPPORTED_QUERY"
    ERROR = "ERROR"


class AgentRequest(BaseModel):
    """Top-level request to AgriSentinel Agent."""
    query: str = Field(..., description="Farmer or user query text")
    latitude: Optional[float] = Field(None, description="Latitude decimal degrees")
    longitude: Optional[float] = Field(None, description="Longitude decimal degrees")
    start_date: Optional[str] = Field(None, description="Start date YYYY-MM-DD")
    end_date: Optional[str] = Field(None, description="End date YYYY-MM-DD")
    crop_name: Optional[str] = Field(None, description="Crop name")
    claimed_cause: Optional[str] = Field(None, description="Claimed cause of loss")
    policy_id: Optional[str] = Field(None, description="Insurance policy ID")
    land_holding_hectares: Optional[float] = Field(None, description="Land holding size in hectares")


class AgentStructuredOutput(BaseModel):
    """
    Standardized, validated structured response for AgriSentinel X Agent.
    Strictly separates tool output evidence from AI explanations and next steps.
    """
    answer: str = Field(..., description="Grounded explanation in simple language")
    tools_used: List[str] = Field(default_factory=list, description="List of tools invoked during query execution")
    weather_evidence: Optional[WeatherResponse] = Field(None, description="Validated weather evidence payload")
    insurance_check: Optional[InsuranceRuleResponse] = Field(None, description="Deterministic insurance rule evaluation")
    missing_information: List[str] = Field(default_factory=list, description="Fields needed to complete assessment")
    recommended_next_steps: List[str] = Field(default_factory=list, description="Actionable checklist or recommendations")
    uncertainty_notes: List[str] = Field(default_factory=list, description="Limitations, forecast vs observation notes, or contradiction alerts")
    sources: List[str] = Field(default_factory=list, description="Data sources utilized")
    proof_of_origin: Dict[str, str] = Field(default_factory=dict, description="Proves where every fact came from")
    error_status: Optional[str] = Field(None, description="Error message if a tool or step failed")
    status: AgentStatus = Field(AgentStatus.SUCCESS, description="Overall execution status")
    intent: AgentIntent = Field(..., description="Detected query intent")
    disclaimers: List[str] = Field(default_factory=list, description="Demo rules notice and policy guardrail disclaimers")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))


class AgentResponse(AgentStructuredOutput):
    """Backwards compatible alias for AgentStructuredOutput."""
    pass

