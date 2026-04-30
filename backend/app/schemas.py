from pydantic import BaseModel
from typing import Optional, List
import datetime

class HCPBase(BaseModel):
    name: str
    specialty: str
    hospital: str
    email: str

class HCPCreate(HCPBase):
    pass

class HCP(HCPBase):
    id: int

    class Config:
        from_attributes = True

class InteractionBase(BaseModel):
    hcp_id: int
    method: str
    summary: str
    next_steps: str

class InteractionCreate(InteractionBase):
    pass

class InteractionUpdate(BaseModel):
    method: Optional[str] = None
    summary: Optional[str] = None
    next_steps: Optional[str] = None

class Interaction(InteractionBase):
    id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
