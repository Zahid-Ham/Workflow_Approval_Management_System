import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.api.deps import get_current_user, get_current_requester
from app.schemas import RequestCreate, RequestUpdate, RequestResponse
from app.services import RequestService
from app.repositories import RequestRepository, UserRepository
from app.models.user import User

router = APIRouter(prefix="/requests", tags=["Requests"])


def get_request_service(db: AsyncSession = Depends(get_db)) -> RequestService:
    """Dependency injection provider mapping RequestService instantiation."""
    request_repo = RequestRepository(db)
    user_repo = UserRepository(db)
    return RequestService(request_repo, user_repo)


@router.post(
    "",
    response_model=RequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new approval request",
    description="Submits a new approval request document. Allowed for Requester role only.",
)
async def create_request(
    payload: RequestCreate,
    current_user: User = Depends(get_current_requester),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    return await service.create_request(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        created_by=current_user.id,
        reviewer_id=payload.reviewer_id,
    )


@router.get(
    "",
    response_model=List[RequestResponse],
    summary="List submitted requests",
    description="Returns a paginated list of approval requests created by the authenticated requester.",
)
async def list_requests(
    skip: int = Query(default=0, ge=0, description="Number of logs to skip"),
    limit: int = Query(default=10, ge=1, le=100, description="Max logs per batch"),
    current_user: User = Depends(get_current_requester),
    service: RequestService = Depends(get_request_service),
) -> List[RequestResponse]:
    return await service.list_requester_requests(
        requester_id=current_user.id, skip=skip, limit=limit
    )


@router.get(
    "/{id}",
    response_model=RequestResponse,
    summary="Fetch request details",
    description="Retrieve details of a specific request. Access is restricted to creator or assigned reviewer.",
)
async def get_request(
    id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    return await service.fetch_request(
        request_id=id,
        user_id=current_user.id,
        role=current_user.role,
    )


@router.put(
    "/{id}",
    response_model=RequestResponse,
    summary="Update request details",
    description="Modify request title, body, priority, or reviewer. Allowed only while request status remains PENDING.",
)
async def update_request(
    id: uuid.UUID,
    payload: RequestUpdate,
    current_user: User = Depends(get_current_requester),
    service: RequestService = Depends(get_request_service),
) -> RequestResponse:
    return await service.update_request(
        request_id=id,
        requester_id=current_user.id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        reviewer_id=payload.reviewer_id,
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete approval request",
    description="Deletes request document from queue. Allowed only for creator when status is PENDING.",
)
async def delete_request(
    id: uuid.UUID,
    current_user: User = Depends(get_current_requester),
    service: RequestService = Depends(get_request_service),
) -> None:
    await service.delete_request(request_id=id, requester_id=current_user.id)