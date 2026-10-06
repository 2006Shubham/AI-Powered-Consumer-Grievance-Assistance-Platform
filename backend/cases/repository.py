from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import List, Optional
from backend.cases.models import CaseCreate, CaseStatusEnum

from backend.shared.database import safe_object_id

import re

def extract_case_metadata(description: str, title: str = ""):
    text = f"{title} {description}".strip()
    
    # 1. Claimed Amount Extraction
    amount = None
    m_curr = re.search(r'(?:₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})', text, re.IGNORECASE)
    if m_curr:
        try:
            val = int(m_curr.group(1).replace(",", ""))
            amount = f"₹{val:,}"
        except ValueError:
            pass

    if not amount:
        m_ctx = re.search(r'\b(?:bought|paid|spent|cost|worth|for|price of)\s+(?:for\s+)?(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,7})\b', text, re.IGNORECASE)
        if m_ctx:
            try:
                val = int(m_ctx.group(1).replace(",", ""))
                if val >= 100:
                    amount = f"₹{val:,}"
            except ValueError:
                pass

    # 2. Known Vendor Extraction
    vendor = None
    known_vendors = [
        "HP India", "HP", "Hewlett Packard",
        "Acer", "Samsung", "Apple", "Flipkart", "Amazon.in", "Amazon",
        "HDFC Bank", "HDFC", "SBI", "ICICI Bank", "Axis Bank",
        "Tata Croma", "Croma", "Reliance Digital", "OnePlus", "Dell",
        "Lenovo", "Asus", "Xiaomi", "Boat", "Noise", "Myntra", "Swiggy", "Zomato"
    ]
    detected = []
    for v in known_vendors:
        if re.search(r'\b' + re.escape(v) + r'\b', text, re.IGNORECASE):
            if not any(v in existing for existing in detected):
                detected.append(v)
    if detected:
        vendor = " / ".join(detected[:2])

    return vendor, amount

class CaseRepository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.cases
        self.timeline_collection = db.timeline_events

    async def create_case(self, user_id: str, case_data: CaseCreate) -> dict:
        now = datetime.now(timezone.utc)
        u_id = safe_object_id(user_id)

        # Extract vendor and amount if not supplied explicitly
        auto_vendor, auto_amount = extract_case_metadata(case_data.description, case_data.title)
        resolved_vendor = case_data.vendor_name.strip() if case_data.vendor_name else auto_vendor
        resolved_amount = case_data.claimed_amount.strip() if case_data.claimed_amount else auto_amount

        doc = {
            "user_id": u_id,
            "title": case_data.title.strip(),
            "description": case_data.description.strip(),
            "category": case_data.category.lower().strip() if case_data.category else "general_service",
            "issue_type": case_data.issue_type.lower().strip() if case_data.issue_type else "other",
            "desired_resolution": case_data.desired_resolution.lower().strip() if case_data.desired_resolution else "unknown",
            "vendor_name": resolved_vendor,
            "claimed_amount": resolved_amount,
            "status": CaseStatusEnum.PREPARING.value,
            "user_answers": {},
            "created_at": now,
            "updated_at": now
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id

        # Record timeline event
        await self.timeline_collection.insert_one({
            "case_id": result.inserted_id,
            "user_id": u_id,
            "event_type": "case_created",
            "description": f"Grievance case registered.",
            "created_at": now
        })

        return doc

    async def get_cases_by_user(self, user_id: str) -> List[dict]:
        u_id = safe_object_id(user_id)
        if str(user_id) in ["demo-user-id", "6a63032400ff5e28a50d703c"]:
            query = {
                "$or": [
                    {"user_id": u_id},
                    {"user_id": user_id},
                    {"user_id": "demo-user-id"},
                    {"user_id": ObjectId("6a63032400ff5e28a50d703c")}
                ]
            }
        else:
            query = {"$or": [{"user_id": u_id}, {"user_id": user_id}]}
        cursor = self.collection.find(query).sort("created_at", -1)
        return await cursor.to_list(length=500)

    async def get_case_by_id(self, case_id: str) -> Optional[dict]:
        c_id = safe_object_id(case_id)
        return await self.collection.find_one({"$or": [{"_id": c_id}, {"_id": case_id}]})

    async def update_case_status(self, case_id: str, new_status: str) -> Optional[dict]:
        now = datetime.now(timezone.utc)
        c_id = safe_object_id(case_id)
        result = await self.collection.find_one_and_update(
            {"$or": [{"_id": c_id}, {"_id": case_id}]},
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
                "case_id": result["_id"],
                "user_id": result.get("user_id"),
                "event_type": "status_changed",
                "description": f"Status updated to '{new_status.replace('_', ' ').title()}'.",
                "created_at": now
            })
        return result
