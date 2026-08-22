import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_app_starts_successfully():
    """Verify application starts and root endpoint returns online status."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health_endpoint():
    """
    Validate GET /health endpoint returns expected format:
    {"status": "healthy"}
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_health_endpoint_database_failure():
    """Validate GET /health handles database connection failure properly with HTTP 503."""
    with patch("app.routes.health.check_database_connection", return_value=False):
        response = client.get("/health")
        assert response.status_code == 503
        assert response.json() == {"detail": "Database connection failure"}
