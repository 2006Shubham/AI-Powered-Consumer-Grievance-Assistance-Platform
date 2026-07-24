from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from backend.ai.providers.groq import GroqProvider
from backend.ai.rag.embeddings import EmbeddingService
from backend.ai.rag.ingestion import initialize_vector_database
from backend.shared.config import get_settings

class RAGGuidanceResponse(BaseModel):
    summary_analysis: str = Field(..., description="Analysis of user complaint against statutory rights")
    applicable_laws: List[Dict[str, str]] = Field(..., description="List of applicable legal provisions with title and source")
    recommended_remedies: List[str] = Field(..., description="Actionable statutory remedies available to the consumer")
    next_steps: List[str] = Field(..., description="Step-by-step guidance on pursuing redressal")

RAG_SYSTEM_PROMPT = """You are an expert consumer rights AI legal advisor.
Your role is to analyze a consumer complaint against the provided statutory legal provisions retrieved from our knowledge base and generate grounded legal guidance.

STRICT INSTRUCTIONS:
- Base your analysis ONLY on the retrieved legal provisions provided below.
- Do NOT invent or make up statutory section numbers not present in the context.
- Output ONLY a valid JSON object matching the required schema.

Required JSON Schema:
{
  "summary_analysis": "Explanation of how consumer protection laws apply to this case...",
  "applicable_laws": [
    {
      "title": "Title of law",
      "source": "Exact section / act reference",
      "summary": "Brief summary of how it protects the consumer"
    }
  ],
  "recommended_remedies": [
    "Full refund of purchase amount",
    "Free replacement of defective unit"
  ],
  "next_steps": [
    "Send formal legal notice to seller giving 15 days deadline",
    "File complaint on National Consumer Helpline (NCH) portal"
  ]
}
Produce ONLY valid JSON.
"""

class RAGService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.vector_store = initialize_vector_database()
        self.encoder = EmbeddingService()
        self.provider = GroqProvider()

    async def generate_grounded_guidance(self, case_id: str, title: str, description: str, category: str) -> RAGGuidanceResponse:
        # Generate query vector embedding
        query_text = f"{title}. {description}. Category: {category}"
        query_vector = self.encoder.encode([query_text])[0]

        # Retrieve top 3 relevant legal provisions from FAISS
        retrieved_docs = self.vector_store.search(query_vector, top_k=3)

        # Format retrieved context
        context_str = ""
        for i, (doc, score) in enumerate(retrieved_docs, 1):
            context_str += f"\n--- Legal Provision {i} (Similarity Score: {score:.2f}) ---\n"
            context_str += f"Title: {doc.get('title')}\n"
            context_str += f"Source: {doc.get('source')}\n"
            context_str += f"Content: {doc.get('content')}\n"

        user_prompt = f"""Consumer Complaint Title: {title}
Category: {category}
Complaint Description:
{description}

RETRIEVED LEGAL PROVISIONS & STATUTES:
{context_str}

Analyze the complaint and return structured JSON legal guidance based on the retrieved statutes."""

        # Call Groq API
        json_data = await self.provider.generate_json(RAG_SYSTEM_PROMPT, user_prompt)
        guidance = RAGGuidanceResponse(**json_data)

        # Save analysis in MongoDB
        settings = get_settings()
        now = datetime.now(timezone.utc)

        await self.db.ai_analyses.insert_one({
            "case_id": ObjectId(case_id),
            "analysis_type": "rag_legal_guidance",
            "provider": "groq",
            "model": settings.groq_model,
            "retrieved_sources": [doc.get("source") for doc, _ in retrieved_docs],
            "result": guidance.model_dump(),
            "created_at": now
        })

        # Record Timeline Event
        await self.db.timeline_events.insert_one({
            "case_id": ObjectId(case_id),
            "event_type": "rag_guidance_generated",
            "description": f"AI Grounded Legal Guidance generated using {len(retrieved_docs)} statutory provisions.",
            "created_at": now
        })

        return guidance
