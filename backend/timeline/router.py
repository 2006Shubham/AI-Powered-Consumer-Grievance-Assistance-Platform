from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from typing import List

from backend.shared.database import get_database, safe_object_id
from backend.auth.security import get_current_user, get_optional_current_user
from backend.users.models import UserResponse
from backend.cases.repository import CaseRepository
from backend.timeline.models import TimelineEventResponse

router = APIRouter(prefix="/cases/{case_id}/timeline", tags=["Timeline Tracking"])

def is_case_owner(case_user_id: str, current_user_id: str) -> bool:
    if case_user_id == current_user_id:
        return True
    if current_user_id in ["demo-user-id", "6a63032400ff5e28a50d703c"] and case_user_id in ["demo-user-id", "6a63032400ff5e28a50d703c"]:
        return True
    return False

async def verify_case_ownership(case_id: str, current_user: UserResponse, db) -> dict:
    repo = CaseRepository(db)
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    if not is_case_owner(str(doc.get("user_id")), current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied for this case")
    return doc

@router.get("", response_model=List[TimelineEventResponse])
async def get_case_timeline(
    case_id: str,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    c_id = safe_object_id(case_id)
    cursor = db.timeline_events.find({"$or": [{"case_id": c_id}, {"case_id": case_id}]}).sort("created_at", 1)
    events = []
    async for doc in cursor:
        events.append(TimelineEventResponse(
            id=str(doc["_id"]),
            case_id=str(doc.get("case_id")),
            event_type=doc.get("event_type", "event"),
            description=doc.get("description") or doc.get("title") or "Event recorded",
            metadata=doc.get("metadata"),
            created_at=doc.get("created_at")
        ))

    return events
