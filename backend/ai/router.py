from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from backend.shared.database import get_database
from backend.auth.security import get_current_user
from backend.users.models import UserResponse
from backend.cases.repository import CaseRepository
from backend.ai.service import AIService
from backend.ai.schemas import CaseAnalysis, FollowUpQuestions, UserAnswersInput

router = APIRouter(prefix="/cases/{case_id}/ai", tags=["AI System"])

async def verify_case_ownership(case_id: str, current_user: UserResponse, db) -> dict:
    repo = CaseRepository(db)
    doc = await repo.get_case_by_id(case_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    if str(doc["user_id"]) != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied for this case")
    return doc

@router.post("/analyze", response_model=CaseAnalysis)
async def analyze_case(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    ai_service = AIService(db)
    try:
        analysis = await ai_service.analyze_case_problem(
            case_id=case_id,
            title=case_doc["title"],
            description=case_doc["description"]
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Problem Analysis failed: {str(e)}"
        )

@router.post("/follow-up", response_model=FollowUpQuestions)
async def get_follow_up_questions(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    # Check if existing analysis exists
    latest_analysis = await db.ai_analyses.find_one(
        {"case_id": ObjectId(case_id), "analysis_type": "case_understanding"},
        sort=[("created_at", -1)]
    )
    
    summary = case_doc["description"][:200]
    missing_info = ["purchase_date", "seller_name", "preferred_resolution"]
    
    if latest_analysis and "result" in latest_analysis:
        res = latest_analysis["result"]
        summary = res.get("summary", summary)
        missing_info = res.get("missing_information", missing_info)
        
    ai_service = AIService(db)
    try:
        follow_ups = await ai_service.generate_follow_up_questions(case_id, summary, missing_info)
        return follow_ups
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generating follow-up questions failed: {str(e)}"
        )

@router.post("/answers")
async def submit_user_answers(
    case_id: str,
    answers_input: UserAnswersInput,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)
    
    ai_service = AIService(db)
    result = await ai_service.process_user_answers(case_id, answers_input)
    return result

from backend.ai.rag.service import RAGService, RAGGuidanceResponse

@router.post("/guidance", response_model=RAGGuidanceResponse)
async def get_grounded_legal_guidance(
    case_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    rag_service = RAGService(db)
    try:
        guidance = await rag_service.generate_grounded_guidance(
            case_id=case_id,
            title=case_doc["title"],
            description=case_doc["description"],
            category=case_doc.get("category", "general_service")
        )
        return guidance
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG Legal Guidance generation failed: {str(e)}"
        )
