from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime, timezone
from backend.shared.database import get_database
from backend.auth.security import get_current_user
from backend.users.models import UserResponse
from backend.cases.models import CaseCreate, CaseStatusUpdate, CaseResponse, CaseStatusEnum
from backend.cases.repository import CaseRepository

router = APIRouter(prefix="/cases", tags=["Cases"])

def doc_to_case_response(doc: dict) -> CaseResponse:
    return CaseResponse(
        id=str(doc["_id"]),
        user_id=str(doc["user_id"]),
        title=doc["title"],
        description=doc["description"],
        category=doc.get("category", "general_service"),
        issue_type=doc.get("issue_type", "other"),
        desired_resolution=doc.get("desired_resolution", "unknown"),
        status=CaseStatusEnum(doc.get("status", "preparing")),
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
        updated_at=doc.get("updated_at", datetime.now(timezone.utc))
    )

@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def create_case(
    case_data: CaseCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    repo = CaseRepository(db)
    doc = await repo.create_case(user_id=current_user.id, case_data=case_data)
    return doc_to_case_response(doc)

@router.get("", response_model=List[CaseResponse])
async def list_cases(current_user: UserResponse = Depends(get_current_user)):
    db = get_database()
    repo = CaseRepository(db)
    docs = await repo.get_cases_by_user(user_id=current_user.id)
    return [doc_to_case_response(d) for d in docs]

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    repo = CaseRepository(db)
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Ownership verification
    if str(doc["user_id"]) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this case"
        )
    
    return doc_to_case_response(doc)

@router.patch("/{case_id}/status", response_model=CaseResponse)
async def update_case_status(
    case_id: str,
    status_update: CaseStatusUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    repo = CaseRepository(db)
    
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    
    # Ownership verification
    if str(doc["user_id"]) != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this case"
        )
    
    updated_doc = await repo.update_case_status(case_id, status_update.status.value)
    return doc_to_case_response(updated_doc)
