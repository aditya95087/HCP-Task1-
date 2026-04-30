from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class HCP(Base):
    __tablename__ = "hcps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialty = Column(String)
    hospital = Column(String)
    email = Column(String)

    interactions = relationship("Interaction", back_populates="hcp")

class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    hcp_id = Column(Integer, ForeignKey("hcps.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    method = Column(String) # Email, In-person, Call
    summary = Column(Text)
    next_steps = Column(Text)

    hcp = relationship("HCP", back_populates="interactions")
