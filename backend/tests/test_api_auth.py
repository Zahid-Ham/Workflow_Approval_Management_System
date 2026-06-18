import pytest
import uuid
from datetime import datetime
from unittest.mock import MagicMock, AsyncMock
from fastapi.testclient import TestClient
from main import app
from app.api.deps import get_auth_service, get_current_user
from app.models.user import User
from app.models.enums import UserRole
from app.services.auth_service import AuthService
from app.schemas.auth import TokenResponse

mock_user = User(
    id=uuid.uuid4(),
    name="John Doe",
    email="john@example.com",
    google_id="google-id-123",
    role=UserRole.REQUESTER,
    created_at=datetime.utcnow(),
)

client = TestClient(app)


@pytest.fixture
def override_auth_dependencies():
    mock_auth_service = MagicMock(spec=AuthService)
    mock_auth_service.get_oauth_login_url = AsyncMock(return_value="https://google.com/consent")
    mock_auth_service.handle_oauth_callback = AsyncMock(
        return_value=TokenResponse(access_token="mock_jwt_token", token_type="bearer")
    )
    mock_auth_service.verify_jwt_token = MagicMock(
        return_value={
            "sub": str(mock_user.id),
            "email": mock_user.email,
            "role": mock_user.role.value if hasattr(mock_user.role, "value") else mock_user.role,
        }
    )
    app.dependency_overrides[get_auth_service] = lambda: mock_auth_service
    app.dependency_overrides[get_current_user] = lambda: mock_user
    yield mock_auth_service
    app.dependency_overrides.clear()


def test_google_login_returns_login_url(override_auth_dependencies):
    """
    Assert /auth/google/login returns a login_url pointing to Google.
    """
    response = client.get("/auth/google/login")
    assert response.status_code == 200
    data = response.json()
    assert "login_url" in data
    assert data["login_url"] == "https://google.com/consent"


def test_google_callback_returns_jwt(override_auth_dependencies):
    """
    Assert /auth/google/callback code exchanges return jwt tokens.
    """
    response = client.get("/auth/google/callback?code=test-code")
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"] == "mock_jwt_token"
    assert data["token_type"] == "bearer"


def test_get_me_endpoint(override_auth_dependencies):
    """
    Assert /auth/me returns currently logged-in user profile.
    """
    response = client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert data["email"] == "john@example.com"
    assert data["role"] == "Requester"
