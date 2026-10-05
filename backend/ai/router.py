from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from backend.shared.database import get_database
from backend.auth.security import get_current_user, get_optional_current_user
from backend.users.models import UserResponse
from backend.cases.repository import CaseRepository
from backend.ai.service import AIService
from backend.ai.rag.service import RAGService
from backend.ai.rag.knowledge_base import LEGAL_KNOWLEDGE_BASE
from backend.ai.providers.groq import GroqProvider
from backend.ai.schemas import CaseAnalysis, FollowUpQuestions, UserAnswersInput

router = APIRouter(prefix="/cases/{case_id}/ai", tags=["AI System"])

import logging
from backend.ai.prompts_base import CASE_ASSISTANT_SYSTEM_PROMPT

logger = logging.getLogger("ai_router")

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )
    if not is_case_owner(str(doc.get("user_id")), current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this case"
        )
    return doc

@router.post("/analyze", response_model=CaseAnalysis)
async def analyze_case(
    case_id: str,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    ai_service = AIService(db)
    analysis = await ai_service.analyze_case_problem(
        case_id=case_id,
        title=case_doc.get("title", ""),
        description=case_doc.get("description", "")
    )
    return analysis

@router.post("/follow-up", response_model=FollowUpQuestions)
async def get_follow_up_questions(
    case_id: str,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    # Check if existing analysis exists
    c_id = ObjectId(case_id) if ObjectId.is_valid(case_id) else case_id
    latest_analysis = await db.ai_analyses.find_one(
        {"case_id": c_id, "analysis_type": "case_understanding"},
        sort=[("created_at", -1)]
    )
    
    summary = case_doc.get("description", "")[:200]
    missing_info = ["purchase_date", "seller_name", "preferred_resolution"]
    
    if latest_analysis and "result" in latest_analysis:
        res = latest_analysis["result"]
        summary = res.get("summary", summary)
        missing_info = res.get("missing_information", missing_info)
        
    ai_service = AIService(db)
    follow_ups = await ai_service.generate_follow_up_questions(case_id, summary, missing_info)
    return follow_ups

@router.post("/answers")
async def submit_user_answers(
    case_id: str,
    answers_input: UserAnswersInput,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    db = get_database()
    await verify_case_ownership(case_id, current_user, db)
    
    ai_service = AIService(db)
    result = await ai_service.process_user_answers(case_id, answers_input)
    return result

from pydantic import BaseModel, Field
from typing import List, Optional

class AIChatInput(BaseModel):
    query: str = Field(..., description="User question for the AI Grievance Assistant")

class AIChatResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai_assistant(
    case_id: str,
    chat_input: AIChatInput,
    current_user: UserResponse = Depends(get_optional_current_user)
):
    db = get_database()
    case_doc = await verify_case_ownership(case_id, current_user, db)
    
    try:
        # Match relevant statutory provisions directly (sub-millisecond)
        category = str(case_doc.get("category", "")).lower()
        title_lower = str(case_doc.get("title", "")).lower()
        desc_lower = str(case_doc.get("description", "")).lower()
        query_lower = chat_input.query.lower()

        matched_docs = []
        for doc in LEGAL_KNOWLEDGE_BASE:
            doc_cat = doc.get("category", "").lower()
            doc_content = doc.get("content", "").lower()
            if (doc_cat in category or category in doc_cat or 
                doc_cat in title_lower or doc_cat in query_lower or
                any(word in doc_content for word in query_lower.split() if len(word) > 4)):
                matched_docs.append(doc)

        if not matched_docs:
            matched_docs = LEGAL_KNOWLEDGE_BASE[:2]

        context_str = ""
        sources = []
        for doc in matched_docs[:3]:
            src = doc.get("source", "Consumer Protection Act 2019")
            if src not in sources:
                sources.append(src)
            context_str += f"\n- {doc.get('title')}: {doc.get('content')}\n"

        # Evidence files
        evidence_cursor = db.evidence.find({"case_id": case_id})
        evidence_files = await evidence_cursor.to_list(length=20)
        evidence_str = ", ".join([f"{e.get('original_filename')} ({e.get('evidence_type', 'doc')})" for e in evidence_files]) if evidence_files else "None attached yet"

        # User answers
        user_answers = case_doc.get("user_answers", {})
        answers_str = "\n".join([f"- {k}: {v}" for k, v in user_answers.items()]) if user_answers else "None recorded yet"

        user_prompt = (
            f"### CASE CONTEXT\n"
            f"- Title: {case_doc.get('title')}\n"
            f"- Category: {case_doc.get('category', 'general')}\n"
            f"- Status: {case_doc.get('status', 'preparing')}\n"
            f"- Merchant/Vendor: {case_doc.get('vendor_name', 'Not specified')}\n"
            f"- Claimed Amount: {case_doc.get('claimed_amount', 'Not specified')}\n"
            f"- Description: {case_doc.get('description', '')}\n\n"
            f"### FACTUAL DETAILS PROVIDED BY USER\n{answers_str}\n\n"
            f"### ATTACHED EVIDENCE FILES\n{evidence_str}\n\n"
            f"### RETRIEVED VERIFIED LEGAL CONTEXT\n{context_str}\n\n"
            f"### USER'S CURRENT QUESTION\n{chat_input.query}\n\n"
            f"Provide a clear, practical, and grounded answer in clean markdown format (use bullet points or numbered lists where appropriate, bold key labels, and keep paragraphs well-spaced):"
        )

        provider = GroqProvider()
        answer = await provider.generate_text(
            system_prompt=CASE_ASSISTANT_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.2
        )
        return AIChatResponse(answer=answer, sources=sources if sources else ["Consumer Protection Act 2019"])
    except Exception as e:
        logger.warning(f"AI Assistant call failed ({e}). Returning graceful fallback.")
        return AIChatResponse(
            answer="I'm unable to analyze this case right now. Your existing case information is unchanged. Please try again in a moment.",
            sources=["Case Record"]
        )
