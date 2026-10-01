"""
Unit tests for error handling & edge cases in AgriSentinel X Agent.
Verifies behavior under Weather API timeout, HTTP error, missing LLM API key, and malformed request payload.
"""

import pytest
from unittest.mock import patch
import requests

from agri_agent.agent import AgriSentinelAgent
from agri_agent.models import AgentStatus
from agri_agent.gemini_provider import GeminiProvider, GroundedTemplateEngine


def test_weather_api_timeout_handling():
    """Verify that when weather API times out, the agent handles it gracefully without fake data."""
    agent = AgriSentinelAgent()

    with patch("requests.Session.get") as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Connection timed out after 5s")

        res = agent.process_request({
            "query": "Check weather for my farm",
            "latitude": 19.0760,
            "longitude": 72.8777,
        })

        assert res.weather_evidence is None
        assert res.error_status is not None
        assert "timed out" in res.error_status
        assert any("Weather evidence is currently unavailable" in note for note in res.uncertainty_notes)
        assert res.status in [AgentStatus.PARTIAL_SUCCESS, AgentStatus.ERROR]


def test_weather_api_http_500_handling():
    """Verify handling of external Weather API server failure."""
    agent = AgriSentinelAgent()

    with patch("requests.Session.get") as mock_get:
        mock_resp = patch("requests.Response").start()
        mock_resp.status_code = 500
        mock_resp.text = "Internal Server Error"
        mock_get.return_value = mock_resp

        res = agent.process_request({
            "query": "Check weather for my farm",
            "latitude": 19.0760,
            "longitude": 72.8777,
        })

        assert res.weather_evidence is None
        assert "HTTP 500" in res.error_status


def test_gemini_fallback_when_key_missing(monkeypatch):
    """Verify seamless fallback to GroundedTemplateEngine when GEMINI_API_KEY is missing."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)

    provider = GeminiProvider()
    assert provider.is_available is False

    explanation = provider.generate(
        query="What is the weather summary?",
        missing_info=["latitude", "longitude"],
    )

    assert "additional details" in explanation
    assert "latitude" in explanation
