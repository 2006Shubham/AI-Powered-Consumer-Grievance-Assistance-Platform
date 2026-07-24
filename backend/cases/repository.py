from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional
from backend.cases.models import CaseCreate, CaseStatusEnum

class CaseRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.cases
        self.timeline_collection = db.timeline_events

    async def create_case(self, user_id: str, case_data: CaseCreate) -> dict:
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": ObjectId(user_id),
            "title": case_data.title.strip(),
            "description": case_data.description.strip(),
            "category": case_data.category.lower().strip(),
            "issue_type": case_data.issue_type.lower().strip(),
            "desired_resolution": case_data.desired_resolution.lower().strip(),
            "status": CaseStatusEnum.PREPARING.value,
            "created_at": now,
            "updated_at": now
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id

        # Record timeline event
        await self.timeline_collection.insert_one({
            "case_id": result.inserted_id,
            "user_id": ObjectId(user_id),
            "event_type": "case_created",
            "description": f"Case '{case_data.title}' created.",
            "created_at": now
        })

        return doc

    async def get_cases_by_user(self, user_id: str) -> List[dict]:
        cursor = self.collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
        return await cursor.to_list(length=500)

    async def get_case_by_id(self, case_id: str) -> Optional[dict]:
        try:
            return await self.collection.find_one({"_id": ObjectId(case_id)})
        except Exception:
            return None

    async def update_case_status(self, case_id: str, new_status: str) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(case_id)},
            {
                "$set": {
                    "status": new_status,
                    "updated_at": now
                }
            },
            return_document=True
        )
        if result:
            await self.timeline_collection.insert_one({
                "case_id": ObjectId(case_id),
                "user_id": result["user_id"],
                "event_type": "status_changed",
                "description": f"Case status updated to '{new_status}'.",
                "created_at": now
            })
        return result
