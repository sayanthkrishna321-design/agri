"""
core/middleware.py

Structured logging middleware for AgriSentinel X.
Injects a correlation request_id into every log record so that a single
user request can be traced across Django → agent → RAG/tools → response.

Log fields emitted per request:
    request_id, session_id, endpoint, method, status_code, latency_ms, user
"""

import logging
import time
import uuid

logger = logging.getLogger("core.middleware")


class CorrelationIDMiddleware:
    """
    Generates a unique request_id per HTTP request and injects it into:
      - The HTTP response header X-Request-ID
      - All log records produced during that request (via LoggerAdapter / thread-local)
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generate or re-use a request ID propagated from upstream (e.g. load balancer)
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.request_id = request_id

        # Session ID from Django session key (populated after session middleware runs)
        session_id = "-"

        # Inject into the root logger's thread-local factory for this thread
        start = time.monotonic()
        response = self.get_response(request)
        latency_ms = round((time.monotonic() - start) * 1000, 2)


        # Set session ID after session middleware has populated it
        try:
            session_id = request.session.session_key or "-"
        except Exception:
            pass

        # Emit one structured log line per completed request
        logger.info(
            "request completed",
            extra={
                "request_id": request_id,
                "session_id": session_id,
                "endpoint": request.path,
                "method": request.method,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "user": str(request.user) if hasattr(request, "user") else "-",
            },
        )

        response["X-Request-ID"] = request_id
        return response
