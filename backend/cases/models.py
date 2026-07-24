from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class CaseStatusEnum(str, Enum):
    DRAFT = "draft"
    PREPARING = "preparing"
    COMPLAINT_GENERATED = "complaint_generated"
    SUBMITTED = "submitted"
    AWAITING_RESPONSE = "awaiting_response"
    RESOLVED = "resolved"
    CLOSED = "closed"

class CaseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    category: str = Field(default="general_service")
    issue_type: str = Field(default="other")
    desired_resolution: str = Field(default="unknown")

class CaseStatusUpdate(BaseModel):
    status: CaseStatusEnum

class CaseResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    category: str
    issue_type: str
    desired_resolution: str
    status: CaseStatusEnum
    created_at: datetime
    updated_at: datetime
