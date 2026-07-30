import os
import io
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List, Tuple
from bson import ObjectId

from backend.shared.database import get_database, safe_object_id
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
        # 1. Fetch Case safely
        safe_case_id = safe_object_id(case_id)
        safe_user_id = safe_object_id(user_id)
        
        case = await self.db["cases"].find_one({"_id": safe_case_id})
        if not case and ObjectId.is_valid(case_id):
            case = await self.db["cases"].find_one({"_id": ObjectId(case_id)})
            
        if not case:
            # Fallback for client mock/demo case IDs like '1042'
            case = {
                "_id": case_id,
                "title": f"Consumer Grievance Claim #{case_id}",
                "category": "Electronics & Warranty",
                "description": "Defective product, failure of merchant to comply with warranty obligations or refund terms.",
                "issue_type": "Warranty & Refund Dispute",
                "desired_resolution": "Full Refund of Purchase Price plus Statutory Interest"
            }

        # 2. Fetch Evidence
        evidence_list = []
        try:
            evidence_cursor = self.db["evidence"].find({"case_id": case_id})
            evidence_list = await evidence_cursor.to_list(length=100)
        except Exception:
            pass

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
        existing = await self.db["complaints"].find_one({"case_id": case_id})
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
        if ObjectId.is_valid(case_id):
            await self.db["cases"].update_one(
                {"_id": ObjectId(case_id)},
                {"$set": {"status": "in_progress", "updated_at": now}}
            )

        complaint_doc["_id"] = str(complaint_doc["_id"])
        return complaint_doc

    async def get_complaint(self, case_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        user_obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        doc = await self.db["complaints"].find_one({
            "case_id": case_id,
            "$or": [{"user_id": user_id}, {"user_id": user_obj_id}]
        })
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
        user_obj_id = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        existing = await self.db["complaints"].find_one({
            "case_id": case_id,
            "$or": [{"user_id": user_id}, {"user_id": user_obj_id}]
        })
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

        fmt = export_format.lower()
        if fmt == "pdf":
            pdf_bytes = generate_professional_legal_pdf(content, title)
            filename = f"{clean_title}.pdf"
            return pdf_bytes, filename, "application/pdf"
        elif fmt == "md":
            md_bytes = content.encode("utf-8")
            filename = f"{clean_title}.md"
            return md_bytes, filename, "text/markdown; charset=utf-8"
        else:
            # Plain text export
            txt_bytes = content.encode("utf-8")
            filename = f"{clean_title}.txt"
            return txt_bytes, filename, "text/plain; charset=utf-8"


def generate_professional_legal_pdf(content: str, title: str) -> bytes:
    """Renders a structured multi-page PDF by parsing Markdown headers, bolding, and lists."""
    import fitz
    import re

    doc = fitz.open()
    page_width, page_height = 595.28, 841.89  # Standard A4 Dimensions

    def create_page():
        page = doc.new_page(width=page_width, height=page_height)
        
        # Deep slate header banner
        page.draw_rect(fitz.Rect(0, 0, page_width, 48), color=(0.06, 0.09, 0.16), fill=(0.06, 0.09, 0.16))
        page.insert_text(fitz.Point(40, 24), "FORMAL CONSUMER DEMAND NOTICE & LEGAL PETITION", fontsize=10, fontname="helv-bold", color=(1, 1, 1))
        page.insert_text(fitz.Point(40, 38), "Statutory Consumer Protection Act 2019 Redressal Framework", fontsize=7.5, fontname="helv", color=(0.8, 0.85, 0.9))
        page.insert_text(fitz.Point(page_width - 140, 28), f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}", fontsize=7.5, fontname="helv", color=(0.9, 0.9, 0.9))

        # Footer separator and text
        page.draw_line(fitz.Point(40, page_height - 35), fitz.Point(page_width - 40, page_height - 35), color=(0.8, 0.8, 0.8), width=0.5)
        page.insert_text(fitz.Point(40, page_height - 22), "CONFIDENTIAL LEGAL NOTICE • GENERATED VIA GRIEVANCEAI PROTECTION PLATFORM", fontsize=6.5, fontname="helv-bold", color=(0.4, 0.4, 0.4))
        return page

    page = create_page()
    margin_x = 40
    width = page_width - (2 * margin_x)
    y_cursor = 65

    paragraphs = content.split('\n')
    for p in paragraphs:
        raw_text = p.strip()
        if not raw_text:
            y_cursor += 6
            continue

        # Horizontal Rule
        if raw_text.startswith("---") or raw_text.startswith("***"):
            if y_cursor + 15 > page_height - 50:
                page = create_page()
                y_cursor = 65
            page.draw_line(fitz.Point(margin_x, y_cursor + 4), fitz.Point(margin_x + width, y_cursor + 4), color=(0.7, 0.7, 0.8), width=0.8)
            y_cursor += 10
            continue

        # Parse Markdown headers & lists
        if raw_text.startswith("# "):
            font_size = 13
            font_name = "helv-bold"
            text_color = (0.06, 0.09, 0.16)
            clean_text = raw_text[2:].replace("**", "").strip()
            space_before, space_after = 10, 4
        elif raw_text.startswith("## "):
            font_size = 11.5
            font_name = "helv-bold"
            text_color = (0.1, 0.15, 0.25)
            clean_text = raw_text[3:].replace("**", "").strip()
            space_before, space_after = 8, 4
        elif raw_text.startswith("### "):
            font_size = 10.5
            font_name = "helv-bold"
            text_color = (0.15, 0.2, 0.3)
            clean_text = raw_text[4:].replace("**", "").strip()
            space_before, space_after = 6, 3
        elif raw_text.startswith("- ") or raw_text.startswith("* ") or re.match(r'^\d+\.\s', raw_text):
            font_size = 9.5
            font_name = "helv"
            text_color = (0.15, 0.15, 0.15)
            bullet_char = "• " if not raw_text[0].isdigit() else ""
            clean_text = bullet_char + re.sub(r'^[-\*\d\.]+\s*', '', raw_text).replace("**", "").strip()
            space_before, space_after = 2, 2
        else:
            is_bold_section = raw_text.isupper() or raw_text.startswith("TO:") or raw_text.startswith("SUBJECT:") or raw_text.startswith("DEMAND:") or raw_text.startswith("NOTICE")
            font_size = 9.5 if not is_bold_section else 10
            font_name = "helv-bold" if is_bold_section else "helv"
            text_color = (0.06, 0.09, 0.16) if is_bold_section else (0.15, 0.15, 0.15)
            clean_text = raw_text.replace("**", "").strip()
            space_before, space_after = 3, 3

        y_cursor += space_before
        approx_lines = max(1, len(clean_text) // 85 + 1)
        needed_height = approx_lines * (font_size * 1.35)

        # Page break if necessary
        if y_cursor + needed_height > page_height - 50:
            page = create_page()
            y_cursor = 65

        rect = fitz.Rect(margin_x, y_cursor, margin_x + width, y_cursor + needed_height + 15)
        page.insert_textbox(rect, clean_text, fontsize=font_size, fontname=font_name, color=text_color)
        y_cursor += needed_height + space_after

    total_pages = len(doc)
    for idx, pg in enumerate(doc, 1):
        pg.insert_text(fitz.Point(page_width - 85, page_height - 22), f"Page {idx} of {total_pages}", fontsize=7, fontname="helv", color=(0.4, 0.4, 0.4))

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes
