"""
Unit tests for AgriSentinel X Weather Tool.
All HTTP calls are mocked to ensure tests do not depend on network connectivity.
"""

import pytest
from unittest.mock import MagicMock, patch
from datetime import date
import requests

from agri_agent.weather import get_weather, WeatherTool
from agri_agent.models import WeatherResponse, WeatherMode
from agri_agent.exceptions import WeatherValidationError, WeatherAPIError


@pytest.fixture
def mock_open_meteo_success():
    """Sample successful payload matching Open-Meteo response structure."""
    return {
        "latitude": 19.076,
        "longitude": 72.8777,
        "elevation": 14.0,
        "timezone": "GMT",
        "daily": {
            "time": ["2026-09-01", "2026-09-02", "2026-09-03"],
            "precipitation_sum": [12.5, 0.0, 65.0],
            "temperature_2m_max": [31.2, 32.5, 29.8],
            "temperature_2m_min": [24.1, 24.8, 23.5],
            "temperature_2m_mean": [27.65, 28.65, 26.65],
            "wind_speed_10m_max": [15.2, 12.0, 22.4],
        },
    }


def test_get_weather_success_recent_past(mock_open_meteo_success):
    """Test get_weather for a past period using mocked HTTP response."""
    ref_date = date(2026, 9, 10)

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_open_meteo_success
        mock_get.return_value = mock_resp

        result = get_weather(
            latitude=19.0760,
            longitude=72.8777,
            start_date="2026-09-01",
            end_date="2026-09-03",
            reference_date=ref_date,
        )

        assert isinstance(result, WeatherResponse)
        assert result.latitude == 19.076
        assert result.longitude == 72.8777
        assert result.summary.total_precipitation_mm == 77.5  # 12.5 + 0.0 + 65.0
        assert result.summary.max_temperature_c == 32.5
        assert result.summary.heavy_rain_days_count == 1  # 65.0 >= 50.0
        assert result.summary.dry_days_count == 1  # 0.0 < 1.0
        assert len(result.daily_data) == 3
        assert result.daily_data[0].is_forecast is False


def test_get_weather_historical_archive(mock_open_meteo_success):
    """Test routing to archive endpoint when start date is > 14 days in the past."""
    ref_date = date(2026, 9, 30)

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_open_meteo_success
        mock_get.return_value = mock_resp

        result = get_weather(
            latitude=19.0760,
            longitude=72.8777,
            start_date="2026-08-01",
            end_date="2026-08-03",
            reference_date=ref_date,
        )

        assert result.data_source == "Open-Meteo Archive API"
        assert result.mode == WeatherMode.HISTORICAL
        assert "archive-api.open-meteo.com" in mock_get.call_args[0][0]


def test_get_weather_forecast_mode(mock_open_meteo_success):
    """Test get_weather for future forecast period."""
    ref_date = date(2026, 9, 1)

    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_open_meteo_success
        mock_get.return_value = mock_resp

        result = get_weather(
            latitude=19.0760,
            longitude=72.8777,
            start_date="2026-09-05",
            end_date="2026-09-07",
            reference_date=ref_date,
        )

        assert result.mode == WeatherMode.FORECAST
        assert len(result.warnings) > 0
        assert "forecast predictions" in result.warnings[0]


def test_validation_invalid_latitude():
    """Test input validation for out-of-bounds latitude."""
    with pytest.raises(WeatherValidationError) as exc:
        get_weather(latitude=105.0, longitude=72.0)
    assert "Latitude must be between -90.0 and 90.0" in str(exc.value)


def test_validation_invalid_longitude():
    """Test input validation for out-of-bounds longitude."""
    with pytest.raises(WeatherValidationError) as exc:
        get_weather(latitude=19.0, longitude=-200.0)
    assert "Longitude must be between -180.0 and 180.0" in str(exc.value)


def test_validation_invalid_date_range():
    """Test validation when start_date is after end_date."""
    with pytest.raises(WeatherValidationError) as exc:
        get_weather(
            latitude=19.0,
            longitude=72.0,
            start_date="2026-09-10",
            end_date="2026-09-01",
        )
    assert "start_date (2026-09-10) cannot be after end_date (2026-09-01)" in str(exc.value)


def test_validation_invalid_date_format():
    """Test validation for non-ISO date string."""
    with pytest.raises(WeatherValidationError) as exc:
        get_weather(
            latitude=19.0,
            longitude=72.0,
            start_date="10/09/2026",
            end_date="15/09/2026",
        )
    assert "must be in YYYY-MM-DD format" in str(exc.value)


def test_api_timeout_error():
    """Test handling of HTTP connection timeout."""
    with patch("requests.Session.get") as mock_get:
        mock_get.side_effect = requests.exceptions.Timeout("Connection timed out after 5s")

        with pytest.raises(WeatherAPIError) as exc:
            get_weather(latitude=19.0760, longitude=72.8777)

        assert exc.value.status_code == 504
        assert "timed out" in exc.value.message


def test_api_http_error():
    """Test handling of HTTP 400 Bad Request error response."""
    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json.return_value = {"error": True, "reason": "Latitude must be in range [-90; 90]"}
        mock_get.return_value = mock_resp

        with pytest.raises(WeatherAPIError) as exc:
            get_weather(latitude=19.0, longitude=72.0)

        assert exc.value.status_code == 400
        assert "HTTP 400" in exc.value.message


def test_api_malformed_json():
    """Test handling when API returns non-JSON or invalid schema."""
    with patch("requests.Session.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.side_effect = ValueError("Invalid JSON string")
        mock_get.return_value = mock_resp

        with pytest.raises(WeatherAPIError) as exc:
            get_weather(latitude=19.0, longitude=72.0)

        assert exc.value.status_code == 502
        assert "Failed to parse JSON" in exc.value.message
