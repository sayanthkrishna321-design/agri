"""
Open-Meteo Weather Tool for AgriSentinel X.
Fetches historical and forecast weather metrics with validation, timeouts, and structured outputs.
"""

import requests
from datetime import datetime, date, timedelta, timezone as dt_timezone
from typing import Optional, List, Dict, Any, Tuple
import logging

from agri_agent.config import (
    OPEN_METEO_FORECAST_URL,
    OPEN_METEO_ARCHIVE_URL,
    DEFAULT_TIMEOUT_SECONDS,
)
from agri_agent.exceptions import WeatherValidationError, WeatherAPIError
from agri_agent.models import (
    WeatherRequest,
    WeatherResponse,
    DailyWeatherMetrics,
    WeatherSummary,
    WeatherMode,
)

logger = logging.getLogger(__name__)


class WeatherTool:
    """
    Tool for interacting with Open-Meteo APIs (Forecast & Historical Archive).
    """

    def __init__(self, timeout: float = DEFAULT_TIMEOUT_SECONDS, session: Optional[requests.Session] = None):
        self.timeout = timeout
        self.session = session or requests.Session()

    def _determine_mode_and_endpoints(
        self, start_d: date, end_d: date, today: date
    ) -> Tuple[WeatherMode, str, List[str]]:
        """
        Determines query mode, primary API endpoint, and warnings based on date range relative to today.
        """
        warnings = []
        # Historical: entire date range is before today
        if end_d < today:
            mode = WeatherMode.HISTORICAL
            # Open-Meteo forecast endpoint handles past_days up to 14 days back; older requires archive API
            days_ago = (today - start_d).days
            if days_ago > 14:
                endpoint = OPEN_METEO_ARCHIVE_URL
                source = "Open-Meteo Archive API"
            else:
                endpoint = OPEN_METEO_FORECAST_URL
                source = "Open-Meteo Forecast API (Recent Past)"
        # Forecast: start date is today or in the future
        elif start_d >= today:
            mode = WeatherMode.FORECAST
            endpoint = OPEN_METEO_FORECAST_URL
            source = "Open-Meteo Forecast API"
            warnings.append("Requested period consists of forecast predictions, not verified historical observations.")
        # Hybrid: spans past and future
        else:
            mode = WeatherMode.HYBRID
            endpoint = OPEN_METEO_FORECAST_URL
            source = "Open-Meteo Forecast API (Hybrid)"
            warnings.append("Requested period spans both historical observations and upcoming weather forecasts.")

        return mode, source, warnings

    def fetch_weather(
        self,
        latitude: float,
        longitude: float,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        timezone: str = "auto",
        reference_date: Optional[date] = None,
    ) -> WeatherResponse:
        """
        Fetches daily weather metrics for specified coordinates and date range.

        Args:
            latitude: Latitude (-90 to 90)
            longitude: Longitude (-180 to 180)
            start_date: Start date YYYY-MM-DD (Defaults to 7 days prior to reference date)
            end_date: End date YYYY-MM-DD (Defaults to reference date)
            timezone: Timezone string (default 'auto')
            reference_date: Reference 'today' date for testing or deterministic calculations

        Returns:
            WeatherResponse Pydantic model with structured metrics and metadata.

        Raises:
            WeatherValidationError: If input validation fails.
            WeatherAPIError: If API request times out or returns HTTP/schema error.
        """
        today = reference_date or date.today()

        # Fill default dates if missing
        if not end_date:
            end_date = today.strftime("%Y-%m-%d")
        if not start_date:
            start_d_default = datetime.strptime(end_date, "%Y-%m-%d").date() - timedelta(days=7)
            start_date = start_d_default.strftime("%Y-%m-%d")

        # Validate inputs via Pydantic model
        try:
            req = WeatherRequest(
                latitude=latitude,
                longitude=longitude,
                start_date=start_date,
                end_date=end_date,
                timezone=timezone,
            )
        except Exception as e:
            raise WeatherValidationError(f"Invalid weather request parameters: {str(e)}") from e

        start_d = datetime.strptime(req.start_date, "%Y-%m-%d").date()
        end_d = datetime.strptime(req.end_date, "%Y-%m-%d").date()

        mode, data_source, warnings = self._determine_mode_and_endpoints(start_d, end_d, today)

        # Select API endpoint
        if mode == WeatherMode.HISTORICAL and (today - start_d).days > 14:
            url = OPEN_METEO_ARCHIVE_URL
        else:
            url = OPEN_METEO_FORECAST_URL

        params: Dict[str, Any] = {
            "latitude": req.latitude,
            "longitude": req.longitude,
            "start_date": req.start_date,
            "end_date": req.end_date,
            "daily": [
                "precipitation_sum",
                "temperature_2m_max",
                "temperature_2m_min",
                "temperature_2m_mean",
                "wind_speed_10m_max",
            ],
            "timezone": req.timezone,
        }

        logger.info("Requesting weather data from %s for lat=%s, lon=%s", url, req.latitude, req.longitude)

        try:
            response = self.session.get(url, params=params, timeout=self.timeout)
        except requests.exceptions.Timeout as te:
            logger.warning("Weather API request timed out: %s", str(te))
            raise WeatherAPIError("Weather API request timed out", status_code=504) from te
        except requests.exceptions.RequestException as re:
            logger.warning("Weather API network error: %s", str(re))
            raise WeatherAPIError(f"Weather API network error: {str(re)}", status_code=502) from re

        if response.status_code != 200:
            raise WeatherAPIError(f"Weather API returned HTTP {response.status_code}", status_code=response.status_code)

        try:
            data = response.json()
        except Exception as je:
            raise WeatherAPIError(f"Failed to parse JSON response: {str(je)}", status_code=502) from je

        if "daily" not in data or not isinstance(data["daily"], dict):
            raise WeatherAPIError("Weather API response missing 'daily' data object", status_code=502)

        daily_raw = data["daily"]
        time_list = daily_raw.get("time", [])

        if not time_list:
            raise WeatherAPIError("Weather API returned empty daily metrics series", status_code=502)

        precip_list = daily_raw.get("precipitation_sum", [])
        tmax_list = daily_raw.get("temperature_2m_max", [])
        tmin_list = daily_raw.get("temperature_2m_min", [])
        tmean_list = daily_raw.get("temperature_2m_mean", [None] * len(time_list))
        wind_list = daily_raw.get("wind_speed_10m_max", [None] * len(time_list))

        daily_metrics: List[DailyWeatherMetrics] = []
        total_precip = 0.0
        max_temp = -999.0
        min_temp = 999.0
        temp_sum = 0.0
        temp_count = 0
        max_wind = 0.0
        dry_days = 0
        heavy_rain_days = 0

        for i, dt_str in enumerate(time_list):
            dt_obj = datetime.strptime(dt_str, "%Y-%m-%d").date()
            is_fc = dt_obj > today

            precip = float(precip_list[i]) if i < len(precip_list) and precip_list[i] is not None else 0.0
            tmax = float(tmax_list[i]) if i < len(tmax_list) and tmax_list[i] is not None else 0.0
            tmin = float(tmin_list[i]) if i < len(tmin_list) and tmin_list[i] is not None else 0.0
            tmean = float(tmean_list[i]) if i < len(tmean_list) and tmean_list[i] is not None else round((tmax + tmin) / 2.0, 1)
            wind = float(wind_list[i]) if i < len(wind_list) and wind_list[i] is not None else 0.0

            # Aggregations
            total_precip += precip
            if tmax > max_temp:
                max_temp = tmax
            if tmin < min_temp:
                min_temp = tmin
            temp_sum += tmean
            temp_count += 1
            if wind > max_wind:
                max_wind = wind

            if precip < 1.0:
                dry_days += 1
            if precip >= 50.0:
                heavy_rain_days += 1

            daily_metrics.append(
                DailyWeatherMetrics(
                    date=dt_str,
                    precipitation_mm=round(precip, 2),
                    temp_max_c=round(tmax, 2),
                    temp_min_c=round(tmin, 2),
                    temp_mean_c=round(tmean, 2),
                    max_wind_speed_kmh=round(wind, 2),
                    is_forecast=is_fc,
                )
            )

        avg_temp = round(temp_sum / temp_count, 2) if temp_count > 0 else 0.0
        if max_temp == -999.0:
            max_temp = 0.0
        if min_temp == 999.0:
            min_temp = 0.0

        summary = WeatherSummary(
            total_precipitation_mm=round(total_precip, 2),
            max_temperature_c=round(max_temp, 2),
            min_temperature_c=round(min_temp, 2),
            avg_temperature_c=avg_temp,
            max_wind_speed_kmh=round(max_wind, 2),
            total_days=len(daily_metrics),
            dry_days_count=dry_days,
            heavy_rain_days_count=heavy_rain_days,
        )

        elevation = data.get("elevation")

        return WeatherResponse(
            latitude=data.get("latitude", req.latitude),
            longitude=data.get("longitude", req.longitude),
            elevation=elevation,
            start_date=req.start_date,
            end_date=req.end_date,
            mode=mode,
            data_source=data_source,
            retrieved_at=datetime.now(dt_timezone.utc).isoformat().replace("+00:00", "Z"),
            daily_data=daily_metrics,
            summary=summary,
            warnings=warnings,
        )


def get_weather(
    latitude: float,
    longitude: float,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    timezone: str = "auto",
    timeout: float = DEFAULT_TIMEOUT_SECONDS,
    reference_date: Optional[date] = None,
) -> WeatherResponse:
    """
    Convenience function to retrieve weather metrics for latitude/longitude and optional date range.

    Example Usage:
        from agri_agent.weather import get_weather

        res = get_weather(latitude=19.0760, longitude=72.8777, start_date="2026-09-01", end_date="2026-09-07")
        print(f"Total precipitation: {res.summary.total_precipitation_mm} mm")
    """
    tool = WeatherTool(timeout=timeout)
    return tool.fetch_weather(
        latitude=latitude,
        longitude=longitude,
        start_date=start_date,
        end_date=end_date,
        timezone=timezone,
        reference_date=reference_date,
    )
