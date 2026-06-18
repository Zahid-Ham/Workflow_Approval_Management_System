from typing import List
from uuid import UUID
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.action import ReviewAction
from app.repositories.base import BaseRepository

class ActionRepository(BaseRepository[ReviewAction]):
    def __init__(self, db: AsyncSession):
        super().__init__(ReviewAction, db)

    async def get_by_request_id(self, request_id: UUID) -> List[ReviewAction]:
        result = await self.db.execute(
            select(ReviewAction).filter(ReviewAction.request_id == request_id)
        )
        return list(result.scalars().all())
