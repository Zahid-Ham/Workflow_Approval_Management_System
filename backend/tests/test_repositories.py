import pytest
from unittest.mock import AsyncMock, MagicMock
from app.repositories.user_repository import UserRepository
from app.repositories.request_repository import RequestRepository
from app.repositories.review_repository import ReviewRepository

def test_repositories_instantiation():
    """
    Verify repositories initialize with mock session parameters.
    """
    db_mock = MagicMock()
    user_repo = UserRepository(db_mock)
    request_repo = RequestRepository(db_mock)
    review_repo = ReviewRepository(db_mock)
    
    assert user_repo.db is db_mock
    assert request_repo.db is db_mock
    assert review_repo.db is db_mock
