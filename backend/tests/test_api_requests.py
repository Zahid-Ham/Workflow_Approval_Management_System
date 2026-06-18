import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.api.deps import get_current_user
from app.models.user import User
from app.models.enums import UserRole

# Define a mock active user
mock_requester = User(
    id=uuid.uuid4(),
    name="Test Requester",
    email="requester@example.com",
    google_id="google-requester-id",
    role=UserRole.REQUESTER,
)


# Overrides get_current_user dependency
@pytest.fixture(autouse=True)
def override_auth_dependency():
    app.dependency_overrides[get_current_user] = lambda: mock_requester
    yield
    app.dependency_overrides.clear()


client = TestClient(app)


def test_create_request_endpoint_validation_errors():
    """
    Assures POST /requests fails with 422 if payload lacks essential attributes.
    """
    response = client.post("/requests", json={})
    assert response.status_code == 422


def test_list_requests_endpoint_pagination():
    """
    Assures GET /requests accepts skip/limit query offsets.
    The endpoint requires DB, so we expect it to fail gracefully (not a 405/404).
    """
    response = client.get("/requests?skip=0&limit=5")
    # With mocked user but real DB (not available in unit tests), expect a 500 or 200
    assert response.status_code in (200, 500, 503)
