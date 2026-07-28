import pytest
from backend.documents.ocr import DocumentOCRService
from backend.ai.prompts.evidence_analysis import (
    build_evidence_analysis_prompt,
    ExtractedEvidenceMetadata
)

def test_document_ocr_service_fallback():
    service = DocumentOCRService()
    # Test fallback extraction on dummy path
    extracted = service.extract_file_text("non_existent_file.png", "image/png")
    assert "non_existent_file.png" in extracted

def test_evidence_analysis_prompt():
    prompt = build_evidence_analysis_prompt("INVOICE #99001 Total Amount: Rs 15,000", "invoice.pdf")
    assert "invoice.pdf" in prompt
    assert "INVOICE #99001" in prompt

def test_extracted_metadata_schema():
    data = {
        "seller_name": "ElectroTech Store",
        "purchase_date": "2026-07-01",
        "order_number": "ORD-10023",
        "amount_paid": "Rs. 15,000",
        "product_name": "OLED Smart TV",
        "document_type": "Invoice",
        "confidence_score": 0.95
    }
    metadata = ExtractedEvidenceMetadata(**data)
    assert metadata.seller_name == "ElectroTech Store"
    assert metadata.amount_paid == "Rs. 15,000"
    assert metadata.confidence_score == 0.95
