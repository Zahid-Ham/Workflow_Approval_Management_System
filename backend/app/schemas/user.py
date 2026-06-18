import uuid
from pydantic import ConfigDict
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the user")
    email: EmailStr = Field(..., description="User's unique email address")
    role: UserRole = Field(default=UserRole.REQUESTER, description="Assigned role: Requester or Reviewer")


class UserCreate(UserBase):
    google_id: str = Field(..., min_length=1, description="Google OAuth 2.0 unique identifier")


class UserUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    role: UserRole | None = Field(None)


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime
