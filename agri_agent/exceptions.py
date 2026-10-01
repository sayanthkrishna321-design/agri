"""
Custom exceptions for AgriSentinel X module.
"""

class AgriAgentError(Exception):
    """Base exception for all AgriSentinel agent modules."""
    pass


class WeatherError(AgriAgentError):
    """Base exception for weather tool errors."""
    pass


class WeatherValidationError(WeatherError):
    """Raised when latitude, longitude, dates or weather inputs fail validation."""
    pass


class WeatherAPIError(WeatherError):
    """Raised when external Weather API requests fail (timeout, 4xx/5xx HTTP, invalid JSON)."""

    def __init__(self, message: str, status_code: int = None, details: str = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


class InsuranceRuleError(AgriAgentError):
    """Base exception for insurance rule engine errors."""
    pass


class InsuranceValidationError(InsuranceRuleError):
    """Raised when insurance evaluation inputs are invalid or missing required parameters."""
    pass


class AgentOrchestrationError(AgriAgentError):
    """Raised when agent intent routing or tool orchestration encounters an unrecoverable failure."""
    pass
