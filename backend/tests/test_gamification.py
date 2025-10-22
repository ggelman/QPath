from fastapi.testclient import TestClient


def test_complete_trilha_awards_xp_and_logs_activity(
    client: TestClient, auth_headers
):
    response = client.post(
        "/api/v1/gamification/complete-trilha",
        params={"trilha_name": "Trilha Quantum"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["completed_trilhas"] == 1
    assert body["total_xp"] >= 100

    logs_response = client.get(
        "/api/v1/gamification/activity-logs",
        headers=auth_headers,
    )

    assert logs_response.status_code == 200
    logs = logs_response.json()
    assert len(logs) == 1
    assert "Trilha 'Trilha Quantum'" in logs[0]["description"]


def test_complete_trilha_validates_name(client: TestClient, auth_headers):
    response = client.post(
        "/api/v1/gamification/complete-trilha",
        params={"trilha_name": "ab"},
        headers=auth_headers,
    )

    assert response.status_code == 400
    assert "Trilha name must be between" in response.json()["detail"]


def test_gamification_profile_requires_authentication(client: TestClient):
    response = client.get("/api/v1/gamification/profile")
    assert response.status_code in {401, 403}


def test_gamification_profile_returns_current_stats(client: TestClient, auth_headers):
    response = client.get("/api/v1/gamification/profile", headers=auth_headers)
    assert response.status_code == 200
    profile = response.json()
    assert profile["total_xp"] == 0
    assert profile["completed_trilhas"] == 0
