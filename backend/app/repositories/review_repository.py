import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.action import ReviewAction
from app.models.enums import ReviewActionType

class ReviewRepository:
    """
    Repository layer for managing ReviewAction audit logging database operations.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_review_action(
        self,
        request_id: uuid.UUID,
        action: ReviewActionType,
        comments: str,
        reviewed_by: uuid.UUID
    ) -> ReviewAction:
        """Log a new reviewer decision action."""
        review_action = ReviewAction(
            request_id=request_id,
            action=action,
            comments=comments,
            reviewed_by=reviewed_by
        )
        self.db.add(review_action)
        await self.db.commit()
        await self.db.refresh(review_action)
        return review_action

    async def get_reviews_for_request(self, request_id: uuid.UUID) -> List[ReviewAction]:
        """Fetch audit trail reviews history linked to a specific request."""
        result = await self.db.execute(
            select(ReviewAction)
            .filter(ReviewAction.request_id == request_id)
            .options(selectinload(ReviewAction.reviewer))
            .order_by(ReviewAction.reviewed_at.desc())
        )
        return list(result.scalars().all())
