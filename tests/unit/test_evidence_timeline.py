import pytest
from datetime import datetime, timezone
from backend.evidence.models import EvidenceResponse, EvidenceTypeEnum
from backend.timeline.models import TimelineEventResponse
from backend.evidence.storage import StorageService, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES

def test_evidence_model_validation():
    data = {
        "id": "507f1f77bcf86cd799439011",
        "case_id": "507f1f77bcf86cd799439012",
        "user_id": "507f1f77bcf86cd799439013",
        "original_filename": "invoice_2026.pdf",
        "storage_key": "evidence/user1/case1/invoice_2026.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 102400,
        "evidence_type": EvidenceTypeEnum.INVOICE,
        "processing_status": "stored",
        "created_at": datetime.now(timezone.utc)
    }
    evidence = EvidenceResponse(**data)
    assert evidence.original_filename == "invoice_2026.pdf"
    assert evidence.evidence_type == EvidenceTypeEnum.INVOICE

def test_timeline_event_model_validation():
    data = {
        "id": "507f1f77bcf86cd799439014",
        "case_id": "507f1f77bcf86cd799439012",
        "event_type": "evidence_uploaded",
        "description": "Uploaded invoice.pdf",
        "created_at": datetime.now(timezone.utc)
    }
    event = TimelineEventResponse(**data)
    assert event.event_type == "evidence_uploaded"
    assert event.description == "Uploaded invoice.pdf"

def test_storage_service_allowed_extensions():
    assert ".pdf" in ALLOWED_EXTENSIONS
    assert ".png" in ALLOWED_EXTENSIONS
    assert ".jpg" in ALLOWED_EXTENSIONS
    assert MAX_FILE_SIZE_BYTES == 10 * 1024 * 1024
