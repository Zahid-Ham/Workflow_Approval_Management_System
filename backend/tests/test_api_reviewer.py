import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from app.api.deps import get_current_user
from app.models.user import User
from app.models.enums import UserRole, ReviewActionType
from app.services import ReviewerService
from app.api.reviewer import get_reviewer_service
from unittest.mock import MagicMock, AsyncMock

# Define a mock active reviewer
mock_reviewer = User(
    id=uuid.uuid4(),
    name="Test Reviewer",
    email="reviewer@example.com",
    google_id="google-reviewer-id",
    role=UserRole.REVIEWER,
)

# Define a mock active requester (who should be blocked)
mock_requester = User(
    id=uuid.uuid4(),
    name="Test Requester",
    email="requester@example.com",
    google_id="google-requester-id",
    role=UserRole.REQUESTER,
)

client = TestClient(app)


@pytest.fixture
def mock_dependencies():
    service_mock = MagicMock(spec=ReviewerService)
    service_mock.list_assigned_requests = AsyncMock(return_value=[])
    app.dependency_overrides[get_reviewer_service] = lambda: service_mock
    yield service_mock
    app.dependency_overrides.clear()


def test_reviewer_endpoint_access_denied_for_requesters(mock_dependencies):
    """
    Assures GET /reviewer/requests returns 403 Forbidden for users with Requester roles.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_requester
    response = client.get("/reviewer/requests")
    assert response.status_code == 403
    data = response.json()
    assert "detail" in data


def test_reviewer_endpoint_allowed_for_reviewers(mock_dependencies):
    """
    Assures GET /reviewer/requests returns 200 OK for users with Reviewer roles.
    """
    app.dependency_overrides[get_current_user] = lambda: mock_reviewer
    response = client.get("/reviewer/requests")
    assert response.status_code == 200
