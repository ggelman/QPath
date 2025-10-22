from fastapi.testclient import TestClient


def test_login_success(client: TestClient, user_credentials):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": user_credentials["user"].email, "password": user_credentials["password"]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body and body["access_token"]
    assert "refresh_token" in body and body["refresh_token"]


def test_login_rejects_invalid_credentials(client: TestClient, user_credentials):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": user_credentials["user"].email, "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
