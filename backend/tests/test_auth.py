"""
Tests for authentication endpoints.
"""

import pytest


class TestSignup:
    """Tests for user signup."""

    def test_signup_success(self, client):
        """Test successful user signup."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "New User",
                "email": "newuser@example.com",
                "password": "securepassword123",
                "role": "parent",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert len(data["access_token"]) > 0

    def test_signup_duplicate_email(self, client):
        """Test signup with duplicate email fails."""
        user_data = {
            "name": "First User",
            "email": "duplicate@example.com",
            "password": "password123",
            "role": "parent",
        }
        # First signup should succeed
        response = client.post("/api/auth/signup", json=user_data)
        assert response.status_code == 200

        # Second signup with same email should fail
        response = client.post("/api/auth/signup", json=user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    def test_signup_invalid_email(self, client):
        """Test signup with invalid email format."""
        response = client.post(
            "/api/auth/signup",
            json={
                "name": "Test User",
                "email": "not-an-email",
                "password": "password123",
                "role": "parent",
            },
        )
        assert response.status_code == 422


class TestLogin:
    """Tests for user login."""

    def test_login_success(self, client, test_user_data):
        """Test successful login."""
        # First create the user
        client.post("/api/auth/signup", json=test_user_data)

        # Then login
        response = client.post(
            "/api/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

    def test_login_wrong_password(self, client, test_user_data):
        """Test login with wrong password."""
        # First create the user
        client.post("/api/auth/signup", json=test_user_data)

        # Try to login with wrong password
        response = client.post(
            "/api/auth/login",
            json={"email": test_user_data["email"], "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        response = client.post(
            "/api/auth/login",
            json={"email": "nonexistent@example.com", "password": "password123"},
        )
        assert response.status_code == 401


class TestAuthenticated:
    """Tests for authenticated endpoints."""

    def test_get_current_user(self, client, auth_headers):
        """Test getting current user info."""
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "name" in data
        assert "email" in data

    def test_get_current_user_no_token(self, client):
        """Test accessing protected endpoint without token."""
        response = client.get("/api/auth/me")
        assert response.status_code == 403  # Forbidden (no auth header)

    def test_get_current_user_invalid_token(self, client):
        """Test accessing protected endpoint with invalid token."""
        response = client.get(
            "/api/auth/me", headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 401
