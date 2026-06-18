import pytest
from app.models.enums import UserRole, RequestPriority, RequestStatus, ReviewActionType
from app.models.user import User
from app.models.request import ApprovalRequest
from app.models.action import ReviewAction

def test_user_properties():
    """
    Asserts fields exist on User class definition.
    """
    assert hasattr(User, 'name')
    assert hasattr(User, 'email')
    assert hasattr(User, 'google_id')
    assert hasattr(User, 'role')
    assert hasattr(User, 'created_at')

def test_request_properties():
    """
    Asserts fields exist on ApprovalRequest class definition.
    """
    assert hasattr(ApprovalRequest, 'title')
    assert hasattr(ApprovalRequest, 'description')
    assert hasattr(ApprovalRequest, 'priority')
    assert hasattr(ApprovalRequest, 'status')
    assert hasattr(ApprovalRequest, 'created_by')
    assert hasattr(ApprovalRequest, 'reviewer_id')

def test_action_properties():
    """
    Asserts fields exist on ReviewAction class definition.
    """
    assert hasattr(ReviewAction, 'request_id')
    assert hasattr(ReviewAction, 'action')
    assert hasattr(ReviewAction, 'comments')
    assert hasattr(ReviewAction, 'reviewed_by')
