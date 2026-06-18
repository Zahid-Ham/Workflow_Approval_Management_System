import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.models.user import User
from app.models.request import ApprovalRequest
from app.models.action import ReviewAction
from app.models.enums import UserRole, RequestPriority, RequestStatus, ReviewActionType
from app.repositories import UserRepository, RequestRepository, ReviewRepository

router = APIRouter(prefix="/seed", tags=["Seed"])

@router.post(
    "/demo-data",
    status_code=status.HTTP_201_CREATED,
    summary="Seed mock/demo data",
    description="Seeds realistic mock users, requests, and reviews if they do not already exist."
)
async def seed_demo_data(db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    request_repo = RequestRepository(db)
    review_repo = ReviewRepository(db)

    # 1. Create Mock Users
    # We create a few reviewers and requesters
    requester_email = "mock.requester@example.com"
    reviewer_email = "mock.reviewer@example.com"
    
    requester = await user_repo.get_by_email(requester_email)
    if not requester:
        requester = await user_repo.create(
            name="Mock Requester",
            email=requester_email,
            google_id="mock_google_id_requester",
            role=UserRole.REQUESTER
        )

    reviewer1 = await user_repo.get_by_email(reviewer_email)
    if not reviewer1:
        reviewer1 = await user_repo.create(
            name="Mock Reviewer",
            email=reviewer_email,
            google_id="mock_google_id_reviewer",
            role=UserRole.REVIEWER
        )

    reviewer_second_email = "jane.reviewer@example.com"
    reviewer2 = await user_repo.get_by_email(reviewer_second_email)
    if not reviewer2:
        reviewer2 = await user_repo.create(
            name="Jane Reviewer",
            email=reviewer_second_email,
            google_id="mock_google_id_reviewer2",
            role=UserRole.REVIEWER
        )

    # 2. Check if we already have requests for our mock requester
    existing_requests = await request_repo.get_all_by_requester(requester.id, limit=10)
    if not existing_requests:
        # Seed several requests with different priorities and statuses
        
        # Request 1: Pending (Assigned to reviewer1)
        req1 = await request_repo.create(
            title="Q3 Budget Approval Request",
            description="Seeking formal sign-off on the Q3 departmental budget allocations. This covers software licenses, marketing campaigns, and hardware upgrades for the engineering team.",
            priority=RequestPriority.HIGH,
            created_by=requester.id,
            reviewer_id=reviewer1.id
        )

        # Request 2: Approved (Assigned to reviewer1, with review action)
        req2 = await request_repo.create(
            title="AWS Production Server Scale-up",
            description="We need to increase the instance size of our primary production database to handle the spike in peak traffic. Expected cost increases by $400/month.",
            priority=RequestPriority.HIGH,
            created_by=requester.id,
            reviewer_id=reviewer1.id
        )
        req2.status = RequestStatus.APPROVED
        await request_repo.update(req2)
        await review_repo.create_review_action(
            request_id=req2.id,
            action=ReviewActionType.APPROVED,
            comments="Database performance issues verified. Budget approved for the production DB resize.",
            reviewed_by=reviewer1.id
        )

        # Request 3: Rejected (Assigned to reviewer1, with review action)
        req3 = await request_repo.create(
            title="Premium Office Chairs Reimbursement",
            description="Requesting reimbursement for ergonomic Herman Miller Aeron chairs for the remote home office setup.",
            priority=RequestPriority.LOW,
            created_by=requester.id,
            reviewer_id=reviewer1.id
        )
        req3.status = RequestStatus.REJECTED
        await request_repo.update(req3)
        await review_repo.create_review_action(
            request_id=req3.id,
            action=ReviewActionType.REJECTED,
            comments="Our home office equipment policy caps ergonomic chair reimbursements at $300. Please resubmit using a qualifying model.",
            reviewed_by=reviewer1.id
        )

        # Request 4: Pending (Assigned to reviewer2)
        await request_repo.create(
            title="New Hire Onboarding Software Licenses",
            description="Need licenses for Slack, GitHub Enterprise, and Figma for the 3 incoming engineers starting next month.",
            priority=RequestPriority.MEDIUM,
            created_by=requester.id,
            reviewer_id=reviewer2.id
        )

        # Request 5: Pending (Assigned to reviewer1, low priority)
        await request_repo.create(
            title="Marketing SaaS Subscription",
            description="Trial request for Buffer Premium plan to schedule social media postings across multiple platforms.",
            priority=RequestPriority.LOW,
            created_by=requester.id,
            reviewer_id=reviewer1.id
        )

    return {"status": "success", "message": "Demo data seeded successfully"}
