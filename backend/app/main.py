from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, schemas, database, agent
from langchain_core.messages import HumanMessage, ToolMessage
import uvicorn
import json
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed mock data if needed
    models.Base.metadata.create_all(bind=database.engine)
    db = database.SessionLocal()
    if db.query(models.HCP).count() == 0:
        db.add_all([
            models.HCP(name="Dr. Sarah Johnson", specialty="Cardiology", hospital="City General", email="sarah.johnson@example.com"),
            models.HCP(name="Dr. Michael Chen", specialty="Neurology", hospital="Metro Health", email="michael.chen@example.com")
        ])
        db.commit()
    db.close()
    yield

app = FastAPI(title="AI-First CRM HCP Module", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(message: schemas.ChatMessage):
    import os
    if not os.getenv("GEMINI_API_KEY"):
        return {"response": "System: GEMINI_API_KEY is missing!", "form_data": None}
        
    try:
        import time
        last_error = None
        for attempt in range(3):
            try:
                response = agent.agent_executor.invoke({"messages": [HumanMessage(content=message.message)]})
                break
            except Exception as retry_err:
                last_error = retry_err
                if "429" in str(retry_err) or "RESOURCE_EXHAUSTED" in str(retry_err):
                    time.sleep(2 ** attempt)  # 1s, 2s, 4s
                    continue
                raise
        else:
            raise last_error
        
        # Extract the final AI text response
        content = response["messages"][-1].content
        if isinstance(content, list):
            content = " ".join([c["text"] for c in content if "text" in c])
        
        # Scan all ToolMessages for form_data from extract_interaction_details
        form_data = None
        for msg in response["messages"]:
            if isinstance(msg, ToolMessage):
                try:
                    parsed = json.loads(msg.content)
                    if isinstance(parsed, dict) and "form_data" in parsed:
                        form_data = parsed["form_data"]
                except (json.JSONDecodeError, TypeError):
                    pass
        
        return {"response": content, "form_data": form_data}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/hcps", response_model=list[schemas.HCP])
def get_hcps(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.HCP).offset(skip).limit(limit).all()

@app.get("/api/interactions", response_model=list[schemas.Interaction])
def get_interactions(db: Session = Depends(database.get_db)):
    return db.query(models.Interaction).order_by(models.Interaction.timestamp.desc()).all()

@app.post("/api/interactions", response_model=schemas.Interaction)
def create_interaction(interaction: schemas.InteractionCreate, db: Session = Depends(database.get_db)):
    db_interaction = models.Interaction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@app.put("/api/interactions/{interaction_id}", response_model=schemas.Interaction)
def update_interaction(interaction_id: int, interaction: schemas.InteractionUpdate, db: Session = Depends(database.get_db)):
    db_interaction = db.query(models.Interaction).filter(models.Interaction.id == interaction_id).first()
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    update_data = interaction.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
        
    db.commit()
    db.refresh(db_interaction)
    return db_interaction
