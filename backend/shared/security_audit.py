import re
import html
import logging
from typing import Any, Dict

logger = logging.getLogger("security_audit")

def sanitize_untrusted_input(text: str, max_length: int = 4000) -> str:
    """Sanitize raw user text to prevent prompt injection and formatting breaks before passing into LLM prompts."""
    if not text:
        return ""

    # Truncate overly long text
    sanitized = text[:max_length]

    # Escape HTML special characters
    sanitized = html.escape(sanitized)

    # Escape curly braces to prevent Python str.format breaks
    sanitized = sanitized.replace("{", "{{").replace("}", "}}")

    # Remove dangerous prompt injection patterns (e.g. System Override instructions)
    injection_patterns = [
        r"ignore\s+all\s+previous\s+instructions",
        r"disregard\s+prior\s+prompts",
        r"you\s+are\s+now\s+in\s+developer\s+mode",
        r"system\s*:\s*"
    ]
    for pattern in injection_patterns:
        sanitized = re.sub(pattern, "[redacted_prompt_injection]", sanitized, flags=re.IGNORECASE)

    return sanitized.strip()

def validate_user_ownership(resource_user_id: str, authenticated_user_id: str):
    """Ensure user can only access their own resources."""
    if str(resource_user_id) != str(authenticated_user_id):
        raise PermissionError("Access denied: You do not own this resource.")
