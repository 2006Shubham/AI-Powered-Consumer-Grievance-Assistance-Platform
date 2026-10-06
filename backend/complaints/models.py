from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ComplaintStatusEnum(str, Enum):
    DRAFT = "draft"
    FINALIZED = "finalized"
    SENT = "sent"

class ComplaintCreateInput(BaseModel):
    custom_instructions: Optional[str] = Field(
        None,
        description="Optional user instructions for tone or specific demands (e.g. refund vs replacement)"
    )
    user_answers: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list,
        description="Optional user answers to follow-up questions"
    )
    # Complainant Details
    complainant_name: Optional[str] = Field(None, description="Full name of consumer/claimant")
    complainant_phone: Optional[str] = Field(None, description="Contact phone number of consumer")
    complainant_email: Optional[str] = Field(None, description="Email address of consumer")
    complainant_city: Optional[str] = Field(None, description="Consumer city")
    complainant_state: Optional[str] = Field(None, description="Consumer state")
    complainant_address: Optional[str] = Field(None, description="Full postal address of consumer")
    # Opposite Party / Company Details
    company_name: Optional[str] = Field(None, description="Company / seller / brand name")
    company_address: Optional[str] = Field(None, description="Registered or regional office address")
    company_email: Optional[str] = Field(None, description="Nodal officer or customer support email")
    # Transaction & Remedy Details
    order_id: Optional[str] = Field(None, description="Order ID, invoice number, or transaction ID")
    purchase_date: Optional[str] = Field(None, description="Date of purchase or transaction")
    claimed_amount: Optional[str] = Field(None, description="Claimed / disputed monetary amount (e.g. ₹30,000)")
    desired_resolution: Optional[str] = Field(None, description="Specific remedy sought (e.g. 100% full refund)")
    notice_period_days: Optional[int] = Field(default=15, description="Days given to company to comply")

class CompanyLookupInput(BaseModel):
    company_name: str
    city: Optional[str] = ""
    state: Optional[str] = ""

class CompanyLookupResponse(BaseModel):
    company_name: str
    address: str
    email: str
    nodal_title: str
    source: str

class ComplaintUpdateInput(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., description="User edited raw markdown/text content of the complaint")
    status: Optional[ComplaintStatusEnum] = ComplaintStatusEnum.DRAFT

from pydantic import ConfigDict

class ComplaintResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="_id")
    case_id: str
    user_id: str
    title: str
    content: str
    status: ComplaintStatusEnum
    version: int
    created_at: datetime
    updated_at: datetime

class ComplaintExportFormat(str, Enum):
    TXT = "txt"
    PDF = "pdf"
    MD = "md"
