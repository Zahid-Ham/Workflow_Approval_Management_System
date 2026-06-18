import uuid
from typing import List, Optional
from sqlalchemy import String, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import RequestPriority, RequestStatus

class ApprovalRequest(TimestampMixin, UUIDMixin, Base):
    '''
    ApprovalRequest model tracking requester submissions and reviewer assignments.
    
    ERD Validation:
    - PK: id (UUID)
    - FK: created_by -> users.id (ON DELETE CASCADE)
    - FK: reviewer_id -> users.id (ON DELETE SET NULL)
    - Relations: Many-to-One with User (Creator & Reviewer)
    - Relations: One-to-Many with ReviewAction
    '''
    __tablename__ = 'approval_requests'
    title: Mapped[str] = mapped_column(String(255), nullable = False, index = True)
    description: Mapped[str] = mapped_column(Text, nullable = False)
    priority: Mapped[RequestPriority] = mapped_column(SQLEnum(RequestPriority, name = 'request_priority_enum', inherit_schema = True), default = RequestPriority.LOW, nullable = False)
    status: Mapped[RequestStatus] = mapped_column(SQLEnum(RequestStatus, name = 'request_status_enum', inherit_schema = True), default = RequestStatus.PENDING, nullable = False, index = True)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), ForeignKey('users.id', ondelete = 'CASCADE'), nullable = False, index = True)
    reviewer_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid = True), ForeignKey('users.id', ondelete = 'SET NULL'), nullable = True, index = True)
    creator: Mapped['User'] = relationship('User', foreign_keys = [
        created_by], back_populates = 'requests_created')
    reviewer: Mapped[Optional['User']] = relationship('User', foreign_keys = [
        reviewer_id], back_populates = 'requests_assigned')
    actions: Mapped[List['ReviewAction']] = relationship('ReviewAction', back_populates = 'request', cascade = 'all, delete-orphan')
    
    def __repr__(self = None):
        return f'''<ApprovalRequest id={self.id} title={self.title} status={self.status}>'''


from app.models.user import User
from app.models.action import ReviewAction