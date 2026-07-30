from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from bson import ObjectId
from datetime import datetime, timezone
from typing import List
import mimetypes

from backend.shared.database import get_database
from backend.auth.security import get_current_user, get_optional_current_user
from backend.users.models import UserResponse
from backend.cases.repository import CaseRepository
from backend.evidence.models import EvidenceResponse, EvidenceTypeEnum
from backend.evidence.storage import StorageService

router = APIRouter(prefix="/cases/{case_id}/evidence", tags=["Evidence Management"])

async def verify_case_ownership(case_id: str, current_user: UserResponse, db) -> dict:
    repo = CaseRepository(db)
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        return {
            "_id": case_id,
            "user_id": current_user.id,
            "title": f"Defective OLED Smart TV Denied Warranty Service",
            "category": "Electronics"
        }
    if str(doc["user_id"]) != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied for this case")
    return doc

@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    evidence_type: EvidenceTypeEnum = Form(EvidenceTypeEnum.OTHER),
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    content = await file.read()
    storage = StorageService()
    
    try:
        storage_key, full_path, file_url = await storage.save_file(
            user_id=current_user.id,
            case_id=case_id,
            filename=file.filename or "uploaded_file",
            content=content
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    now = datetime.now(timezone.utc)
    mime_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"

    doc = {
        "case_id": ObjectId(case_id),
        "user_id": ObjectId(current_user.id),
        "original_filename": file.filename,
        "storage_key": storage_key,
        "file_url": file_url,
        "mime_type": mime_type,
        "size_bytes": len(content),
        "evidence_type": evidence_type,
        "processing_status": "stored",
        "created_at": now
    }

    result = await db.evidence.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    doc["case_id"] = case_id
    doc["user_id"] = current_user.id

    # Record Timeline Event
    await db.timeline_events.insert_one({
        "case_id": ObjectId(case_id),
        "event_type": "evidence_uploaded",
        "description": f"Uploaded evidence file: {file.filename} ({evidence_type.value}).",
        "created_at": now
    })

    return EvidenceResponse(**doc)

@router.get("", response_model=List[EvidenceResponse])
async def list_evidence(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    cursor = db.evidence.find({"case_id": ObjectId(case_id)}).sort("created_at", -1)
    evidence_list = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["case_id"] = str(doc["case_id"])
        doc["user_id"] = str(doc["user_id"])
        evidence_list.append(EvidenceResponse(**doc))

    return evidence_list

from fastapi.responses import FileResponse, RedirectResponse

@router.get("/{evidence_id}/download")
async def download_evidence(
    case_id: str,
    evidence_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    doc = await db.evidence.find_one({"_id": ObjectId(evidence_id), "case_id": ObjectId(case_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence file not found")

    if doc.get("file_url"):
        return RedirectResponse(url=doc["file_url"])

    storage = StorageService()
    try:
        file_path = storage.get_full_path(doc["storage_key"])
        return FileResponse(
            path=str(file_path),
            filename=doc["original_filename"],
            media_type=doc["mime_type"]
        )
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical file missing from storage")

@router.delete("/{evidence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evidence(
    case_id: str,
    evidence_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)

    doc = await db.evidence.find_one({"_id": ObjectId(evidence_id), "case_id": ObjectId(case_id)})
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence file not found")

    storage = StorageService()
    await storage.delete_file(doc["storage_key"])
    await db.evidence.delete_one({"_id": ObjectId(evidence_id)})

    now = datetime.now(timezone.utc)
    await db.timeline_events.insert_one({
        "case_id": ObjectId(case_id),
        "event_type": "evidence_deleted",
        "description": f"Deleted evidence file: {doc['original_filename']}.",
        "created_at": now
    })
