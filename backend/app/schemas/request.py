import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import RequestPriority, RequestStatus
from app.schemas.user import UserResponse


class RequestBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100, description="Short summary of approval request")
    description: str = Field(..., min_length=5, max_length=2000, description="Detailed request reason or context")
    priority: RequestPriority = Field(default=RequestPriority.LOW, description="Priority urgency of approval request")
    reviewer_id: Optional[uuid.UUID] = Field(default=None, description="Assigned reviewer user id")


class RequestCreate(RequestBase):
    pass


class RequestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=5, max_length=2000)
    priority: Optional[RequestPriority] = Field(None)
    reviewer_id: Optional[uuid.UUID] = Field(None)


class RequestResponse(RequestBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    status: RequestStatus
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    reviewer: Optional[UserResponse] = None
