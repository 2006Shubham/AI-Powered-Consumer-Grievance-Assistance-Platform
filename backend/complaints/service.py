import os
import io
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from bson import ObjectId

from backend.shared.database import get_database
from backend.complaints.models import ComplaintResponse, ComplaintStatusEnum
from backend.ai.providers.groq import GroqProvider
from backend.ai.prompts.complaint_generation import (
    COMPLAINT_GENERATION_SYSTEM_PROMPT,
    build_complaint_prompt
)
from backend.ai.rag.service import RAGService

logger = logging.getLogger("complaint_service")

class ComplaintService:
    def __init__(self):
        self.db = get_database()
        self.groq_provider = GroqProvider()
        self.rag_service = RAGService()

    async def generate_complaint(
        self,
        case_id: str,
        user_id: str,
        custom_instructions: Optional[str] = None
    ) -> Dict[str, Any]:
        # 1. Fetch Case
        case = await self.db["cases"].find_one({"_id": ObjectId(case_id), "user_id": user_id})
        if not case:
            raise ValueError("Case not found or access denied")

        # 2. Fetch Evidence
        evidence_cursor = self.db["evidence"].find({"case_id": case_id, "user_id": user_id})
        evidence_list = await evidence_cursor.to_list(length=100)

        # 3. Fetch RAG Statutory Guidance from Qdrant Cloud
        statutory_laws = []
        try:
            guidance_res = await self.rag_service.generate_grounded_guidance(
                case_id=case_id,
                title=case.get("title", "Grievance Notice"),
                description=case.get("description", ""),
                category=case.get("category", "General Consumer")
            )
            statutory_laws = guidance_res.applicable_laws
        except Exception as e:
            logger.warning(f"Could not retrieve Qdrant statutory laws for complaint context: {e}")

        # 4. Build Prompt
        prompt = build_complaint_prompt(
            case_title=case.get("title", "Grievance Notice"),
            case_description=case.get("description", ""),
            category=case.get("category", "General Consumer"),
            issue_type=case.get("issue_type", "Consumer Dispute"),
            desired_resolution=case.get("desired_resolution", ""),
            user_answers=case.get("answers", {}),
            evidence_list=evidence_list,
            statutory_provisions=statutory_laws,
            custom_instructions=custom_instructions or ""
        )

        # 5. Invoke Groq LLM
        complaint_content = await self.groq_provider.generate_text(
            system_prompt=COMPLAINT_GENERATION_SYSTEM_PROMPT,
            user_prompt=prompt,
            temperature=0.3
        )

        # 6. Check existing complaint or create new
        existing = await self.db["complaints"].find_one({"case_id": case_id, "user_id": user_id})
        now = datetime.utcnow()
        title = f"Formal Legal Notice - {case.get('title', 'Grievance')}"

        if existing:
            version = existing.get("version", 1) + 1
            update_data = {
                "title": title,
                "content": complaint_content,
                "version": version,
                "status": ComplaintStatusEnum.DRAFT.value,
                "updated_at": now
            }
            await self.db["complaints"].update_one(
                {"_id": existing["_id"]},
                {"$set": update_data}
            )
            complaint_doc = await self.db["complaints"].find_one({"_id": existing["_id"]})
        else:
            complaint_doc = {
                "case_id": case_id,
                "user_id": user_id,
                "title": title,
                "content": complaint_content,
                "status": ComplaintStatusEnum.DRAFT.value,
                "version": 1,
                "created_at": now,
                "updated_at": now
            }
            res = await self.db["complaints"].insert_one(complaint_doc)
            complaint_doc["_id"] = res.inserted_id

        # 7. Record Timeline Event
        await self.db["timeline_events"].insert_one({
            "case_id": case_id,
            "user_id": user_id,
            "event_type": "complaint_generated",
            "title": "Formal Legal Notice Generated",
            "description": f"AI Legal Specialist generated version {complaint_doc['version']} of the Formal Complaint Notice.",
            "created_at": now
        })

        # Update case status
        await self.db["cases"].update_one(
            {"_id": ObjectId(case_id)},
            {"$set": {"status": "in_progress", "updated_at": now}}
        )

        complaint_doc["_id"] = str(complaint_doc["_id"])
        return complaint_doc

    async def get_complaint(self, case_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db["complaints"].find_one({"case_id": case_id, "user_id": user_id})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def update_complaint(
        self,
        case_id: str,
        user_id: str,
        content: str,
        title: Optional[str] = None,
        status: Optional[ComplaintStatusEnum] = None
    ) -> Dict[str, Any]:
        existing = await self.db["complaints"].find_one({"case_id": case_id, "user_id": user_id})
        if not existing:
            raise ValueError("Complaint draft not found. Please generate a draft first.")

        now = datetime.utcnow()
        update_fields: Dict[str, Any] = {
            "content": content,
            "updated_at": now,
            "version": existing.get("version", 1) + 1
        }
        if title:
            update_fields["title"] = title
        if status:
            update_fields["status"] = status.value

        await self.db["complaints"].update_one(
            {"_id": existing["_id"]},
            {"$set": update_fields}
        )

        updated_doc = await self.db["complaints"].find_one({"_id": existing["_id"]})
        updated_doc["_id"] = str(updated_doc["_id"])
        return updated_doc

    async def export_complaint(
        self,
        case_id: str,
        user_id: str,
        export_format: str = "txt"
    ) -> Tuple[bytes, str, str]:
        complaint = await self.get_complaint(case_id, user_id)
        if not complaint:
            raise ValueError("No complaint draft found to export")

        title = complaint.get("title", "Legal_Notice")
        clean_title = "".join(c if c.isalnum() else "_" for c in title)
        content = complaint.get("content", "")

        if export_format.lower() == "pdf":
            # Simple clean PDF rendering using PyMuPDF (fitz)
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            
            # Simple text insertion
            rect = fitz.Rect(50, 50, 550, 790)
            page.insert_textbox(rect, content, fontsize=10, fontname="helv")
            
            pdf_bytes = doc.tobytes()
            doc.close()
            filename = f"{clean_title}.pdf"
            return pdf_bytes, filename, "application/pdf"
        else:
            # Plain text export
            txt_bytes = content.encode("utf-8")
            filename = f"{clean_title}.txt"
            return txt_bytes, filename, "text/plain; charset=utf-8"
