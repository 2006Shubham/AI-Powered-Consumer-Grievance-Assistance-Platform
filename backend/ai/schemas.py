from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class CaseAnalysis(BaseModel):
    summary: str = Field(..., description="Concise 1-2 sentence summary of the grievance")
    category: str = Field(..., description="One of: electronics, ecommerce, telecom, banking, subscription, delivery, general_service, other")
    issue_type: str = Field(..., description="One of: defective_product, refund_not_received, service_not_provided, incorrect_charge, warranty_dispute, delivery_issue, subscription_issue, other")
    desired_resolution: str = Field(default="unknown", description="One of: refund, replacement, repair, service_completion, charge_reversal, explanation, compensation, other, unknown")
    vendor_name: Optional[str] = Field(default=None, description="Extracted brand/company/merchant name if mentioned, e.g. HP, Flipkart, Samsung, Apple, Amazon")
    claimed_amount: Optional[str] = Field(default=None, description="Extracted disputed or purchase amount formatted e.g. ₹30,000 or ₹5,499 if mentioned")
    key_facts: List[str] = Field(default_factory=list, description="List of key facts extracted from the user description")
    missing_information: List[str] = Field(default_factory=list, description="List of genuinely missing information keys needed for resolution")
    confidence: float = Field(default=0.85, description="Confidence score between 0.0 and 1.0")

class FollowUpQuestions(BaseModel):
    questions: List[str] = Field(..., description="List of 3-5 short, targeted follow-up questions")

class UserAnswersInput(BaseModel):
    answers: Dict[str, str] = Field(..., description="Dictionary mapping question or field to user's answer string")
