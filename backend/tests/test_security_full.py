import pytest
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from app.core.security import create_access_token, verify_access_token
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.models.user import User
from app.models.enums import UserRole


def test_token_creation_and_verification():
    """Assert that a JWT token can be created and its payload verified."""
    data = {"sub": "user-uuid", "email": "test@example.com", "role": "Requester"}
    token = create_access_token(data)
    assert token is not None
    assert isinstance(token, str)
    payload = verify_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user-uuid"
    assert payload["email"] == "test@example.com"
    assert payload["role"] == "Requester"


def test_token_verification_invalid_signature():
    """Assert that an invalid token returns None."""
    payload = verify_access_token("invalid.token.signature")
    assert payload is None


@pytest.mark.anyio
async def test_get_current_user_invalid_header_format():
    """Assert that a missing or malformed Authorization header raises UnauthorizedException."""
    from app.core.security import get_current_user
    from fastapi import Header
    with pytest.raises(UnauthorizedException):
        await get_current_user(authorization="InvalidHeader")


@pytest.mark.anyio
async def test_get_current_user_invalid_token():
    """Assert that an invalid token raises UnauthorizedException."""
    from app.core.security import get_current_user
    mock_db = MagicMock()
    with pytest.raises(UnauthorizedException):
        await get_current_user(authorization="Bearer bad.token.here", db=mock_db)


@pytest.mark.anyio
async def test_get_current_user_user_not_found():
    """Assert that a valid token for a non-existent user raises UnauthorizedException."""
    from app.core.security import get_current_user
    user_id = uuid.uuid4()
    token = create_access_token({"sub": str(user_id), "email": "x@x.com", "role": "Requester"})
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = None
    mock_db = MagicMock()
    with patch("app.core.security.UserRepository", return_value=mock_repo):
        with pytest.raises(UnauthorizedException):
            await get_current_user(authorization=f"Bearer {token}", db=mock_db)


@pytest.mark.anyio
async def test_get_current_user_success():
    """Assert that a valid token and existing user returns the user object."""
    from app.core.security import get_current_user
    user_id = uuid.uuid4()
    token = create_access_token({"sub": str(user_id), "email": "x@x.com", "role": "Requester"})
    mock_user = MagicMock(spec=User)
    mock_user.id = user_id
    mock_repo = AsyncMock()
    mock_repo.get_by_id.return_value = mock_user
    mock_db = MagicMock()
    with patch("app.core.security.UserRepository", return_value=mock_repo):
        user = await get_current_user(authorization=f"Bearer {token}", db=mock_db)
    assert user == mock_user


@pytest.mark.anyio
async def test_get_current_requester_wrong_role():
    """Assert that a Reviewer user is rejected by get_current_requester."""
    from app.core.security import get_current_requester
    mock_user = MagicMock(spec=User)
    mock_user.role = UserRole.REVIEWER
    with pytest.raises(ForbiddenException):
        await get_current_requester(current_user=mock_user)


@pytest.mark.anyio
async def test_get_current_reviewer_wrong_role():
    """Assert that a Requester user is rejected by get_current_reviewer."""
    from app.core.security import get_current_reviewer
    mock_user = MagicMock(spec=User)
    mock_user.role = UserRole.REQUESTER
    with pytest.raises(ForbiddenException):
        await get_current_reviewer(current_user=mock_user)