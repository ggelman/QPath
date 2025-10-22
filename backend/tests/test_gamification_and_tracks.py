from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel, Session, create_engine

from app.main import app
from app.core.database import get_session
from app.core.auth import get_current_active_user
from app.models.models import (
    User,
    UserRole,
    GamificationProfile,
    UserResponse,
)


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="client")
def client_fixture(engine):
    # Seed user and gamification profile
    with Session(engine) as session:
        user = User(
            email="test@example.com",
            full_name="Test User",
            username="testuser",
            role=UserRole.USER,
            is_active=True,
            hashed_password="hashed",
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        profile = GamificationProfile(user_id=user.id)
        session.add(profile)
        session.commit()

        user_response = UserResponse.model_validate(user)

    def get_test_session():
        with Session(engine) as session:
            yield session

    def get_test_user():
        return user_response

    app.dependency_overrides[get_session] = get_test_session
    app.dependency_overrides[get_current_active_user] = get_test_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_dashboard_returns_tasks_and_progress(client):
    response = client.get("/api/v1/gamification/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["tasks"], list)
    assert len(data["tasks"]) >= 1
    assert len(data["week_progress"]["week"]) == 7


def test_sync_tasks_replaces_existing_tasks(client):
    payload = [
        {"title": "Tarefa de Teste", "due_date": "2025-01-01", "completed": False},
        {"title": "Tarefa Concluída", "due_date": None, "completed": True},
    ]
    response = client.put("/api/v1/gamification/tasks", json=payload)
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert any(task["title"] == "Tarefa de Teste" for task in tasks)


def test_toggle_task_completion_requires_existing_task(client):
    response = client.patch(
        "/api/v1/gamification/tasks/9999",
        json={"completed": True},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Task not found"


def test_log_pomodoro_session_registers_activity(client):
    response = client.post("/api/v1/gamification/pomodoro-session", params={"duration_minutes": 25})
    assert response.status_code == 200
    body = response.json()
    assert body["pomodoro_sessions"] == 1


def test_profile_details_contains_achievements_and_rewards(client):
    response = client.get("/api/v1/gamification/profile/details")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert "achievements" in data and isinstance(data["achievements"], list)
    assert "rewards" in data and isinstance(data["rewards"], list)


def test_create_reward_validates_input(client):
    response = client.post(
        "/api/v1/gamification/rewards",
        json={"condition": "   ", "reward": ""},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Condition and reward must be provided"


def test_reward_creation_and_update_flow(client):
    create_response = client.post(
        "/api/v1/gamification/rewards",
        json={"condition": "Concluir trilha", "reward": "Ganhar descanso"},
    )
    assert create_response.status_code == 201
    reward = create_response.json()
    assert reward["condition"] == "Concluir trilha"

    update_response = client.patch(
        f"/api/v1/gamification/rewards/{reward['id']}",
        json={"achieved": True},
    )
    assert update_response.status_code == 200
    assert update_response.json()["achieved"] is True


def test_tracks_endpoints_return_default_tracks(client):
    list_response = client.get("/api/v1/tracks/")
    assert list_response.status_code == 200
    tracks = list_response.json()
    assert tracks
    first_track = tracks[0]
    assert "modules" in first_track and first_track["modules"]

    lesson_id = first_track["modules"][0]["lessons"][0]["id"]
    patch_response = client.patch(
        f"/api/v1/tracks/lessons/{lesson_id}",
        json={"completed": True},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["success"] is True

    refreshed = client.get("/api/v1/tracks/").json()
    refreshed_lesson = refreshed[0]["modules"][0]["lessons"][0]
    assert refreshed_lesson["completed"] is True


def test_update_lesson_completion_handles_unknown_lessons(client):
    response = client.patch(
        "/api/v1/tracks/lessons/999999",
        json={"completed": True},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Lesson not found"
