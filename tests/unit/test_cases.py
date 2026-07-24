import pytest
from backend.cases.models import CaseCreate, CaseResponse, CaseStatusEnum
from datetime import datetime, timezone

def test_case_create_model_validation():
    data = CaseCreate(
        title="Defective Smartwatch",
        description="The smartwatch screen flickers and stops charging after 2 days.",
        category="electronics",
        issue_type="defective_product",
        desired_resolution="replacement"
    )
    assert data.title == "Defective Smartwatch"
    assert data.category == "electronics"

def test_case_response_serialization():
    now = datetime.now(timezone.utc)
    res = CaseResponse(
        id="65f123456789abcdef012345",
        user_id="65f000000000abcdef000000",
        title="Sample Complaint Title",
        description="Sample Description text for testing",
        category="electronics",
        issue_type="defective_product",
        desired_resolution="refund",
        status=CaseStatusEnum.PREPARING,
        created_at=now,
        updated_at=now
    )
    assert res.id == "65f123456789abcdef012345"
    assert res.status == CaseStatusEnum.PREPARING
