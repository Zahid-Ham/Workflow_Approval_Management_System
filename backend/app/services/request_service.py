import uuid
from typing import List, Optional, Dict, Any
from app.repositories import RequestRepository, UserRepository
from app.models.request import ApprovalRequest
from app.models.enums import RequestPriority, RequestStatus, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException, ConflictException


class RequestService:
    """
    Business service layer managing approval requests lifecycle.
    """

    def __init__(self, request_repo: RequestRepository, user_repo: UserRepository):
        self.request_repo = request_repo
        self.user_repo = user_repo

    async def _validate_reviewer(self, reviewer_id: uuid.UUID) -> None:
        """Enforces that a request must have an assigned reviewer with the Reviewer role."""
        reviewer = await self.user_repo.get_by_id(reviewer_id)
        if reviewer is None:
            raise NotFoundException(f"Reviewer with ID {reviewer_id} not found.")
        if reviewer.role != UserRole.REVIEWER:
            raise ValidationException("Assigned user does not have the Reviewer role.")

    async def create_request(
        self,
        title: str,
        description: str,
        priority: RequestPriority,
        created_by: uuid.UUID,
        reviewer_id: Optional[uuid.UUID] = None,
    ) -> ApprovalRequest:
        """Create a new approval request after validating reviewer constraints."""
        if reviewer_id:
            await self._validate_reviewer(reviewer_id)
        return await self.request_repo.create(
            title=title,
            description=description,
            priority=priority,
            created_by=created_by,
            reviewer_id=reviewer_id,
        )

    async def fetch_request(
        self,
        request_id: uuid.UUID,
        user_id: uuid.UUID,
        role: str,
    ) -> ApprovalRequest:
        """Fetch request details. Enforces visibility boundaries."""
        request = await self.request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundException(f"Approval request with ID {request_id} not found.")
        # Requesters can only see their own requests; Reviewers can only see assigned ones
        if role == UserRole.REQUESTER and request.created_by != user_id:
            raise ForbiddenException("You do not have access to this request.")
        if role == UserRole.REVIEWER and request.reviewer_id != user_id:
            raise ForbiddenException("This request is not assigned to you.")
        return request

    async def update_request(
        self,
        request_id: uuid.UUID,
        requester_id: uuid.UUID,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[RequestPriority] = None,
        reviewer_id: Optional[uuid.UUID] = None,
    ) -> ApprovalRequest:
        """Update request. Enforces state checks, ownership, and reviewer roles."""
        request = await self.request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundException(f"Approval request with ID {request_id} not found.")
        if request.created_by != requester_id:
            raise ForbiddenException("You are not the owner of this request.")
        if request.status != RequestStatus.PENDING:
            raise ConflictException("Only PENDING requests can be updated.")
        if reviewer_id is not None:
            await self._validate_reviewer(reviewer_id)
            request.reviewer_id = reviewer_id
        if title is not None:
            request.title = title
        if description is not None:
            request.description = description
        if priority is not None:
            request.priority = priority
        return await self.request_repo.update(request)

    async def delete_request(self, request_id: uuid.UUID, requester_id: uuid.UUID) -> None:
        """Delete request. Only allowed for owner if request is in PENDING status."""
        request = await self.request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundException(f"Approval request with ID {request_id} not found.")
        if request.created_by != requester_id:
            raise ForbiddenException("You are not the owner of this request.")
        if request.status != RequestStatus.PENDING:
            raise ConflictException("Only PENDING requests can be deleted.")
        await self.request_repo.delete(request_id)

    async def list_requester_requests(
        self,
        requester_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ApprovalRequest]:
        """Fetch all requests created by a requester with pagination offsets."""
        return await self.request_repo.get_all_by_requester(
            requester_id=requester_id, skip=skip, limit=limit
        )

    async def fetch_requester_dashboard(
        self,
        requester_id: uuid.UUID,
        skip: int = 0,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Compile and return statistics and paginated requests logs for dashboard view."""
        all_requests = await self.request_repo.get_all_by_requester(
            requester_id=requester_id, skip=0, limit=1000
        )
        total = len(all_requests)
        pending = sum(1 for r in all_requests if r.status == RequestStatus.PENDING)
        approved = sum(1 for r in all_requests if r.status == RequestStatus.APPROVED)
        rejected = sum(1 for r in all_requests if r.status == RequestStatus.REJECTED)
        paginated = await self.request_repo.get_all_by_requester(
            requester_id=requester_id, skip=skip, limit=limit
        )
        return {
            "total": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "requests": paginated,
        }
