"""
Tests for health check endpoints.
"""

import pytest


def test_health_check(client):
    """Test the /healthz endpoint returns ok status."""
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "environment" in data


def test_readiness_check(client):
    """Test the /readyz endpoint returns ready status."""
    response = client.get("/readyz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"


def test_health_includes_request_id(client):
    """Test that responses include X-Request-ID header."""
    response = client.get("/healthz")
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0


def test_health_with_custom_request_id(client):
    """Test that custom X-Request-ID is preserved."""
    custom_id = "test-request-123"
    response = client.get("/healthz", headers={"X-Request-ID": custom_id})
    assert response.headers["X-Request-ID"] == custom_id

