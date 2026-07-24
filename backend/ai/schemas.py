from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class CaseAnalysis(BaseModel):
    summary: str = Field(..., description="Concise 1-2 sentence summary of the grievance")
    category: str = Field(..., description="One of: electronics, ecommerce, telecom, banking, subscription, delivery, general_service, other")
    issue_type: str = Field(..., description="One of: defective_product, refund_not_received, service_not_provided, incorrect_charge, warranty_dispute, delivery_issue, subscription_issue, other")
    desired_resolution: str = Field(default="unknown", description="One of: refund, replacement, repair, service_completion, charge_reversal, explanation, compensation, other, unknown")
    key_facts: List[str] = Field(default_factory=list, description="List of key facts extracted from the user description")
    missing_information: List[str] = Field(default_factory=list, description="List of missing information keys needed for resolution")

class FollowUpQuestions(BaseModel):
    questions: List[str] = Field(..., description="List of 3-5 short, targeted follow-up questions")

class UserAnswersInput(BaseModel):
    answers: Dict[str, str] = Field(..., description="Dictionary mapping question or field to user's answer string")
