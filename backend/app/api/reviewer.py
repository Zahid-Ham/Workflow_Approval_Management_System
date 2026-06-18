import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.api.deps import get_current_reviewer
from app.schemas import RequestResponse, ReviewCreate, ReviewResponse
from app.services import ReviewerService
from app.repositories import RequestRepository, ReviewRepository
from app.models.user import User

router = APIRouter(prefix="/reviewer", tags=["Reviewer"])


def get_reviewer_service(db: AsyncSession = Depends(get_db)) -> ReviewerService:
    """Dependency injection provider mapping ReviewerService instantiation."""
    request_repo = RequestRepository(db)
    review_repo = ReviewRepository(db)
    return ReviewerService(request_repo, review_repo)


@router.get(
    "/requests",
    response_model=List[RequestResponse],
    summary="List assigned approval requests",
    description="Returns a paginated list of approval requests assigned to the authenticated reviewer.",
)
async def list_assigned_requests(
    skip: int = Query(default=0, ge=0, description="Number of logs to skip"),
    limit: int = Query(default=10, ge=1, le=100, description="Max logs per batch"),
    current_user: User = Depends(get_current_reviewer),
    service: ReviewerService = Depends(get_reviewer_service),
) -> List[RequestResponse]:
    return await service.list_assigned_requests(
        reviewer_id=current_user.id, skip=skip, limit=limit
    )


@router.post(
    "/requests/{id}/approve",
    response_model=ReviewResponse,
    summary="Approve request",
    description="Approve a pending request. Comments are mandatory.",
)
async def approve_request(
    id: uuid.UUID,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_reviewer),
    service: ReviewerService = Depends(get_reviewer_service),
) -> ReviewResponse:
    return await service.approve_request(
        request_id=id,
        reviewer_id=current_user.id,
        comments=payload.comments,
    )


@router.post(
    "/requests/{id}/reject",
    response_model=ReviewResponse,
    summary="Reject request",
    description="Reject a pending request. Comments are mandatory.",
)
async def reject_request(
    id: uuid.UUID,
    payload: ReviewCreate,
    current_user: User = Depends(get_current_reviewer),
    service: ReviewerService = Depends(get_reviewer_service),
) -> ReviewResponse:
    return await service.reject_request(
        request_id=id,
        reviewer_id=current_user.id,
        comments=payload.comments,
    )