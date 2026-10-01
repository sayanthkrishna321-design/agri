"""
Django settings for AgriSentinel X backend project.

Environment variables (copy .env.example to .env and fill real values):
    SECRET_KEY        — required in production
    DEBUG             — True for dev, False for production/demo
    ALLOWED_HOSTS     — comma-separated list of allowed hosts
    DB_ENGINE         — 'mysql' (Docker/submission) or 'sqlite3' (local dev)
    DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT  — MySQL credentials
    GROQ_API_KEY      — Groq API key (https://console.groq.com/keys)
"""

import os
import pymysql
pymysql.install_as_MySQLdb()
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent.parent

# ---------------------------------------------------------------------------
# sys.path injection (required until project is restructured as a package)
# ---------------------------------------------------------------------------
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

RAG_DIR = ROOT_DIR / "AgriSentinelX" / "AgriSentinelX"
if RAG_DIR.exists() and str(RAG_DIR) not in sys.path:
    sys.path.insert(0, str(RAG_DIR))

# ---------------------------------------------------------------------------
# Security settings
# ---------------------------------------------------------------------------
_raw_secret = os.getenv("SECRET_KEY", "")
if not _raw_secret or _raw_secret.startswith("django-insecure"):
    if os.getenv("DEBUG", "True").lower() not in ["true", "1", "yes"]:
        raise RuntimeError(
            "SECRET_KEY must be set to a strong random value in production/demo. "
            "Never use the insecure default in deployment."
        )
    _raw_secret = _raw_secret or "django-insecure-dev-only-placeholder"

SECRET_KEY = _raw_secret
DEBUG = os.getenv("DEBUG", "True").lower() in ["true", "1", "yes"]

_allowed_raw = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1" if not DEBUG else "*")
ALLOWED_HOSTS = [h.strip() for h in _allowed_raw.split(",") if h.strip()]

# ---------------------------------------------------------------------------
# Application definition
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "core",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "core.middleware.CorrelationIDMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# CORS – restrict in production
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = [
        h.strip() for h in os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if h.strip()
    ]
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

# ---------------------------------------------------------------------------
# Database — MySQL required for the submission profile.
# ---------------------------------------------------------------------------
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite3").lower()
DB_NAME = os.getenv("DB_NAME", "agrisentinel")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "3306")

if DB_ENGINE == "mysql":
    # Fail clearly if the MySQL driver is missing — do NOT silently fall back.
    try:
        import MySQLdb  # noqa: F401
    except ImportError:
        raise RuntimeError(
            "DB_ENGINE=mysql is configured but the MySQL Python driver (mysqlclient) "
            "is not installed. Run: pip install mysqlclient\n"
            "If you intend to use SQLite for local dev, set DB_ENGINE=sqlite3 in .env."
        )
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST,
            "PORT": DB_PORT,
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }
    logger.info("Database: MySQL (%s@%s:%s/%s)", DB_USER, DB_HOST, DB_PORT, DB_NAME)
else:
    # SQLite — acceptable for local development only, NOT for the submission demo.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
    logger.warning(
        "Database: SQLite (local dev mode). "
        "Set DB_ENGINE=mysql for the hackathon submission demo."
    )

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------------------------------------------------------
# Internationalization
# ---------------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
}

# ---------------------------------------------------------------------------
# LLM token/cost controls (from .env)
# LLM Provider: Groq (llama-3.3-70b-versatile)
# ---------------------------------------------------------------------------
MAX_INPUT_TOKENS = int(os.getenv("MAX_INPUT_TOKENS", "6000"))
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "1000"))

# ---------------------------------------------------------------------------
# Structured logging with correlation IDs
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "format": (
                "%(asctime)s level=%(levelname)s logger=%(name)s "
                "request_id=%(request_id)s session_id=%(session_id)s "
                "%(message)s"
            ),
        },
        "simple": {
            "format": "%(asctime)s %(levelname)s [%(name)s] %(message)s",
        },
    },
    "filters": {
        "correlation_id": {
            "()": "django.utils.log.CallbackFilter",
            # Inject default values so format string always works even without middleware
            "callback": lambda record: (
                setattr(record, "request_id", getattr(record, "request_id", "-")) or
                setattr(record, "session_id", getattr(record, "session_id", "-")) or True
            ),
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "filters": ["correlation_id"],
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "django.request": {"handlers": ["console"], "level": "ERROR", "propagate": False},
        "agri_agent": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "rag": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "core": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}