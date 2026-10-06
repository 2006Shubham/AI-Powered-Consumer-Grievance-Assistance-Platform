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

def test_company_directory_lookup():
    from backend.complaints.company_directory import lookup_company_info
    
    # Regional lookup
    res_flipkart = lookup_company_info("Flipkart", city="Mumbai", state="Maharashtra")
    assert "Godrej Coliseum" in res_flipkart["address"]
    assert "flipkart.com" in res_flipkart["email"]

    res_amazon = lookup_company_info("Amazon India", city="Gurugram", state="Haryana")
    assert "Ambience" in res_amazon["address"]
    assert "amazon.in" in res_amazon["email"]

    res_unknown = lookup_company_info("XYZ Local Electronics", city="Pune", state="Maharashtra")
    assert "XYZ Local Electronics" in res_unknown["address"]
    assert "Pune, Maharashtra" in res_unknown["address"]

def test_complaint_create_input_structured_fields():
    data = ComplaintCreateInput(
        complainant_name="Rajesh Kumar",
        complainant_phone="9876543210",
        complainant_email="rajesh@example.com",
        complainant_city="Bengaluru",
        complainant_state="Karnataka",
        company_name="Flipkart",
        order_id="OD123456789",
        claimed_amount="₹30,000",
        desired_resolution="Full refund to bank account"
    )
    assert data.complainant_name == "Rajesh Kumar"
    assert data.complainant_city == "Bengaluru"
    assert data.order_id == "OD123456789"
    assert data.claimed_amount == "₹30,000"

