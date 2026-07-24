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

class AIService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.provider = GroqProvider()

    async def analyze_case_problem(self, case_id: str, title: str, description: str) -> CaseAnalysis:
        user_prompt = build_case_analysis_user_prompt(title, description)
        json_data = await self.provider.generate_json(CASE_ANALYSIS_SYSTEM_PROMPT, user_prompt)
        
        # Validate through Pydantic
        analysis = CaseAnalysis(**json_data)
        
        settings = get_settings()
        now = datetime.now(timezone.utc)
        
        # Store in ai_analyses collection
        await self.db.ai_analyses.insert_one({
            "case_id": ObjectId(case_id),
            "analysis_type": "case_understanding",
            "provider": "groq",
            "model": settings.groq_model,
            "prompt_version": "case-analysis-v1",
            "result": analysis.model_dump(),
            "created_at": now
        })
        
        # Update cases collection fields
        await self.db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {
                "$set": {
                    "category": analysis.category.lower(),
                    "issue_type": analysis.issue_type.lower(),
                    "desired_resolution": analysis.desired_resolution.lower(),
                    "updated_at": now
                }
            }
        )

        # Record timeline event
        await self.db.timeline_events.insert_one({
            "case_id": ObjectId(case_id),
            "event_type": "analysis_completed",
            "description": f"AI Problem Analysis completed. Category: {analysis.category}.",
            "created_at": now
        })
        
        return analysis

    async def generate_follow_up_questions(self, case_id: str, summary: str, missing_info: List[str]) -> FollowUpQuestions:
        user_prompt = build_follow_up_user_prompt(summary, missing_info)
        json_data = await self.provider.generate_json(FOLLOW_UP_SYSTEM_PROMPT, user_prompt)
        
        follow_ups = FollowUpQuestions(**json_data)
        
        settings = get_settings()
        now = datetime.now(timezone.utc)
        
        await self.db.ai_analyses.insert_one({
            "case_id": ObjectId(case_id),
            "analysis_type": "follow_up_questions",
            "provider": "groq",
            "model": settings.groq_model,
            "prompt_version": "follow-up-v1",
            "result": follow_ups.model_dump(),
            "created_at": now
        })
        
        return follow_ups

    async def process_user_answers(self, case_id: str, user_answers: UserAnswersInput) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        
        # Save answers to case document
        await self.db.cases.update_one(
            {"_id": ObjectId(case_id)},
            {
                "$set": {
                    "user_answers": user_answers.answers,
                    "updated_at": now
                }
            }
        )

        await self.db.timeline_events.insert_one({
            "case_id": ObjectId(case_id),
            "event_type": "user_answers_submitted",
            "description": "User provided answers to AI follow-up questions.",
            "created_at": now
        })
        
        return {"status": "success", "answers_saved": len(user_answers.answers)}
