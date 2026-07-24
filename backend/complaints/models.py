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

class ComplaintUpdateInput(BaseModel):
    title: Optional[str] = None
    content: str = Field(..., description="User edited raw markdown/text content of the complaint")
    status: Optional[ComplaintStatusEnum] = ComplaintStatusEnum.DRAFT

class ComplaintResponse(BaseModel):
    id: str = Field(..., alias="_id")
    case_id: str
    user_id: str
    title: str
    content: str
    status: ComplaintStatusEnum
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ComplaintExportFormat(str, Enum):
    TXT = "txt"
    PDF = "pdf"
