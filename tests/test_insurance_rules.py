"""
Unit tests for AgriSentinel X Deterministic Insurance-Rule Checker.
Tests explicit sample rules, edge cases, and mandatory policy guardrails.
"""

import pytest
from datetime import datetime

from agri_agent.insurance_rules import evaluate_insurance_rules, InsuranceRuleEngine
from agri_agent.models import (
    WeatherResponse,
    WeatherSummary,
    WeatherMode,
    DailyWeatherMetrics,
    InsuranceRuleResponse,
)
from agri_agent.exceptions import InsuranceValidationError
from agri_agent.config import DEMO_RULES_NOTICE, WEATHER_LOSS_DISCLAIMER


@pytest.fixture
def sample_drought_weather():
    """Weather data simulating drought conditions (low rainfall)."""
    return WeatherResponse(
        latitude=19.076,
        longitude=72.8777,
        start_date="2026-09-01",
        end_date="2026-09-10",
        mode=WeatherMode.HISTORICAL,
        data_source="Open-Meteo Archive API",
        retrieved_at="2026-09-30T12:00:00Z",
        daily_data=[],
        summary=WeatherSummary(
            total_precipitation_mm=5.2,
            max_temperature_c=34.5,
            min_temperature_c=25.0,
            avg_temperature_c=29.5,
            max_wind_speed_kmh=12.0,
            total_days=10,
            dry_days_count=9,
            heavy_rain_days_count=0,
        ),
        warnings=[],
    )


@pytest.fixture
def sample_flood_weather():
    """Weather data simulating flood / heavy rainfall conditions."""
    return WeatherResponse(
        latitude=19.076,
        longitude=72.8777,
        start_date="2026-09-01",
        end_date="2026-09-07",
        mode=WeatherMode.HISTORICAL,
        data_source="Open-Meteo Forecast API (Recent Past)",
        retrieved_at="2026-09-30T12:00:00Z",
        daily_data=[],
        summary=WeatherSummary(
            total_precipitation_mm=165.0,
            max_temperature_c=29.0,
            min_temperature_c=23.0,
            avg_temperature_c=26.0,
            max_wind_speed_kmh=35.0,
            total_days=7,
            dry_days_count=1,
            heavy_rain_days_count=2,
        ),
        warnings=[],
    )


def test_drought_rule_pass(sample_drought_weather):
    """Test that drought claim passes when total rainfall is low."""
    res = evaluate_insurance_rules(
        crop_name="Rice",
        claimed_cause="Drought",
        weather_data=sample_drought_weather,
    )
    assert isinstance(res, InsuranceRuleResponse)
    assert res.is_potentially_eligible is True
    assert res.crop_name == "Rice"
    assert len(res.rule_evaluations) == 1
    assert res.rule_evaluations[0].rule_id == "RULE_DROUGHT_DEFICIT"
    assert res.rule_evaluations[0].passed is True


def test_drought_rule_fail(sample_flood_weather):
    """Test that drought claim fails when high rainfall is recorded."""
    res = evaluate_insurance_rules(
        crop_name="Wheat",
        claimed_cause="Drought Deficit",
        weather_data=sample_flood_weather,
    )
    assert res.is_potentially_eligible is False
    assert res.rule_evaluations[0].passed is False


def test_flood_rule_pass(sample_flood_weather):
    """Test excessive rainfall rule passing when heavy rain days exist."""
    res = evaluate_insurance_rules(
        crop_name="Cotton",
        claimed_cause="Heavy Rainfall Inundation",
        weather_data=sample_flood_weather,
    )
    assert res.is_potentially_eligible is True
    assert res.rule_evaluations[0].rule_id == "RULE_EXCESSIVE_RAINFALL_FLOOD"
    assert res.rule_evaluations[0].passed is True


def test_flood_rule_fail(sample_drought_weather):
    """Test excessive rainfall rule failing when rainfall is negligible."""
    res = evaluate_insurance_rules(
        crop_name="Maize",
        claimed_cause="Flood",
        weather_data=sample_drought_weather,
    )
    assert res.is_potentially_eligible is False
    assert res.rule_evaluations[0].passed is False


def test_heatwave_rule():
    """Test extreme temperature heatwave rule."""
    weather = WeatherResponse(
        latitude=19.0,
        longitude=72.0,
        start_date="2026-09-01",
        end_date="2026-09-05",
        mode=WeatherMode.HISTORICAL,
        data_source="Test",
        retrieved_at="2026-09-30T12:00:00Z",
        summary=WeatherSummary(
            total_precipitation_mm=0.0,
            max_temperature_c=41.5,
            min_temperature_c=28.0,
            avg_temperature_c=34.0,
            max_wind_speed_kmh=10.0,
            total_days=5,
            dry_days_count=5,
            heavy_rain_days_count=0,
        ),
    )
    res = evaluate_insurance_rules(crop_name="Sugarcane", claimed_cause="Heatwave", weather_data=weather)
    assert res.is_potentially_eligible is True
    assert res.rule_evaluations[0].rule_id == "RULE_EXTREME_TEMPERATURE"


def test_mandatory_disclaimers_and_guardrails(sample_drought_weather):
    """Verify explicit demo rule labels and non-guarantee guardrails."""
    res = evaluate_insurance_rules(
        crop_name="Paddy",
        claimed_cause="Drought",
        weather_data=sample_drought_weather,
    )
    assert res.confidence == "DEMO_RULE_EVALUATION"
    assert res.verified_against_official_documents is False
    assert DEMO_RULES_NOTICE in res.disclaimer
    assert WEATHER_LOSS_DISCLAIMER in res.disclaimer
    assert any("72-HOUR" in note for note in res.compliance_notes)
    assert any("FIELD LOSS" in note for note in res.compliance_notes)


def test_validation_missing_crop_name():
    """Test validation when crop name is empty."""
    with pytest.raises(InsuranceValidationError) as exc:
        evaluate_insurance_rules(crop_name="", claimed_cause="Drought")
    assert "Crop name must be provided" in str(exc.value)


def test_validation_missing_claimed_cause():
    """Test validation when claimed cause is empty."""
    with pytest.raises(InsuranceValidationError) as exc:
        evaluate_insurance_rules(crop_name="Wheat", claimed_cause="   ")
    assert "Claimed cause of loss must be provided" in str(exc.value)
