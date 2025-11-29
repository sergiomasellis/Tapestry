"""
Pytest configuration and fixtures for testing.
"""

import os
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment variables BEFORE importing app modules
os.environ["SECRET_KEY"] = "test-secret-key-for-testing-minimum-32-characters-long"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["ENVIRONMENT"] = "development"
os.environ["LOG_LEVEL"] = "WARNING"
os.environ["LOG_FORMAT"] = "text"
os.environ["RATE_LIMIT_ENABLED"] = "false"

from app.main import app
from app.db.session import Base, get_db


# Create test database engine
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db() -> Generator:
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create test database tables before running tests."""
    Base.metadata.create_all(bind=test_engine)
    yield
    # Clean up after all tests
    Base.metadata.drop_all(bind=test_engine)
    # Remove test database file
    if os.path.exists("./test.db"):
        os.remove("./test.db")


@pytest.fixture(scope="function")
def db_session() -> Generator:
    """Provide a test database session."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session) -> Generator:
    """Provide a test client with database session override."""
    def override_get_db_fixture():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db_fixture
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user_data():
    """Provide test user data."""
    return {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "role": "parent"
    }


@pytest.fixture
def auth_headers(client, test_user_data):
    """Create a test user and return auth headers."""
    # Create user
    response = client.post("/api/auth/signup", json=test_user_data)
    if response.status_code == 400:
        # User might already exist, try login
        response = client.post("/api/auth/login", json={
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        })
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

