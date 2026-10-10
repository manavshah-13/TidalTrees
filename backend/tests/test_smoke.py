import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"
    assert "TidalTrees" in data.get("service", "")


def test_openapi_schema(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    data = response.json()
    assert data.get("info", {}).get("title") == "TidalTrees API"
    assert "/health" in data.get("paths", {})
    assert "/api/auth/login" in data.get("paths", {})
    assert "/api/leaderboard" in data.get("paths", {})
    assert "/api/reports" in data.get("paths", {})
    assert "/api/contact" in data.get("paths", {})
