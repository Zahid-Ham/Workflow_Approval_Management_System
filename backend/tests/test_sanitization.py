import pytest
import uuid
from pydantic import ValidationError
from app.schemas.request import RequestCreate
from app.schemas.review import ReviewCreate
from app.models.enums import RequestPriority


def test_request_schema_rejects_short_title():
    """Assert that a title shorter than 3 characters fails validation."""
    with pytest.raises(ValidationError):
        RequestCreate(
            title="Hi",
            description="This is a valid description that is long enough.",
            priority=RequestPriority.HIGH,
            reviewer_id=uuid.uuid4(),
        )


def test_request_schema_rejects_empty_description():
    """Assert that a description shorter than 5 characters fails validation."""
    with pytest.raises(ValidationError):
        RequestCreate(
            title="Valid Title",
            description="Hi",
            priority=RequestPriority.LOW,
        )


def test_request_schema_valid_payload():
    """Assert that a well-formed RequestCreate passes Pydantic validation."""
    payload = RequestCreate(
        title="Budget Approval",
        description="Please approve the Q3 marketing budget.",
        priority=RequestPriority.HIGH,
        reviewer_id=uuid.uuid4(),
    )
    assert payload.title == "Budget Approval"
    assert payload.priority == RequestPriority.HIGH


def test_review_schema_rejects_short_comment():
    """Assert that comments shorter than 3 characters fail validation."""
    with pytest.raises(ValidationError):
        ReviewCreate(comments="No")


def test_review_schema_valid_comment():
    """Assert that a valid comment passes Pydantic validation."""
    payload = ReviewCreate(comments="Approved after review.")
    assert payload.comments == "Approved after review."
