"""
Configuration settings for AgriSentinel X agent module.
All configurable values read from environment variables with safe defaults.

LLM Provider: Groq (https://console.groq.com)
Get your free API key at: https://console.groq.com/keys
"""

import os

# ---------------------------------------------------------------------------
# Open-Meteo API endpoints
# ---------------------------------------------------------------------------
OPEN_METEO_FORECAST_URL: str = os.getenv(
    "OPEN_METEO_FORECAST_URL", "https://api.open-meteo.com/v1/forecast"
)
OPEN_METEO_ARCHIVE_URL: str = os.getenv(
    "OPEN_METEO_ARCHIVE_URL", "https://archive-api.open-meteo.com/v1/archive"
)

# ---------------------------------------------------------------------------
# HTTP settings
# ---------------------------------------------------------------------------
DEFAULT_TIMEOUT_SECONDS: float = float(os.getenv("AGRI_WEATHER_TIMEOUT", "5.0"))
MAX_RETRIES: int = int(os.getenv("AGRI_WEATHER_MAX_RETRIES", "2"))

# ---------------------------------------------------------------------------
# Groq API settings
# ---------------------------------------------------------------------------
GROQ_API_KEY_ENV_VARS = ["GROQ_API_KEY"]
DEFAULT_GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# Available Groq models (pick based on speed vs quality needs):
#   llama-3.3-70b-versatile   — best quality, recommended
#   llama-3.1-8b-instant      — fastest, lowest latency
#   mixtral-8x7b-32768        — large context window (32k tokens)
#   gemma2-9b-it              — lightweight

# ---------------------------------------------------------------------------
# Token cap enforcement
# ---------------------------------------------------------------------------
MAX_INPUT_TOKENS: int = int(os.getenv("MAX_INPUT_TOKENS", "6000"))
MAX_OUTPUT_TOKENS: int = int(os.getenv("MAX_OUTPUT_TOKENS", "1000"))

# ---------------------------------------------------------------------------
# Cost constants — Groq pricing (USD per 1M tokens)
# Groq offers generous free tier; update if pricing changes.
# https://groq.com/pricing/
# ---------------------------------------------------------------------------
COST_PER_1M_INPUT_TOKENS: float = 0.059   # $0.059 / 1M input tokens (llama-3.3-70b)
COST_PER_1M_OUTPUT_TOKENS: float = 0.079  # $0.079 / 1M output tokens (llama-3.3-70b)

# ---------------------------------------------------------------------------
# Insurance Rule Notices
# ---------------------------------------------------------------------------
DEMO_RULES_NOTICE: str = (
    "DEMO/SAMPLE RULES NOTICE: These rules are explicit sample rules for system demonstration. "
    "They must be verified against official scheme documents (e.g. PMFBY operational guidelines) "
    "before use in formal loss adjustment or claim processing."
)

WEATHER_LOSS_DISCLAIMER: str = (
    "POLICY GUARDRAIL DISCLAIMER: Weather data alone does NOT prove crop loss or guarantee claim approval. "
    "Weather metrics provide auxiliary supporting evidence. Official claim evaluation requires "
    "field loss assessment, local government notification, and scheme compliance verification."
)
