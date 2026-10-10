from fastapi import status


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"


def test_leaderboard(client, test_user):
    response = client.get("/api/leaderboard")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "leaderboard" in data
    assert data["total"] >= 1
    assert any(u["username"] == test_user.username for u in data["leaderboard"])


def test_submit_contact(client):
    payload = {
        "name": "Jane Ranger",
        "email": "jane@mangrove-guardians.org",
        "subject": "Community Drone Partnership",
        "message": "We would like to coordinate telemetry data sharing for Pichavaram.",
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["status"] == "success"


def test_get_guardians_seeds_and_returns(client):
    response = client.get("/api/guardians")
    assert response.status_code == status.HTTP_200_OK
    guardians = response.json()
    assert isinstance(guardians, list)
    assert len(guardians) >= 4
    names = [g["name"] for g in guardians]
    assert "Sunderbans Coastal Watch" in names
