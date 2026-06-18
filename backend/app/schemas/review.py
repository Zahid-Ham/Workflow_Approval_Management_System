import uuid
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import ReviewActionType
from app.schemas.user import UserResponse


class ReviewBase(BaseModel):
    comments: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Reason/notes explaining reviewer decision (Mandatory)",
    )


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    request_id: uuid.UUID
    action: ReviewActionType
    reviewed_at: datetime
    reviewed_by: uuid.UUID
    reviewer: UserResponse | None = None
