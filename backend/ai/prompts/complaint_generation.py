from typing import List, Dict, Any, Optional

COMPLAINT_GENERATION_SYSTEM_PROMPT = """You are a senior consumer dispute specialist drafting a formal, professional legal complaint notice on behalf of an Indian consumer.

Your goal is to produce an authoritative, completely finished, and professionally formatted complaint notice ready to send immediately to the company's nodal grievance desk and customer escalation leadership.

CRITICAL RULES FOR COMPLETENESS & PROFESSIONALISM:
1. NEVER output placeholder brackets such as [Consumer Name], [Merchant Address], [Order ID], [Date], or [Amount].
2. Use the EXACT complainant details, company address, emails, dates, order IDs, and claimed monetary amounts provided in the prompt.
3. Structure the complaint letter cleanly:
   - Header with Date, Complainant details, and Recipient company details
   - Clear, formal Subject Line citing Order ID and product/service
   - Chronological Statement of Facts detailing what happened
   - Specific Breaches (deficiency of service, unfair trade practice, breach of warranty/return commitment)
   - Evidence Summary (listing invoice, order reference, chats, service center rejection)
   - Clear Demand & Remedy (exact refund amount, replacement, or repair)
   - Explicit compliance notice period (e.g. 15 days), warning of formal escalation to National Consumer Helpline (1915) / Consumer Commission.
   - Formal Sign-off with the complainant's name and contact information.
4. Maintain a firm, polite, factual, and unambiguous tone.
5. Do NOT include extraneous conversational preamble or postscript (e.g., do not say "Here is your letter:"). Output ONLY the formal complaint letter itself.
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
    custom_instructions: str = "",
    complainant_name: Optional[str] = None,
    complainant_phone: Optional[str] = None,
    complainant_email: Optional[str] = None,
    complainant_address: Optional[str] = None,
    company_name: Optional[str] = None,
    company_address: Optional[str] = None,
    company_email: Optional[str] = None,
    order_id: Optional[str] = None,
    purchase_date: Optional[str] = None,
    claimed_amount: Optional[str] = None,
    notice_period_days: Optional[int] = 15
) -> str:
    prompt = "### VERIFIED COMPLAINT PARTICULARS:\n"
    prompt += f"- Complainant Name: {complainant_name or 'Aggrieved Consumer'}\n"
    if complainant_phone:
        prompt += f"- Complainant Phone: {complainant_phone}\n"
    if complainant_email:
        prompt += f"- Complainant Email: {complainant_email}\n"
    if complainant_address:
        prompt += f"- Complainant Address: {complainant_address}\n"

    prompt += f"\n- Opposite Party (Company / Seller): {company_name or 'Company / Merchant'}\n"
    if company_address:
        prompt += f"- Company Registered/Regional Office: {company_address}\n"
    if company_email:
        prompt += f"- Company Nodal Email: {company_email}\n"

    prompt += f"\n- Dispute Matter / Product: {case_title}\n"
    prompt += f"- Order / Transaction / Reference ID: {order_id or 'TXN-RECORDED'}\n"
    prompt += f"- Purchase / Incident Date: {purchase_date or 'Recent'}\n"
    prompt += f"- Disputed / Claimed Amount: {claimed_amount or 'Full Value of Purchase'}\n"
    prompt += f"- Desired Relief / Remedy: {desired_resolution or 'Full Refund to Original Payment Source'}\n"
    prompt += f"- Notice Compliance Period: {notice_period_days or 15} calendar days\n"
    prompt += f"- Category / Issue Type: {category} ({issue_type})\n\n"

    prompt += f"### STATEMENT OF FACTS & INCIDENT HISTORY:\n{case_description}\n\n"

    if user_answers:
        prompt += "### FACTUAL RESPONSES PROVIDED BY CONSUMER:\n"
        for q, a in user_answers.items():
            prompt += f"- {q}: {a}\n"
        prompt += "\n"

    if evidence_list:
        prompt += "### ATTACHED EVIDENCE DOCUMENTS:\n"
        for ev in evidence_list:
            prompt += f"- {ev.get('original_filename')} ({ev.get('evidence_type', 'Document')})\n"
        prompt += "\n"

    if statutory_provisions:
        prompt += "### RELEVANT CONSUMER RIGHTS & STATUTES:\n"
        for law in statutory_provisions:
            title = law.get('title') if isinstance(law, dict) else getattr(law, 'title', 'Statute')
            raw_text = (law.get('summary') or law.get('content') or '') if isinstance(law, dict) else (getattr(law, 'summary', None) or getattr(law, 'content', None) or '')
            text_snippet = (raw_text[:250] + '...') if raw_text else ''
            prompt += f"- **{title}**: {text_snippet}\n"
        prompt += "\n"

    if custom_instructions:
        prompt += f"### SPECIAL INSTRUCTIONS / SPECIFIC DEMANDS:\n{custom_instructions}\n\n"

    prompt += "Draft the complete, 100% finished formal Legal Notice now (without any bracketed placeholders):"
    return prompt
