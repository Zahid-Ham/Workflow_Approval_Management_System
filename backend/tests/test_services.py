import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.models.enums import RequestStatus, RequestPriority, UserRole
from app.models.request import ApprovalRequest
from app.models.user import User
from app.models.action import ReviewAction
from app.services.request_service import RequestService
from app.services.reviewer_service import ReviewerService
from app.repositories.user_repository import UserRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.review_repository import ReviewRepository
from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException, ConflictException


@pytest.mark.anyio
async def test_create_request_without_valid_reviewer_raises_error():
    """Assert that assigning a non-Reviewer user raises ValidationException."""
    requester_id = uuid.uuid4()
    reviewer_id = uuid.uuid4()

    mock_reviewer = MagicMock(spec=User)
    mock_reviewer.role = UserRole.REQUESTER  # Wrong role!

    mock_user_repo = AsyncMock(spec=UserRepository)
    mock_user_repo.get_by_id.return_value = mock_reviewer

    mock_req_repo = AsyncMock(spec=RequestRepository)

    service = RequestService(request_repo=mock_req_repo, user_repo=mock_user_repo)
    with pytest.raises(ValidationException):
        await service.create_request(
            title="Test Request",
            description="This is a test request.",
            priority=RequestPriority.MEDIUM,
            created_by=requester_id,
            reviewer_id=reviewer_id,
        )


@pytest.mark.anyio
async def test_update_request_not_pending_raises_error():
    """Assert that updating an APPROVED request raises ConflictException."""
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
            request_id=request_id,
            requester_id=requester_id,
            title="Updated Title",
        )


@pytest.mark.anyio
async def test_reviewer_double_review_raises_error():
    """Assert that reviewing an already-decided request raises ConflictException."""
    reviewer_id = uuid.uuid4()
    request_id = uuid.uuid4()

    mock_request = MagicMock(spec=ApprovalRequest)
    mock_request.id = request_id
    mock_request.reviewer_id = reviewer_id
    mock_request.status = RequestStatus.APPROVED  # Already decided

    mock_req_repo = AsyncMock(spec=RequestRepository)
    mock_req_repo.get_by_id.return_value = mock_request
    mock_review_repo = AsyncMock(spec=ReviewRepository)

    service = ReviewerService(request_repo=mock_req_repo, review_repo=mock_review_repo)
    with pytest.raises(ConflictException):
        await service.reject_request(
            request_id=request_id,
            reviewer_id=reviewer_id,
            comments="Trying to reject again.",
        )