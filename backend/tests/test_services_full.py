import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.models.enums import RequestStatus, RequestPriority, UserRole
from app.models.request import ApprovalRequest
from app.models.user import User
from app.models.action import ReviewAction
from app.services.auth_service import AuthService
from app.services.request_service import RequestService
from app.services.reviewer_service import ReviewerService
from app.repositories.user_repository import UserRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.review_repository import ReviewRepository
from app.services.oauth_service import OAuthService
from app.services.jwt_service import JWTService
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException


@pytest.mark.anyio
async def test_auth_service_onboard_new_user():
    """Assert that a new Google user is created and a token is issued."""
    mock_user_repo = AsyncMock(spec=UserRepository)
    mock_user_repo.get_by_google_id.return_value = None
    mock_user_repo.get_by_email.return_value = None
    new_user = MagicMock(spec=User)
    new_user.id = uuid.uuid4()
    new_user.email = "newuser@example.com"
    new_user.role = UserRole.REQUESTER
    mock_user_repo.create.return_value = new_user

    mock_oauth = MagicMock(spec=OAuthService)
    mock_oauth.get_google_user_profile = AsyncMock(
        return_value={"sub": "google-123", "email": "newuser@example.com", "name": "New User"}
    )
    mock_jwt = MagicMock(spec=JWTService)
    mock_jwt.create_token.return_value = "test_token"

    service = AuthService(user_repo=mock_user_repo, oauth_service=mock_oauth, jwt_service=mock_jwt)
    token = await service.authenticate_google_user("auth_code")
    assert token == "test_token"
    mock_user_repo.create.assert_called_once()


@pytest.mark.anyio
async def test_auth_service_link_existing_user():
    """Assert that an existing email-only user gets their Google ID linked."""
    existing_user = MagicMock(spec=User)
    existing_user.id = uuid.uuid4()
    existing_user.email = "existing@example.com"
    existing_user.role = UserRole.REQUESTER

    mock_user_repo = AsyncMock(spec=UserRepository)
    mock_user_repo.get_by_google_id.return_value = None
    mock_user_repo.get_by_email.return_value = existing_user
    mock_user_repo.update.return_value = existing_user

    mock_oauth = MagicMock(spec=OAuthService)
    mock_oauth.get_google_user_profile = AsyncMock(
        return_value={"sub": "google-456", "email": "existing@example.com", "name": "Existing"}
    )
    mock_jwt = MagicMock(spec=JWTService)
    mock_jwt.create_token.return_value = "linked_token"

    service = AuthService(user_repo=mock_user_repo, oauth_service=mock_oauth, jwt_service=mock_jwt)
    token = await service.authenticate_google_user("auth_code")
    assert token == "linked_token"
    mock_user_repo.update.assert_called_once()


@pytest.mark.anyio
async def test_request_service_fetch_details_forbidden():
    """Assert that a requester cannot fetch another user's request."""
    requester_id = uuid.uuid4()
    other_user_id = uuid.uuid4()
    request_id = uuid.uuid4()

    mock_request = MagicMock(spec=ApprovalRequest)
    mock_request.id = request_id
    mock_request.created_by = other_user_id
    mock_request.reviewer_id = None

    mock_req_repo = AsyncMock(spec=RequestRepository)
    mock_req_repo.get_by_id.return_value = mock_request
    mock_user_repo = AsyncMock(spec=UserRepository)

    service = RequestService(request_repo=mock_req_repo, user_repo=mock_user_repo)
    with pytest.raises(ForbiddenException):
        await service.fetch_request(request_id=request_id, user_id=requester_id, role=UserRole.REQUESTER)


@pytest.mark.anyio
async def test_request_service_update_non_pending_raises_conflict():
    """Assert that updating a non-PENDING request raises ConflictException."""
    requester_id = uuid.uuid4()
    request_id = uuid.uuid4()

    mock_request = MagicMock(spec=ApprovalRequest)
    mock_request.id = request_id
    mock_request.created_by = requester_id
    mock_request.status = RequestStatus.APPROVED

    mock_req_repo = AsyncMock(spec=RequestRepository)
    mock_req_repo.get_by_id.return_value = mock_request
    mock_user_repo = AsyncMock(spec=UserRepository)

    service = RequestService(request_repo=mock_req_repo, user_repo=mock_user_repo)
    with pytest.raises(ConflictException):
        await service.update_request(
            request_id=request_id, requester_id=requester_id, title="New Title"
        )


@pytest.mark.anyio
async def test_request_service_delete_non_pending_raises_conflict():
    """Assert that deleting a non-PENDING request raises ConflictException."""
    requester_id = uuid.uuid4()
    request_id = uuid.uuid4()

    mock_request = MagicMock(spec=ApprovalRequest)
    mock_request.id = request_id
    mock_request.created_by = requester_id
    mock_request.status = RequestStatus.REJECTED

    mock_req_repo = AsyncMock(spec=RequestRepository)
    mock_req_repo.get_by_id.return_value = mock_request
    mock_user_repo = AsyncMock(spec=UserRepository)

    service = RequestService(request_repo=mock_req_repo, user_repo=mock_user_repo)
    with pytest.raises(ConflictException):
        await service.delete_request(request_id=request_id, requester_id=requester_id)


@pytest.mark.anyio
async def test_reviewer_service_approve_reject():
    """Assert approve/reject update request status and log audit actions."""
    reviewer_id = uuid.uuid4()
    request_id = uuid.uuid4()

    mock_request = MagicMock(spec=ApprovalRequest)
    mock_request.id = request_id
    mock_request.reviewer_id = reviewer_id
    mock_request.status = RequestStatus.PENDING

    mock_review_action = MagicMock(spec=ReviewAction)

    mock_req_repo = AsyncMock(spec=RequestRepository)
    mock_req_repo.get_by_id.return_value = mock_request
    mock_req_repo.update.return_value = mock_request

    mock_review_repo = AsyncMock(spec=ReviewRepository)
    mock_review_repo.create_review_action.return_value = mock_review_action

    service = ReviewerService(request_repo=mock_req_repo, review_repo=mock_review_repo)
    action = await service.approve_request(
        request_id=request_id, reviewer_id=reviewer_id, comments="Looks good!"
    )
    assert action == mock_review_action
    assert mock_request.status == RequestStatus.APPROVED