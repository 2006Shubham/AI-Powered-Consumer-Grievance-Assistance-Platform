from pydantic import BaseModel, Field
from typing import Optional

class ExtractedEvidenceMetadata(BaseModel):
    seller_name: Optional[str] = Field(None, description="Extracted merchant or seller name (e.g. Amazon, HDFC Bank, Croma)")
    purchase_date: Optional[str] = Field(None, description="Extracted transaction or invoice date (YYYY-MM-DD format if possible)")
    order_number: Optional[str] = Field(None, description="Extracted order ID, invoice number, or transaction ID")
    amount_paid: Optional[str] = Field(None, description="Extracted total amount paid (e.g. Rs. 15,000)")
    product_name: Optional[str] = Field(None, description="Extracted product or service description")
    document_type: str = Field("Invoice", description="Detected document type (Invoice, Receipt, Warranty Card, Bank Statement, Communication)")
    confidence_score: float = Field(0.9, description="Confidence score between 0.0 and 1.0")

EVIDENCE_ANALYSIS_SYSTEM_PROMPT = """You are an AI Document Processing Specialist for a Consumer Grievance Platform.
Your task is to analyze extracted text from uploaded consumer evidence (invoices, receipts, bank statements) and extract structured key fields.

STRICT INSTRUCTIONS:
- Extract merchant/seller name, transaction date, order/invoice number, total amount paid, and product/service description.
- If a field is not present in the document text, return null for that field. Do NOT guess or hallucinate.
- Output ONLY a valid JSON object matching the required schema.

Required JSON Schema:
{
  "seller_name": "ABC Electronics",
  "purchase_date": "2026-06-15",
  "order_number": "INV-2026-889",
  "amount_paid": "Rs. 24,999",
  "product_name": "43-inch Smart LED TV",
  "document_type": "Invoice",
  "confidence_score": 0.95
}
Produce ONLY valid JSON.
"""

def build_evidence_analysis_prompt(extracted_text: str, filename: str) -> str:
    return f"""Uploaded File Name: {filename}

DOCUMENT EXTRACTED TEXT:
{extracted_text[:2000]}

Analyze the text and extract structured metadata in JSON format."""
