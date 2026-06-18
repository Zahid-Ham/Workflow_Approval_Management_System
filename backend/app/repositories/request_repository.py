import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.request import ApprovalRequest
from app.models.enums import RequestPriority, RequestStatus

class RequestRepository:
    """
    Repository layer for managing ApprovalRequest database operations.
    """
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        title: str,
        description: str,
        priority: RequestPriority,
        created_by: uuid.UUID,
        reviewer_id: Optional[uuid.UUID]
    ) -> ApprovalRequest:
        """Create a new approval request record."""
        request = ApprovalRequest(
            title=title,
            description=description,
            priority=priority,
            created_by=created_by,
            reviewer_id=reviewer_id,
            status=RequestStatus.PENDING
        )
        self.db.add(request)
        await self.db.commit()
        self.db.expunge(request)
        return await self.get_by_id(request.id)

    async def get_by_id(self, request_id: uuid.UUID) -> Optional[ApprovalRequest]:
        """Fetch request details by its UUID with eager loaded relation attributes."""
        result = await self.db.execute(
            select(ApprovalRequest)
            .filter(ApprovalRequest.id == request_id)
            .options(
                selectinload(ApprovalRequest.creator),
                selectinload(ApprovalRequest.reviewer)
            )
        )
        return result.scalars().first()

    async def get_all_by_requester(
        self,
        requester_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[ApprovalRequest]:
        """List all requests submitted by a specific user with pagination."""
        result = await self.db.execute(
            select(ApprovalRequest)
            .filter(ApprovalRequest.created_by == requester_id)
            .options(
                selectinload(ApprovalRequest.creator),
                selectinload(ApprovalRequest.reviewer)
            )
            .order_by(ApprovalRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def update(self, request: ApprovalRequest) -> ApprovalRequest:
        """Update request properties and persist state updates."""
        self.db.add(request)
        await self.db.commit()
        self.db.expunge(request)
        return await self.get_by_id(request.id)

    async def delete(self, request_id: uuid.UUID) -> bool:
        """Remove a request document from database."""
        request = await self.get_by_id(request_id)
        if request:
            await self.db.delete(request)
            await self.db.commit()
            return True
        return False

    async def get_assigned_requests(
        self,
        reviewer_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[ApprovalRequest]:
        """List all requests currently assigned to a reviewer with pagination."""
        result = await self.db.execute(
            select(ApprovalRequest)
            .filter(ApprovalRequest.reviewer_id == reviewer_id)
            .options(
                selectinload(ApprovalRequest.creator),
                selectinload(ApprovalRequest.reviewer)
            )
            .order_by(ApprovalRequest.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
