"""
Unit tests for AgriSentinel X Agent Orchestrator.
Tests intent classification, missing info detection, tool aggregation,
contradiction detection, fallback narrative, and response schema compliance.
"""

import pytest
from unittest.mock import patch, MagicMock

from agri_agent.agent import AgriSentinelAgent, run_agent
from agri_agent.models import (
    AgentStructuredOutput,
    AgentStatus,
    AgentIntent,
    WeatherResponse,
    WeatherSummary,
    WeatherMode,
)
from agri_agent.gemini_provider import GroundedTemplateEngine


@pytest.fixture
def mock_weather_payload():
    return {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01", "2026-09-02"],
            "precipitation_sum": [10.0, 5.0],
            "temperature_2m_max": [30.0, 31.0],
            "temperature_2m_min": [24.0, 24.5],
            "temperature_2m_mean": [27.0, 27.75],
            "wind_speed_10m_max": [14.0, 15.0],
        },
    }


def test_missing_info_detection():
    """Test missing information detection when required parameters are absent."""
    agent = AgriSentinelAgent()
    # Missing coordinates for weather query
    res = agent.process_request({"query": "What is the weather forecast?"})

    assert res.status == AgentStatus.MISSING_INFO
    assert res.intent == AgentIntent.WEATHER_QUERY
    assert "latitude" in res.missing_information
    assert "longitude" in res.missing_information
    assert len(res.tools_used) == 0


def test_missing_info_insurance():
    """Test missing info detection for insurance query."""
    agent = AgriSentinelAgent()
    res = agent.process_request({"query": "Am I eligible for PMFBY crop insurance claim?"})

    assert res.status == AgentStatus.MISSING_INFO
    assert res.intent == AgentIntent.INSURANCE_ELIGIBILITY
    assert "crop_name" in res.missing_information
    assert "claimed_cause" in res.missing_information


def test_unsupported_query_handling():
    """Test out-of-scope query handling (e.g. stock market)."""
    agent = AgriSentinelAgent()
    res = agent.process_request({"query": "Should I invest in bitcoin or stock market today?"})

    assert res.status == AgentStatus.UNSUPPORTED_QUERY
    assert res.intent == AgentIntent.UNSUPPORTED
    assert "outside agricultural domain" in res.uncertainty_notes[0]
    assert len(res.tools_used) == 0


def test_comprehensive_assessment_success(mock_weather_payload):
    """Test comprehensive evaluation invoking both Weather and Insurance tools."""
    agent = AgriSentinelAgent()

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_weather_payload
        mock_get.return_value = mock_resp

        res = agent.process_request({
            "query": "My rice crop suffered heavy rain, check my weather and insurance eligibility.",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "crop_name": "Rice",
            "claimed_cause": "Heavy Rain",
            "start_date": "2026-09-01",
            "end_date": "2026-09-02",
        })

        assert isinstance(res, AgentStructuredOutput)
        assert res.status == AgentStatus.SUCCESS
        assert "OpenMeteoWeatherTool" in res.tools_used
        assert "DeterministicInsuranceRuleChecker" in res.tools_used
        assert res.weather_evidence is not None
        assert res.insurance_check is not None
        assert len(res.recommended_next_steps) > 0
        assert len(res.disclaimers) > 0


def test_contradiction_detection():
    """Test detection of contradiction between reported drought and high recorded rainfall."""
    agent = AgriSentinelAgent()

    heavy_rain_mock = {
        "latitude": 19.076,
        "longitude": 72.8777,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01"],
            "precipitation_sum": [150.0],
            "temperature_2m_max": [28.0],
            "temperature_2m_min": [23.0],
            "temperature_2m_mean": [25.5],
            "wind_speed_10m_max": [30.0],
        },
    }

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = heavy_rain_mock
        mock_get.return_value = mock_resp

        res = agent.process_request({
            "query": "Check if drought destroyed my wheat crop.",
            "latitude": 19.0760,
            "longitude": 72.8777,
            "crop_name": "Wheat",
            "claimed_cause": "Drought",
            "start_date": "2026-09-01",
            "end_date": "2026-09-01",
        })

        assert res.status == AgentStatus.CONTRADICTION_DETECTED
        assert any("CONTRADICTION DETECTED" in note for note in res.uncertainty_notes)


def test_convenience_entry_point(mock_weather_payload):
    """Test run_agent importable entry point."""
    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_weather_payload
        mock_get.return_value = mock_resp

        res = run_agent(
            query="Give me weather metrics for my farm",
            latitude=19.0760,
            longitude=72.8777,
            start_date="2026-09-01",
            end_date="2026-09-02",
        )

        assert res.intent == AgentIntent.WEATHER_QUERY
        assert res.weather_evidence.summary.total_precipitation_mm == 15.0
