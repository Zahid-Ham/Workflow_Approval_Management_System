import uuid
from datetime import datetime
from typing import List
from sqlalchemy import String, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin
from app.models.enums import UserRole

class User(UUIDMixin, Base):
    '''
    User model representing Requesters and Reviewers.
    
    ERD Validation:
    - PK: id (UUID)
    - UK: email (unique index)
    - UK: google_id (unique index)
    - Relations: One-to-Many with ApprovalRequest (Created and Assigned)
    - Relations: One-to-Many with ReviewAction (Performed reviews)
    '''
    __tablename__ = 'users'
    name: Mapped[str] = mapped_column(String(255), nullable = False)
    email: Mapped[str] = mapped_column(String(255), unique = True, index = True, nullable = False)
    google_id: Mapped[str] = mapped_column(String(255), unique = True, index = True, nullable = False)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole, name = 'user_role_enum', inherit_schema = True), default = UserRole.REQUESTER, nullable = False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)
    requests_created: Mapped[List['ApprovalRequest']] = relationship('ApprovalRequest', foreign_keys = '[ApprovalRequest.created_by]', back_populates = 'creator', cascade = 'all, delete-orphan')
    requests_assigned: Mapped[List['ApprovalRequest']] = relationship('ApprovalRequest', foreign_keys = '[ApprovalRequest.reviewer_id]', back_populates = 'reviewer')
    actions_performed: Mapped[List['ReviewAction']] = relationship('ReviewAction', back_populates = 'reviewer', cascade = 'all, delete-orphan')
    
    def __repr__(self = None):
        return f'''<User id={self.id} email={self.email} role={self.role}>'''


from app.models.request import ApprovalRequest
from app.models.action import ReviewAction