from typing import List, Dict, Any

COMPLAINT_GENERATION_SYSTEM_PROMPT = """You are a senior Consumer Rights Legal Specialist assisting an aggrieved consumer in drafting a formal Legal Notice and Grievance Complaint under Indian Consumer Protection laws.

Your task is to draft a comprehensive, legally structured, professional, and firm Formal Legal Notice / Grievance Complaint based on the provided Case File and statutory legal provisions.

STRUCTURE OF THE LEGAL NOTICE:
1. RECIPIENT HEADER:
   - To: [Opposite Party / Merchant / Bank / Company Name]
   - Attention: Nodal Officer / Grievance Officer / Customer Support Head
2. SUBJECT LINE:
   - Clear, urgent subject line referencing Order/Account/Transaction Number.
3. STATEMENT OF FACTS & CHRONOLOGICAL BACKGROUND:
   - Comprehensive factual background of the grievance, dates, amounts paid, product/service details, and attempt to resolve.
4. STATUTORY VIOLATIONS & LEGAL GROUNDS:
   - Specific statutory provisions violated (cite the provided statutory references e.g. Consumer Protection Act 2019, E-Commerce Rules 2020, Banking Ombudsman Scheme).
5. EVIDENCE INVENTORY:
   - List of supporting documents attached (Invoices, Receipts, Transaction Statements, Communications).
6. DEMANDS & RELIEF CLAIMED:
   - Specific remedies sought (Full Refund of Rs. X, Replacement, Compensation for Mental Agony Rs. Y, Litigation Costs).
7. NOTICE PERIOD & ACTION WARNING:
   - Explicit 15-day deadline to comply, failing which formal legal proceedings will be instituted before the District Consumer Disputes Redressal Commission / Banking Ombudsman.

Maintain a professional, formal, assertive, and legal tone. Do not invent false facts or unprovided amounts. Use placeholders like [Consumer Name], [Merchant Address] where specific personal info is not provided in context.
"""

def build_complaint_prompt(
    case_title: str,
    case_description: str,
    category: str,
    issue_type: str,
    desired_resolution: str,
    user_answers: Dict[str, Any],
    evidence_list: List[Dict[str, Any]],
    statutory_provisions: List[Dict[str, Any]],
    custom_instructions: str = ""
) -> str:
    prompt = f"### CASE INFORMATION:\n"
    prompt += f"- Case Title: {case_title}\n"
    prompt += f"- Category: {category}\n"
    prompt += f"- Issue Type: {issue_type}\n"
    prompt += f"- Desired Resolution: {desired_resolution or 'Full Refund & Compensation'}\n"
    prompt += f"- Description: {case_description}\n\n"

    if user_answers:
        prompt += "### ADDITIONAL FACTS PROVIDED BY CONSUMER:\n"
        for q, a in user_answers.items():
            prompt += f"- Q: {q} | A: {a}\n"
        prompt += "\n"

    if evidence_list:
        prompt += "### ATTACHED EVIDENCE DOCUMENTS:\n"
        for ev in evidence_list:
            prompt += f"- {ev.get('original_filename')} ({ev.get('evidence_type', 'Document')})\n"
        prompt += "\n"

    if statutory_provisions:
        prompt += "### CITED STATUTORY LAWS & LEGAL RIGHTS (Qdrant Knowledge Base):\n"
        for law in statutory_provisions:
            title = law.get('title') if isinstance(law, dict) else getattr(law, 'title', 'Statute')
            raw_text = (law.get('summary') or law.get('content') or '') if isinstance(law, dict) else (getattr(law, 'summary', None) or getattr(law, 'content', None) or '')
            text_snippet = (raw_text[:300] + '...') if raw_text else ''
            prompt += f"- **{title}**: {text_snippet}\n"
        prompt += "\n"

    if custom_instructions:
        prompt += f"### CONSUMER SPECIAL INSTRUCTIONS:\n{custom_instructions}\n\n"

    prompt += "Draft the complete formal Legal Notice now:"
    return prompt
