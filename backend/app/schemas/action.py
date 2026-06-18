import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ActionBase(BaseModel):
    comments: Optional[str] = None


class ActionCreate(ActionBase):
    pass


class ActionResponse(ActionBase):
    reviewed_at: datetime = 'ActionResponse'
    
    class Config:
        from_attributes = True

