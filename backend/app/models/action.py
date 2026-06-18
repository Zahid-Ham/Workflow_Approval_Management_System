import uuid
from datetime import datetime
from sqlalchemy import Text, ForeignKey, Enum as SQLEnum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDMixin
from app.models.enums import ReviewActionType

class ReviewAction(UUIDMixin, Base):
    '''
    ReviewAction model capturing decision logs made by reviewers.
    
    ERD Validation:
    - PK: id (UUID)
    - FK: request_id -> approval_requests.id (ON DELETE CASCADE)
    - FK: reviewed_by -> users.id (ON DELETE CASCADE)
    - Relations: Many-to-One with ApprovalRequest
    - Relations: Many-to-One with User (Reviewer)
    '''
    __tablename__ = 'review_actions'
    request_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), ForeignKey('approval_requests.id', ondelete = 'CASCADE'), nullable = False, index = True)
    action: Mapped[ReviewActionType] = mapped_column(SQLEnum(ReviewActionType, name = 'review_action_type_enum', inherit_schema = True), nullable = False)
    comments: Mapped[str] = mapped_column(Text, nullable = True)
    reviewed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid = True), ForeignKey('users.id', ondelete = 'CASCADE'), nullable = False, index = True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone = True), server_default = func.now(), nullable = False)
    request: Mapped['ApprovalRequest'] = relationship('ApprovalRequest', back_populates = 'actions')
    reviewer: Mapped['User'] = relationship('User', back_populates = 'actions_performed')
    
    def __repr__(self = None):
        return f'''<ReviewAction id={self.id} request_id={self.request_id} action={self.action}>'''


from app.models.user import User
from app.models.request import ApprovalRequest