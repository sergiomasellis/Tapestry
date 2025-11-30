"""
Security middleware for the application.
Includes security headers, request ID tracking, and HTTPS enforcement.
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from .logging_config import set_request_id

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds security headers to all responses.
    Implements OWASP security header recommendations.
    """

    def __init__(
        self,
        app: ASGIApp,
        enable_hsts: bool = True,
        enable_csp: bool = True,
        environment: str = "production",
    ):
        super().__init__(app)
        self.enable_hsts = enable_hsts
        self.enable_csp = enable_csp
        self.environment = environment

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # X-Content-Type-Options - Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # X-Frame-Options - Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # X-XSS-Protection - Legacy XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer-Policy - Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions-Policy - Control browser features
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
            "magnetometer=(), microphone=(), payment=(), usb=()"
        )

        # HSTS - Force HTTPS (only in production)
        if self.enable_hsts and self.environment == "production":
            # max-age: 2 years, includeSubDomains, preload-ready
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )

        # Content-Security-Policy
        if self.enable_csp:
            # Strict CSP for API responses
            response.headers["Content-Security-Policy"] = (
                "default-src 'none'; frame-ancestors 'none'; form-action 'none'"
            )

        return response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds request ID tracking.
    Extracts request ID from X-Request-ID header or generates a new one.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get request ID from header or generate new one
        incoming_request_id = request.headers.get("X-Request-ID")
        request_id = set_request_id(incoming_request_id)

        # Store in request state for access in routes
        request.state.request_id = request_id

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that logs all requests and responses.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Log request
        logger.info(
            "Request started",
            extra={
                "method": request.method,
                "path": str(request.url.path),
                "query": str(request.url.query),
                "client_host": request.client.host if request.client else "unknown",
            },
        )

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log response
        log_method = logger.warning if response.status_code >= 400 else logger.info
        log_method(
            "Request completed",
            extra={
                "method": request.method,
                "path": str(request.url.path),
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )

        return response


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware that redirects HTTP to HTTPS in production.
    Checks X-Forwarded-Proto header for load balancer/proxy setups.
    """

    def __init__(self, app: ASGIApp, enabled: bool = True):
        super().__init__(app)
        self.enabled = enabled

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if not self.enabled:
            return await call_next(request)

        # Check if request is already HTTPS
        forwarded_proto = request.headers.get("X-Forwarded-Proto", "http")
        scheme = request.url.scheme

        if forwarded_proto == "https" or scheme == "https":
            return await call_next(request)

        # Allow health checks over HTTP
        if request.url.path == "/healthz":
            return await call_next(request)

        # Redirect to HTTPS
        https_url = request.url.replace(scheme="https")
        return Response(status_code=301, headers={"Location": str(https_url)})
