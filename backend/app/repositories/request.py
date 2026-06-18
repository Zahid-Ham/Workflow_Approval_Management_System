from typing import List
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.request import ApprovalRequest
from app.repositories.base import BaseRepository

class RequestRepository(BaseRepository[ApprovalRequest]):
    def __init__(self, db: AsyncSession):
        super().__init__(ApprovalRequest, db)

    async def get_by_creator(self, user_id: UUID) -> List[ApprovalRequest]:
        result = await self.db.execute(
            select(ApprovalRequest).filter(ApprovalRequest.created_by == user_id)
        )
        return list(result.scalars().all())

    async def get_by_reviewer(self, reviewer_id: UUID) -> List[ApprovalRequest]:
        result = await self.db.execute(
            select(ApprovalRequest).filter(ApprovalRequest.reviewer_id == reviewer_id)
        )
        return list(result.scalars().all())
