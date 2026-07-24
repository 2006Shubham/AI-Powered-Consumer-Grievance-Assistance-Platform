from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum
from datetime import datetime

class EvidenceTypeEnum(str, Enum):
    INVOICE = "invoice"
    RECEIPT = "receipt"
    SCREENSHOT = "screenshot"
    PRODUCT_PHOTO = "product_photo"
    EMAIL = "email"
    WARRANTY = "warranty"
    ORDER_CONFIRMATION = "order_confirmation"
    COMPANY_RESPONSE = "company_response"
    OTHER = "other"

class EvidenceResponse(BaseModel):
    id: str
    case_id: str
    user_id: str
    original_filename: str
    storage_key: str
    file_url: Optional[str] = None
    mime_type: str
    size_bytes: int
    evidence_type: EvidenceTypeEnum
    processing_status: str = "stored"
    created_at: datetime
