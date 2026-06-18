import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock
from app.repositories.user_repository import UserRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.review_repository import ReviewRepository
from app.models.user import User
from app.models.request import ApprovalRequest
from app.models.action import ReviewAction
from app.models.enums import RequestPriority, RequestStatus, UserRole, ReviewActionType


@pytest.mark.anyio
async def test_user_repository_methods():
    """Assert UserRepository methods call the DB session correctly."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_user = MagicMock(spec=User)
    mock_result.scalars.return_value.first.return_value = mock_user
    mock_db.execute.return_value = mock_result

    repo = UserRepository(mock_db)
    user = await repo.get_by_email("test@example.com")
    assert user == mock_user
    mock_db.execute.assert_called_once()


@pytest.mark.anyio
async def test_request_repository_methods():
    """Assert RequestRepository create method adds and commits correctly."""
    mock_db = AsyncMock()
    mock_request = MagicMock(spec=ApprovalRequest)
    mock_db.refresh = AsyncMock()

    repo = RequestRepository(mock_db)
    # Simulate: after add+commit+refresh, the request is returned
    mock_db.commit = AsyncMock()
    mock_db.add = MagicMock()

    repo.get_by_id = AsyncMock(return_value=mock_request)
    
    result = await repo.create(
        title="Test",
        description="Test description here",
        priority=RequestPriority.LOW,
        created_by=uuid.uuid4(),
        reviewer_id=None,
    )
    assert mock_db.add.called
    assert mock_db.commit.called


@pytest.mark.anyio
async def test_review_repository_methods():
    """Assert ReviewRepository create_review_action persists audit log."""
    mock_db = AsyncMock()
    mock_action = MagicMock(spec=ReviewAction)
    mock_db.commit = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.refresh = AsyncMock()

    repo = ReviewRepository(mock_db)
    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(
            "app.repositories.review_repository.ReviewAction",
            lambda **kwargs: mock_action,
        )
        result = await repo.create_review_action(
            request_id=uuid.uuid4(),
            action=ReviewActionType.APPROVED,
            comments="Looks great.",
            reviewed_by=uuid.uuid4(),
        )
    assert mock_db.add.called
    assert mock_db.commit.called