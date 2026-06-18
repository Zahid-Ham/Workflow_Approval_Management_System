import uuid
from typing import List
from app.repositories import RequestRepository, ReviewRepository
from app.models.request import ApprovalRequest
from app.models.action import ReviewAction
from app.models.enums import RequestStatus, ReviewActionType, UserRole
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException


class ReviewerService:
    """
    Business service layer managing reviewer decision workflows.
    """

    def __init__(self, request_repo: RequestRepository, review_repo: ReviewRepository):
        self.request_repo = request_repo
        self.review_repo = review_repo

    async def list_assigned_requests(
        self,
        reviewer_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ApprovalRequest]:
        """Fetch all requests assigned to a specific reviewer with pagination offsets."""
        return await self.request_repo.get_assigned_requests(
            reviewer_id=reviewer_id, skip=skip, limit=limit
        )

    async def _validate_review_submission(
        self,
        request_id: uuid.UUID,
        reviewer_id: uuid.UUID,
    ) -> ApprovalRequest:
        """Helper validating reviewer authorization, request existence, pending status, and duplicate reviews."""
        request = await self.request_repo.get_by_id(request_id)
        if request is None:
            raise NotFoundException(f"Approval request with ID {request_id} not found.")
        if request.reviewer_id != reviewer_id:
            raise ForbiddenException("This request is not assigned to you.")
        if request.status != RequestStatus.PENDING:
            raise ConflictException(
                f"Request has already been {request.status.value.lower()} and cannot be reviewed again."
            )
        return request

    async def approve_request(
        self,
        request_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        comments: str,
    ) -> ReviewAction:
        """Approve an assigned pending request and write an audit trace log."""
        request = await self._validate_review_submission(request_id, reviewer_id)
        # Update request status
        request.status = RequestStatus.APPROVED
        await self.request_repo.update(request)
        # Log audit action
        return await self.review_repo.create_review_action(
            request_id=request_id,
            action=ReviewActionType.APPROVED,
            comments=comments,
            reviewed_by=reviewer_id,
        )

    async def reject_request(
        self,
        request_id: uuid.UUID,
        reviewer_id: uuid.UUID,
        comments: str,
    ) -> ReviewAction:
        """Reject an assigned pending request and write an audit trace log."""
        request = await self._validate_review_submission(request_id, reviewer_id)
        # Update request status
        request.status = RequestStatus.REJECTED
        await self.request_repo.update(request)
        # Log audit action
        return await self.review_repo.create_review_action(
            request_id=request_id,
            action=ReviewActionType.REJECTED,
            comments=comments,
            reviewed_by=reviewer_id,
        )
