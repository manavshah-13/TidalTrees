import io
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db

def test_rate_limiting():
    # Mock database session so it doesn't require live PostgreSQL
    mock_db = MagicMock()
    app.dependency_overrides[get_db] = lambda: mock_db
    
    client = TestClient(app)
    payload = {
        "name": "Sentinel Scout",
        "email": "scout@tidaltrees.org",
        "subject": "Conservation Inquiry",
        "message": "Testing automated rate limiting mechanism."
    }

    print("--- Testing Rate Limiting on POST /api/contact (Limit: 5/minute) ---")
    results = []
    for i in range(1, 8):
        response = client.post("/api/contact", json=payload)
        print(f"Request #{i}: Status HTTP {response.status_code}")
        results.append(response.status_code)
    
    # First 5 should succeed (201 Created), 6th and 7th should be 429 Too Many Requests
    assert results[:5] == [201, 201, 201, 201, 201], f"Expected first 5 to be 201, got {results[:5]}"
    assert results[5:] == [429, 429], f"Expected requests 6 and 7 to be 429, got {results[5:]}"
    print("SUCCESS: Rate limiting verified on /api/contact! HTTP 429 returned when rate limit breached.")

    print("\n--- Testing Rate Limiting on POST /api/analyze (Limit: 5/minute) ---")
    valid_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + (b"\x00" * 100)
    analyze_results = []
    for i in range(1, 8):
        files = {"file": ("test.jpg", io.BytesIO(valid_jpeg), "image/jpeg")}
        response = client.post("/api/analyze", files=files)
        print(f"Analyze Request #{i}: Status HTTP {response.status_code}")
        analyze_results.append(response.status_code)

    assert analyze_results[:5] == [200, 200, 200, 200, 200], f"Expected first 5 to be 200, got {analyze_results[:5]}"
    assert analyze_results[5:] == [429, 429], f"Expected requests 6 and 7 to be 429, got {analyze_results[5:]}"
    print("SUCCESS: Rate limiting verified on /api/analyze! HTTP 429 returned when rate limit breached.")

if __name__ == "__main__":
    test_rate_limiting()
