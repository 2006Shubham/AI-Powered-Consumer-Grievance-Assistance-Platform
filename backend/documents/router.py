from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from backend.auth.security import get_current_user, get_optional_current_user
from backend.users.models import UserResponse
from backend.documents.service import EvidenceIntelligenceService

router = APIRouter(prefix="/cases/{case_id}", tags=["Evidence Intelligence & OCR"])
service = EvidenceIntelligenceService()

@router.post("/evidence/{evidence_id}/process")
async def process_evidence_ocr(
    case_id: str,
    evidence_id: str,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    try:
        user_id = current_user.id
        result = await service.process_evidence(case_id, evidence_id, user_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"OCR processing failed: {str(e)}")

@router.get("/evidence-checklist")
async def get_evidence_checklist(
    case_id: str,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    try:
        user_id = current_user.id
        checklist = await service.get_evidence_checklist(case_id, user_id)
        return checklist
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch evidence checklist: {str(e)}")
