import io
import pytest
from fastapi import status


def test_create_report_success(client, auth_headers):
    payload = {
        "title": "Severe Coastal Salinity Intrusion",
        "description": "Rising sea levels have caused salt crystallization on aerial roots.",
        "location": "Sundarbans National Park, Block 4",
        "latitude": 21.9497,
        "longitude": 88.9007,
        "severity": "high",
        "image_url": "/static/uploads/sample_root.jpg",
    }
    response = client.post("/api/reports", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["latitude"] == pytest.approx(21.9497)
    assert data["longitude"] == pytest.approx(88.9007)
    assert data["severity"] == "high"
    assert data["status"] == "pending"
    assert "id" in data


def test_create_report_invalid_latitude_high(client, auth_headers):
    payload = {
        "title": "Invalid Lat Test",
        "description": "Coordinates out of bounds",
        "location": "Unknown Sector",
        "latitude": 150.0,  # Invalid: > 90
        "longitude": 88.0,
        "severity": "low",
    }
    response = client.post("/api/reports", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_report_invalid_latitude_low(client, auth_headers):
    payload = {
        "title": "Invalid Lat Test",
        "description": "Coordinates out of bounds",
        "location": "Unknown Sector",
        "latitude": -95.5,  # Invalid: < -90
        "longitude": 88.0,
        "severity": "low",
    }
    response = client.post("/api/reports", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_report_invalid_longitude_high(client, auth_headers):
    payload = {
        "title": "Invalid Lng Test",
        "description": "Coordinates out of bounds",
        "location": "Unknown Sector",
        "latitude": 20.0,
        "longitude": 195.0,  # Invalid: > 180
        "severity": "low",
    }
    response = client.post("/api/reports", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_report_invalid_longitude_low(client, auth_headers):
    payload = {
        "title": "Invalid Lng Test",
        "description": "Coordinates out of bounds",
        "location": "Unknown Sector",
        "latitude": 20.0,
        "longitude": -185.0,  # Invalid: < -180
        "severity": "low",
    }
    response = client.post("/api/reports", json=payload, headers=auth_headers)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_create_report_with_image_multipart(client, auth_headers):
    file_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    files = {"image": ("field_canopy.jpg", io.BytesIO(file_content), "image/jpeg")}
    data = {
        "title": "Canopy Dieback from Cyclone",
        "description": "Foliage stripped by gale-force winds.",
        "location": "Pichavaram Mangrove Forest",
        "severity": "critical",
        "latitude": "11.4286",
        "longitude": "79.7828",
    }
    response = client.post(
        "/api/reports/with-image",
        data=data,
        files=files,
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_201_CREATED
    result = response.json()
    assert result["title"] == "Canopy Dieback from Cyclone"
    assert result["severity"] == "critical"
    assert result["image_url"] is not None


def test_create_report_with_image_invalid_lat(client, auth_headers):
    data = {
        "title": "Invalid Lat Multipart",
        "description": "Test description",
        "location": "Pichavaram",
        "severity": "medium",
        "latitude": "120.0",
        "longitude": "79.0",
    }
    response = client.post(
        "/api/reports/with-image",
        data=data,
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_list_reports_and_filters(client, auth_headers):
    # Create two reports with different severities
    client.post(
        "/api/reports",
        json={
            "title": "Erosion near Creek",
            "description": "Bank erosion degrading root stability.",
            "location": "Sundarbans Sector 1",
            "latitude": 21.90,
            "longitude": 88.90,
            "severity": "low",
        },
        headers=auth_headers,
    )
    client.post(
        "/api/reports",
        json={
            "title": "Severe Deforestation",
            "description": "Illegal clearing detected along perimeter.",
            "location": "Sundarbans Sector 2",
            "latitude": 21.92,
            "longitude": 88.92,
            "severity": "critical",
        },
        headers=auth_headers,
    )

    # List all
    res_all = client.get("/api/reports")
    assert res_all.status_code == status.HTTP_200_OK
    assert res_all.json()["total"] >= 2

    # Filter by severity
    res_crit = client.get("/api/reports?severity=critical")
    assert res_crit.status_code == status.HTTP_200_OK
    for rep in res_crit.json()["reports"]:
        assert rep["severity"] == "critical"

    # Search filter
    res_search = client.get("/api/reports?search=Deforestation")
    assert res_search.status_code == status.HTTP_200_OK
    assert res_search.json()["total"] >= 1
    assert "Deforestation" in res_search.json()["reports"][0]["title"]


def test_get_report_by_id(client, auth_headers):
    created = client.post(
        "/api/reports",
        json={
            "title": "Target Report",
            "description": "Fetching by specific primary key.",
            "location": "Baratang Island",
            "latitude": 12.10,
            "longitude": 92.78,
            "severity": "medium",
        },
        headers=auth_headers,
    ).json()

    rep_id = created["id"]
    res = client.get(f"/api/reports/{rep_id}")
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["title"] == "Target Report"

    # Nonexistent ID
    res_404 = client.get("/api/reports/999999")
    assert res_404.status_code == status.HTTP_404_NOT_FOUND


def test_get_my_reports(client, auth_headers):
    res = client.get("/api/reports/me", headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    assert isinstance(res.json(), list)


def test_get_nearby_reports(client, auth_headers):
    # Create report at coordinate (21.94, 88.90)
    client.post(
        "/api/reports",
        json={
            "title": "Sundarbans Core Area",
            "description": "Healthy Rhizophora mucronata zone.",
            "location": "Sundarbans Core",
            "latitude": 21.94,
            "longitude": 88.90,
            "severity": "low",
        },
        headers=auth_headers,
    )

    # Query within 15 km
    res_nearby = client.get("/api/reports/nearby?lat=21.95&lng=88.91&radius_km=15")
    assert res_nearby.status_code == status.HTTP_200_OK
    data = res_nearby.json()
    assert isinstance(data, list)
    assert len(data) >= 1

    # Query faraway point (e.g., Pichavaram ~1500 km away)
    res_far = client.get("/api/reports/nearby?lat=11.42&lng=79.78&radius_km=5")
    assert res_far.status_code == status.HTTP_200_OK
    assert len(res_far.json()) == 0

    # Query with invalid out-of-bounds latitude
    res_invalid = client.get("/api/reports/nearby?lat=100.0&lng=88.0")
    assert res_invalid.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_upload_image_standalone(client, auth_headers):
    img_data = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01"
    files = {"file": ("test_leaf.jpg", io.BytesIO(img_data), "image/jpeg")}
    res = client.post("/api/reports/upload-image", files=files, headers=auth_headers)
    assert res.status_code == status.HTTP_200_OK
    assert "image_url" in res.json()
    assert res.json()["image_url"].startswith("/static/uploads/")


def test_upload_image_invalid_content_type(client, auth_headers):
    files = {"file": ("script.sh", io.BytesIO(b"echo hack"), "application/x-sh")}
    res = client.post("/api/reports/upload-image", files=files, headers=auth_headers)
    assert res.status_code == status.HTTP_400_BAD_REQUEST
