from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import Dict, Any, List
from backend.ai.providers.groq import GroqProvider
from backend.ai.schemas import CaseAnalysis, FollowUpQuestions, UserAnswersInput
from backend.ai.prompts import (
    CASE_ANALYSIS_SYSTEM_PROMPT,
    FOLLOW_UP_SYSTEM_PROMPT,
    build_case_analysis_user_prompt,
    build_follow_up_user_prompt
)
from backend.shared.config import get_settings
from backend.shared.database import safe_object_id

import logging
logger = logging.getLogger("ai_service")

class AIService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.provider = GroqProvider()

    async def analyze_case_problem(self, case_id: str, title: str, description: str) -> CaseAnalysis:
        user_prompt = build_case_analysis_user_prompt(title, description)
        try:
            json_data = await self.provider.generate_json(CASE_ANALYSIS_SYSTEM_PROMPT, user_prompt)
            # Validate through Pydantic
            analysis = CaseAnalysis(**json_data)
        except Exception as e:
            logger.warning(f"Groq problem analysis failed ({e}). Returning safe baseline analysis.")
            analysis = CaseAnalysis(
                summary="AI analysis is temporarily unavailable. Your case has been saved safely.",
                category="general_service",
                issue_type="other",
                desired_resolution="unknown",
                key_facts=[],
                missing_information=["purchase_date", "seller_name", "preferred_resolution"],
                confidence=0.0
            )
        
        settings = get_settings()
        now = datetime.now(timezone.utc)
        safe_c_id = safe_object_id(case_id)
        
        # Store in ai_analyses collection
        await self.db.ai_analyses.insert_one({
            "case_id": safe_c_id,
            "analysis_type": "case_understanding",
            "provider": "groq",
            "model": settings.groq_model,
            "prompt_version": "case-analysis-v1",
            "result": analysis.model_dump(),
            "created_at": now
        })
        
        # Update cases collection fields
        update_fields: Dict[str, Any] = {
            "updated_at": now
        }
        if analysis.category and analysis.category != "general_service":
            update_fields["category"] = analysis.category.lower()
        if analysis.issue_type and analysis.issue_type != "other":
            update_fields["issue_type"] = analysis.issue_type.lower()
        if analysis.desired_resolution and analysis.desired_resolution != "unknown":
            update_fields["desired_resolution"] = analysis.desired_resolution.lower()
        if analysis.summary and "unavailable" not in analysis.summary:
            update_fields["summary"] = analysis.summary
        if analysis.key_facts:
            update_fields["key_facts"] = analysis.key_facts

        # Check existing case doc to fill vendor and amount if not already set
        case_doc = await self.db.cases.find_one({"_id": safe_c_id})
        if case_doc:
            if analysis.vendor_name and (not case_doc.get("vendor_name") or case_doc.get("vendor_name") == "Company / Merchant"):
                update_fields["vendor_name"] = analysis.vendor_name
            if analysis.claimed_amount and (not case_doc.get("claimed_amount") or case_doc.get("claimed_amount") == "₹25,000"):
                update_fields["claimed_amount"] = analysis.claimed_amount

        await self.db.cases.update_one(
            {"_id": safe_c_id},
            {"$set": update_fields}
        )

        # Record timeline event
        await self.db.timeline_events.insert_one({
            "case_id": safe_c_id,
            "event_type": "analysis_completed",
            "description": f"AI Problem Analysis completed. Category: {analysis.category}.",
            "created_at": now
        })
        
        return analysis

    async def generate_follow_up_questions(
        self,
        case_id: str,
        summary: str,
        missing_info: List[str],
        full_description: str = "",
        vendor_name: str = "",
        claimed_amount: str = ""
    ) -> FollowUpQuestions:
        user_prompt = build_follow_up_user_prompt(
            summary=summary,
            missing_info=missing_info,
            full_description=full_description,
            vendor_name=vendor_name,
            claimed_amount=claimed_amount
        )
        try:
            json_data = await self.provider.generate_json(FOLLOW_UP_SYSTEM_PROMPT, user_prompt)
            follow_ups = FollowUpQuestions(**json_data)
            # Ensure at least 1 question
            if not follow_ups.questions:
                raise ValueError("Empty questions list returned")
        except Exception as e:
            logger.warning(f"Groq follow-up question generation failed ({e}). Using standard follow-up questions.")
            follow_ups = FollowUpQuestions(
                questions=[
                    "Do you have a copy of the original purchase invoice or order ID?",
                    "Did the seller or service center provide a written job sheet or refusal email?"
                ]
            )

        # Programmatic dynamic post-filtering: never ask for details already present
        combined_context = f"{full_description} {vendor_name or ''} {claimed_amount or ''} {summary}".lower()
        filtered: List[str] = []
        for q in follow_ups.questions:
            ql = q.lower()
            # If vendor or platform is mentioned, drop questions asking where bought / seller name
            if any(v in combined_context for v in ["flipkart", "amazon", "croma", "hp", "samsung", "apple", "acer", "hdfc", "sbi", "reliance"]):
                if any(p in ql for p in ["where did you buy", "which store", "who is the seller", "seller or company", "merchant name", "which platform", "name of the seller"]):
                    continue
            # If price/amount is mentioned, drop questions asking how much paid
            if any(k in combined_context for k in ["₹", "rs", "inr", "30000", "30,000", "price", "amount", "cost", "paid", "worth"]):
                if any(p in ql for p in ["how much did you pay", "purchase price", "cost of the product", "amount paid", "disputed amount"]):
                    continue
            # If preferred resolution is mentioned, drop questions asking what resolution
            if any(k in combined_context for k in ["refund", "replacement", "repair", "fix", "return", "chargeback"]):
                if any(p in ql for p in ["what resolution", "preferred resolution", "what outcome", "would you prefer (refund"]):
                    continue
            filtered.append(q)

        if not filtered:
            filtered = [
                "Do you have a copy of the official purchase receipt or order invoice?",
                "Did the authorized service center provide an inspection job-sheet or written refusal?"
            ]

        follow_ups.questions = filtered[:3]
        
        settings = get_settings()
        now = datetime.now(timezone.utc)
        safe_c_id = safe_object_id(case_id)
        
        await self.db.ai_analyses.insert_one({
            "case_id": safe_c_id,
            "analysis_type": "follow_up_questions",
            "provider": "groq",
            "model": settings.groq_model,
            "prompt_version": "follow-up-v2",
            "result": follow_ups.model_dump(),
            "created_at": now
        })
        
        return follow_ups

    async def process_user_answers(self, case_id: str, user_answers: UserAnswersInput) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        safe_c_id = safe_object_id(case_id)
        
        # Save answers to case document
        await self.db.cases.update_one(
            {"_id": safe_c_id},
            {
                "$set": {
                    "user_answers": user_answers.answers,
                    "updated_at": now
                }
            }
        )

        await self.db.timeline_events.insert_one({
            "case_id": safe_c_id,
            "event_type": "user_answers_submitted",
            "description": "User provided answers to AI follow-up questions.",
            "created_at": now
        })
        
        return {"status": "success", "answers_saved": len(user_answers.answers)}
