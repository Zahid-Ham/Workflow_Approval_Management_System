"import asyncio
import logging
import sys
import os

# Add project root to PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import AsyncSessionLocal, engine
from app.models import User, ApprovalRequest, ReviewAction, Base
from app.models.enums import UserRole, RequestPriority, RequestStatus, ReviewActionType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_data")

async def seed():
    logger.info("Starting database seeding...")
    
    async with AsyncSessionLocal() as db:
        # Check if users already exist
        from sqlalchemy import select
        result = await db.execute(select(User))
        if len(result.scalars().all()) > 0:
            logger.info("Database already contains user records. Seeding skipped.")
            return

        # 1. Create Requesters (3 accounts)
        requester1 = User(
            name="Alice Smith",
            email="alice.requester@example.com",
            google_id="google-alice-id",
            role=UserRole.REQUESTER
        )
        requester2 = User(
            name="Bob Jones",
            email="bob.requester@example.com",
            google_id="google-bob-id",
            role=UserRole.REQUESTER
        )
        requester3 = User(
            name="Charlie Brown",
            email="charlie.requester@example.com",
            google_id="google-charlie-id",
            role=UserRole.REQUESTER
        )

        # 2. Create Reviewers (2 accounts)
        reviewer1 = User(
            name="Dave Miller",
            email="dave.reviewer@example.com",
            google_id="google-dave-id",
            role=UserRole.REVIEWER
        )
        reviewer2 = User(
            name="Ellen Davis",
            email="ellen.reviewer@example.com",
            google_id="google-ellen-id",
            role=UserRole.REVIEWER
        )

        db.add_all([requester1, requester2, reque
<truncated 2400 bytes>