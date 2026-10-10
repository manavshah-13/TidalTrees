import pytest
from fastapi import status


def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "username": "new_ranger",
            "email": "ranger@mangroves.io",
            "password": "strongPassword!2026",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["username"] == "new_ranger"
    assert data["email"] == "ranger@mangroves.io"
    assert "id" in data
    assert "password_hash" not in data


def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "username": test_user.username,
            "email": "different_email@mangroves.io",
            "password": "anotherPassword!2026",
        },
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already taken" in response.json()["detail"]


def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "username": test_user.username,
            "password": "password123",
        },
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "username": test_user.username,
            "password": "wrong_password_attempt",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid username or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={
            "username": "ghost_user",
            "password": "some_password",
        },
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me_authenticated(client, auth_headers, test_user):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert data["points"] == test_user.points


def test_get_me_unauthenticated(client):
    response = client.get("/api/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me_invalid_token(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
