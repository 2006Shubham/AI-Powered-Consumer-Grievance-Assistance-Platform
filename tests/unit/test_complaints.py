import pytest
from datetime import datetime
from backend.complaints.models import (
    ComplaintCreateInput,
    ComplaintUpdateInput,
    ComplaintResponse,
    ComplaintStatusEnum
)
from backend.ai.prompts.complaint_generation import build_complaint_prompt

def test_complaint_models():
    input_data = ComplaintCreateInput(custom_instructions="Demand 100% refund")
    assert input_data.custom_instructions == "Demand 100% refund"

    update_data = ComplaintUpdateInput(
        content="Updated legal notice draft content",
        status=ComplaintStatusEnum.FINALIZED
    )
    assert update_data.content == "Updated legal notice draft content"
    assert update_data.status == ComplaintStatusEnum.FINALIZED

    complaint_resp = ComplaintResponse(
        _id="complaint123",
        case_id="case456",
        user_id="user789",
        title="Formal Legal Notice - Defective TV",
        content="Dear Sir/Madam...",
        status=ComplaintStatusEnum.DRAFT,
        version=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    assert complaint_resp.id == "complaint123"
    assert complaint_resp.case_id == "case456"
    assert complaint_resp.version == 1

def test_build_complaint_prompt():
    prompt = build_complaint_prompt(
        case_title="Defective Smart TV Screen",
        case_description="TV screen flicker after 10 days of purchase",
        category="electronics",
        issue_type="defective_product",
        desired_resolution="Full refund of Rs 45,000",
        user_answers={"Invoice Number": "INV-9988"},
        evidence_list=[{"original_filename": "invoice.pdf", "evidence_type": "receipt"}],
        statutory_provisions=[{"title": "Consumer Protection Act 2019 Section 2(11)", "content": "Deficiency in service..."}],
        custom_instructions="Include 15-day notice period"
    )

    assert "Defective Smart TV Screen" in prompt
    assert "electronics" in prompt
    assert "INV-9988" in prompt
    assert "invoice.pdf" in prompt
    assert "Consumer Protection Act 2019 Section 2(11)" in prompt
    assert "Include 15-day notice period" in prompt
