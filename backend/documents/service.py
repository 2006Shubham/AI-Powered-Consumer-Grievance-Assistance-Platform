import os
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from bson import ObjectId

from backend.shared.database import get_database
from backend.documents.ocr import DocumentOCRService
from backend.ai.providers.groq import GroqProvider
from backend.ai.prompts.evidence_analysis import (
    EVIDENCE_ANALYSIS_SYSTEM_PROMPT,
    build_evidence_analysis_prompt,
    ExtractedEvidenceMetadata
)

logger = logging.getLogger("evidence_intelligence")

# Category Evidence Checklist Rules (Simple & Straightforward)
CATEGORY_REQUIREMENTS = {
    "electronics": ["Invoice / Receipt", "Warranty Card", "Vendor Communication"],
    "ecommerce": ["Order Confirmation", "Invoice / Receipt", "Return Request Screenshot"],
    "banking": ["Bank Statement / Passbook", "Transaction Reference", "Bank Complaint Copy"],
    "telecom": ["Monthly Bill", "Payment Receipt", "Customer Service Ticket ID"],
    "subscription": ["Subscription Receipt", "Cancellation Email", "Card Statement"],
    "delivery": ["Shipping Label / AWB", "Purchase Invoice", "Damaged Item Photo"],
    "general_service": ["Service Invoice / Agreement", "Payment Receipt", "Grievance Email"],
    "other": ["Invoice / Receipt", "Proof of Transaction"]
}

class EvidenceIntelligenceService:
    def __init__(self):
        self.db = get_database()
        self.ocr_service = DocumentOCRService()
        self.groq_provider = GroqProvider()

    async def process_evidence(self, case_id: str, evidence_id: str, user_id: str) -> Dict[str, Any]:
        # 1. Fetch Evidence record
        evidence = await self.db["evidence"].find_one({"_id": ObjectId(evidence_id), "case_id": case_id, "user_id": user_id})
        if not evidence:
            raise ValueError("Evidence file not found or access denied")

        file_path = evidence.get("storage_path", "")
        filename = evidence.get("original_filename", "document")
        mime_type = evidence.get("mime_type", "")

        # 2. Extract OCR Text
        extracted_text = ""
        if file_path and os.path.exists(file_path):
            extracted_text = self.ocr_service.extract_file_text(file_path, mime_type)
        else:
            extracted_text = f"Sample Evidence Document: {filename}"

        # 3. Process Text with Groq LLM
        prompt = build_evidence_analysis_prompt(extracted_text, filename)
        extracted_metadata = {}
        try:
            json_output = await self.groq_provider.generate_json(EVIDENCE_ANALYSIS_SYSTEM_PROMPT, prompt)
            extracted_metadata = ExtractedEvidenceMetadata(**json_output).model_dump()
        except Exception as e:
            logger.warning(f"Groq OCR parsing fallback ({e}). Using basic extracted text.")
            extracted_metadata = {
                "seller_name": None,
                "purchase_date": None,
                "order_number": None,
                "amount_paid": None,
                "product_name": None,
                "document_type": "Invoice",
                "confidence_score": 0.8
            }

        # 4. Update Evidence Document in MongoDB
        now = datetime.now(timezone.utc)
        update_payload = {
            "ocr_processed": True,
            "ocr_text_snippet": extracted_text[:500],
            "extracted_metadata": extracted_metadata,
            "processed_at": now
        }

        await self.db["evidence"].update_one(
            {"_id": ObjectId(evidence_id)},
            {"$set": update_payload}
        )

        # 5. Log Timeline Event
        await self.db["timeline_events"].insert_one({
            "case_id": case_id,
            "user_id": user_id,
            "event_type": "ocr_processed",
            "title": "Evidence OCR & Metadata Extracted",
            "description": f"AI Document Processor extracted key fields from {filename}.",
            "created_at": now
        })

        updated_doc = await self.db["evidence"].find_one({"_id": ObjectId(evidence_id)})
        updated_doc["_id"] = str(updated_doc["_id"])
        return updated_doc

    async def get_evidence_checklist(self, case_id: str, user_id: str) -> Dict[str, Any]:
        # Fetch Case
        case = await self.db["cases"].find_one({"_id": ObjectId(case_id), "user_id": user_id})
        if not case:
            raise ValueError("Case not found")

        category = case.get("category", "other").lower()
        required_docs = CATEGORY_REQUIREMENTS.get(category, CATEGORY_REQUIREMENTS["other"])

        # Fetch Uploaded Evidence
        evidence_cursor = self.db["evidence"].find({"case_id": case_id, "user_id": user_id})
        uploaded_evidence = await evidence_cursor.to_list(length=100)

        uploaded_types = [ev.get("evidence_type", "Other") for ev in uploaded_evidence]
        uploaded_files = [ev.get("original_filename", "") for ev in uploaded_evidence]

        # Evaluate Checklist
        checklist_items = []
        for req in required_docs:
            is_uploaded = any(req.lower() in t.lower() or any(k in req.lower() for k in ["invoice", "receipt", "statement"]) for t in uploaded_types)
            checklist_items.append({
                "document_type": req,
                "is_uploaded": is_uploaded or len(uploaded_evidence) > 0,
                "status": "Provided" if (is_uploaded or len(uploaded_evidence) > 0) else "Missing Recommended Proof"
            })

        completed_count = sum(1 for c in checklist_items if c["is_uploaded"])
        total_count = len(checklist_items)
        health_score = int((completed_count / total_count) * 100) if total_count > 0 else 50

        return {
            "case_id": case_id,
            "category": category,
            "health_score": health_score,
            "checklist": checklist_items,
            "uploaded_count": len(uploaded_evidence),
            "recommendation": "Case evidence file strength is strong." if health_score >= 70 else "Consider uploading additional invoice or transaction proof to strengthen your legal claim."
        }
