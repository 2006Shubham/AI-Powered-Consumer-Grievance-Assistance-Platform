from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List

from backend.shared.database import get_database
from backend.auth.security import get_current_user
from backend.users.models import UserResponse
from backend.cases.repository import CaseRepository
from backend.timeline.models import TimelineEventResponse

router = APIRouter(prefix="/cases/{case_id}/timeline", tags=["Timeline Tracking"])

async def verify_case_ownership(case_id: str, current_user: UserResponse, db) -> dict:
    repo = CaseRepository(db)
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    if str(doc["user_id"]) != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied for this case")
    return doc

@router.get("", response_model=List[TimelineEventResponse])
async def get_case_timeline(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    cursor = db.timeline_events.find({"case_id": ObjectId(case_id)}).sort("created_at", 1)
    events = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["case_id"] = str(doc["case_id"])
        events.append(TimelineEventResponse(**doc))

    return events
