"""
PDF Hackathon Guidelines Compliance Tests for AgriSentinel X.
Specifically verifies:
1. "The LLM handles language. Tools handle facts, math, and decisions."
2. "Proof of origin: Show me an output and prove where each fact came from."
3. Adversarial tests:
   - Profile that qualifies for nothing.
   - Hinglish query handling.
   - Contradictory user input.
"""

import pytest
from unittest.mock import patch, MagicMock

from agri_agent.agent import AgriSentinelAgent, run_agent
from agri_agent.models import AgentStatus, AgentIntent, AgentStructuredOutput
from agri_agent.insurance_rules import evaluate_insurance_rules


def test_proof_of_origin_fact_tracing():
    """Verify that every output contains proof_of_origin tracing facts back to tools/inputs."""
    weather_mock = {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01"],
            "precipitation_sum": [12.0],
            "temperature_2m_max": [31.0],
            "temperature_2m_min": [24.0],
            "temperature_2m_mean": [27.5],
            "wind_speed_10m_max": [15.0],
        },
    }

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = weather_mock
        mock_get.return_value = mock_resp

        res = run_agent(
            query="Check weather and drought insurance for my rice crop",
            latitude=19.0760,
            longitude=72.8777,
            crop_name="Rice",
            claimed_cause="Drought",
            start_date="2026-09-01",
            end_date="2026-09-01",
            land_holding_hectares=1.5,
        )

        assert isinstance(res.proof_of_origin, dict)
        assert "weather_total_rainfall" in res.proof_of_origin
        assert "insurance_eligibility_decision" in res.proof_of_origin
        assert "land_holding_fact" in res.proof_of_origin
        assert "Open-Meteo" in res.proof_of_origin["weather_total_rainfall"]
        assert "RULE_SMALL_FARMER_PRIORITY" in res.proof_of_origin["land_holding_fact"]


def test_adversarial_profile_qualifies_for_nothing():
    """Adversarial test: A user profile that fails all threshold checks deterministically."""
    high_rain_weather = {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01"],
            "precipitation_sum": [150.0],
            "temperature_2m_max": [29.0],
            "temperature_2m_min": [22.0],
            "temperature_2m_mean": [25.5],
            "wind_speed_10m_max": [18.0],
        },
    }

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = high_rain_weather
        mock_get.return_value = mock_resp

        res = run_agent(
            query="Did drought ruin my crop?",
            latitude=19.0760,
            longitude=72.8777,
            crop_name="Wheat",
            claimed_cause="Drought",
            start_date="2026-09-01",
            end_date="2026-09-01",
            land_holding_hectares=5.0,  # Exceeds small farmer 2.0 ha threshold
        )

        # Must fail deterministically
        assert res.insurance_check is not None
        assert res.insurance_check.is_potentially_eligible is False
        assert any(not r.passed for r in res.insurance_check.rule_evaluations)
        # LLM explanation must not claim eligibility
        assert "NOT MET" in res.answer or "UNLIKELY ELIGIBLE" in res.answer or "Exceeded" in res.answer


def test_adversarial_hinglish_query():
    """Adversarial test: Parsing query written in Hinglish."""
    weather_mock = {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01"],
            "precipitation_sum": [85.0],
            "temperature_2m_max": [28.0],
            "temperature_2m_min": [23.0],
            "temperature_2m_mean": [25.5],
            "wind_speed_10m_max": [20.0],
        },
    }

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = weather_mock
        mock_get.return_value = mock_resp

        res = run_agent(
            query="Mera dhan ka fasal heavy baarish se kharab ho gaya, kya bima paise milenge?",
            latitude=19.0760,
            longitude=72.8777,
            crop_name="Dhan",
            claimed_cause="Heavy Baarish",
            start_date="2026-09-01",
            end_date="2026-09-01",
        )

        assert res.intent in [AgentIntent.INSURANCE_ELIGIBILITY, AgentIntent.COMPREHENSIVE_ASSESSMENT]
        assert res.insurance_check.is_potentially_eligible is True


def test_adversarial_contradiction():
    """Adversarial test: User claims flood but weather records 0mm rain."""
    dry_weather = {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01"],
            "precipitation_sum": [0.0],
            "temperature_2m_max": [35.0],
            "temperature_2m_min": [25.0],
            "temperature_2m_mean": [30.0],
            "wind_speed_10m_max": [8.0],
        },
    }

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = dry_weather
        mock_get.return_value = mock_resp

        res = run_agent(
            query="Heavy flooding destroyed my maize crop.",
            latitude=19.0760,
            longitude=72.8777,
            crop_name="Maize",
            claimed_cause="Flood Inundation",
            start_date="2026-09-01",
            end_date="2026-09-01",
        )

        assert res.status == AgentStatus.CONTRADICTION_DETECTED
        assert "contradiction_check" in res.proof_of_origin
