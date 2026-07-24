import json
import logging
from typing import Optional, Dict, Any
from groq import AsyncGroq, GroqError
from backend.shared.config import get_settings

logger = logging.getLogger("groq_provider")

class GroqProvider:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.groq_api_key
        self.model = settings.groq_model
        self.client: Optional[AsyncGroq] = None
        if self.api_key:
            self.client = AsyncGroq(api_key=self.api_key)

    async def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        if not self.client:
            settings = get_settings()
            if not settings.groq_api_key:
                raise ValueError("GROQ_API_KEY environment variable is not configured.")
            self.client = AsyncGroq(api_key=settings.groq_api_key)

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Received empty response from Groq API")
            return json.loads(content)
        except GroqError as e:
            logger.error(f"Groq API call failed: {e}")
            raise RuntimeError(f"Groq API Error: {str(e)}") from e
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Groq output: {e}")
            raise ValueError(f"Invalid JSON returned by Groq: {str(e)}") from e
