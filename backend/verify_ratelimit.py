import sys
from fastapi.testclient import TestClient
from app.main import app

def test_rate_limiting():
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
    print("SUCCESS: Rate limiting verified! HTTP 429 returned when rate limit breached.")

if __name__ == "__main__":
    test_rate_limiting()
