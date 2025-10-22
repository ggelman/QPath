from typing import Any, Dict, Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
import app.main as main_module
from app.core.config import settings
from app.core.security import security_service
from app.core.database import get_session
from app.models import models  # noqa: F401
from app.models.models import UserCreate
from app.repositories.base import UserRepository

settings.SECRET_KEY = "test-secret"
settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
settings.REFRESH_TOKEN_EXPIRE_DAYS = 7
settings.ENVIRONMENT = "test"
security_service.SECRET_KEY = settings.SECRET_KEY
security_service.ALGORITHM = settings.ALGORITHM
security_service.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
security_service.REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS


def _test_hash(password: str) -> str:
    return f"hashed::{password}"


def _test_verify(password: str, hashed: str) -> bool:
    return hashed == f"hashed::{password}"


security_service.get_password_hash = _test_hash  # type: ignore[attr-defined]
security_service.verify_password = _test_verify  # type: ignore[attr-defined]

# Avoid hitting the real database initialisation in tests
main_module.init_db = lambda: None  # type: ignore


@pytest.fixture(scope="session")
def engine() -> Generator[Session, None, None]:
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(test_engine)
    return test_engine


@pytest.fixture(scope="function")
def session(engine) -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def client(session) -> Generator[TestClient, None, None]:
    def override_get_session():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_session] = override_get_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def user_credentials(session) -> Dict[str, Any]:
    repo = UserRepository(session)
    password = "strong-password"
    user = repo.create(
        UserCreate(
            email="tester@example.com",
            full_name="Test User",
            username="tester",
            password=password,
        )
    )
    return {"user": user, "password": password}


@pytest.fixture(scope="function")
def auth_headers(client: TestClient, user_credentials):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": user_credentials["user"].email, "password": user_credentials["password"]},
    )
    assert response.status_code == 200
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}
