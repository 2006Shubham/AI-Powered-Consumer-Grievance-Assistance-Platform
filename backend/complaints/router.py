from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from typing import Optional

from backend.auth.security import get_current_user
from backend.complaints.models import (
    ComplaintCreateInput,
    ComplaintUpdateInput,
    ComplaintResponse,
    ComplaintExportFormat
)
from backend.complaints.service import ComplaintService

router = APIRouter(prefix="/cases/{case_id}/complaint", tags=["AI Complaint Generator"])
service = ComplaintService()

@router.post("/generate", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def generate_complaint(
    case_id: str,
    input_data: Optional[ComplaintCreateInput] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])
        custom_inst = input_data.custom_instructions if input_data else None
        doc = await service.generate_complaint(case_id, user_id, custom_instructions=custom_inst)
        return doc
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate complaint: {str(e)}")

@router.get("", response_model=ComplaintResponse)
async def get_complaint(
    case_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = str(current_user["_id"])
    doc = await service.get_complaint(case_id, user_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No complaint draft found for this case.")
    return doc

@router.put("", response_model=ComplaintResponse)
async def update_complaint(
    case_id: str,
    update_input: ComplaintUpdateInput,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])
        doc = await service.update_complaint(
            case_id=case_id,
            user_id=user_id,
            content=update_input.content,
            title=update_input.title,
            status=update_input.status
        )
        return doc
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update complaint draft: {str(e)}")

@router.get("/export")
async def export_complaint(
    case_id: str,
    format: ComplaintExportFormat = ComplaintExportFormat.TXT,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])
        file_bytes, filename, media_type = await service.export_complaint(case_id, user_id, export_format=format.value)
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Export failed: {str(e)}")
