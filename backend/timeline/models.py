from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class TimelineEventResponse(BaseModel):
    id: str
    case_id: str
    event_type: str
    description: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
