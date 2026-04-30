from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from .database import SessionLocal
from .models import HCP, Interaction

load_dotenv()

# Use Gemini Flash Latest for speed and quota
llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", google_api_key=os.getenv("GEMINI_API_KEY"))

# ===================== TOOLS =====================

@tool
def search_hcp_by_name(name_query: str) -> str:
    """Find an HCP ID and details by searching for their name (case-insensitive).
    Use this tool whenever you need to find an HCP's ID from their name."""
    db = SessionLocal()
    try:
        hcps = db.query(HCP).all()
        name_lower = name_query.lower()
        matches = []
        for hcp in hcps:
            if name_lower in hcp.name.lower():
                matches.append({"id": hcp.id, "name": hcp.name, "specialty": hcp.specialty})
        
        if not matches:
            return f"No HCP found matching '{name_query}'."
        return json.dumps(matches)
    finally:
        db.close()

@tool
def extract_interaction_details(
    hcp_name: str,
    interaction_type: str = "Meeting",
    date: str = None,
    time: str = "",
    attendees: str = "",
    topics_discussed: str = "",
    next_steps: str = ""
) -> str:
    """Extract and structure interaction details for the UI form. 
    Call this tool whenever the user describes a NEW interaction so the form can be filled.
    If the user mentions 'today', assume the date is the current date."""
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")
    
    # Search for HCP ID
    db = SessionLocal()
    hcp_id = ""
    try:
        hcps = db.query(HCP).all()
        name_lower = hcp_name.lower()
        for hcp in hcps:
            if name_lower in hcp.name.lower():
                hcp_id = str(hcp.id)
                hcp_name = hcp.name
                break
    finally:
        db.close()

    result = {
        "form_data": {
            "hcp_id": hcp_id,
            "hcp_name": hcp_name,
            "method": interaction_type,
            "date": date,
            "time": time,
            "attendees": attendees,
            "summary": topics_discussed,
            "next_steps": next_steps,
        }
    }
    return json.dumps(result)

@tool
def log_interaction(hcp_id: int, method: str, summary: str, next_steps: str) -> str:
    """Save a new interaction to the database. Call this tool only after the user confirms the details."""
    db = SessionLocal()
    try:
        interaction = Interaction(
            hcp_id=hcp_id,
            method=method,
            summary=summary,
            next_steps=next_steps
        )
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        return f"Successfully logged interaction ID {interaction.id}."
    except Exception as e:
        return f"Error logging interaction: {str(e)}"
    finally:
        db.close()

@tool
def search_past_interactions(hcp_id: int) -> str:
    """Get the list of past interactions for an HCP. Use this to find which record to edit."""
    db = SessionLocal()
    try:
        interactions = db.query(Interaction).filter(Interaction.hcp_id == hcp_id).order_by(Interaction.timestamp.desc()).limit(5).all()
        if not interactions:
            return "No past interactions found."
        
        results = []
        for i in interactions:
            results.append({
                "interaction_id": i.id,
                "timestamp": i.timestamp.strftime("%Y-%m-%d %H:%M"),
                "method": i.method,
                "summary": i.summary,
                "next_steps": i.next_steps
            })
        return json.dumps(results)
    finally:
        db.close()

@tool
def edit_interaction(interaction_id: int, method: str = None, summary: str = None, next_steps: str = None) -> str:
    """Update an existing interaction record. Use search_past_interactions first to get the correct ID."""
    db = SessionLocal()
    try:
        interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
        if not interaction:
            return f"Interaction {interaction_id} not found."
        
        if method: interaction.method = method
        if summary: interaction.summary = summary
        if next_steps: interaction.next_steps = next_steps
        
        db.commit()
        return f"Successfully updated interaction {interaction_id}."
    finally:
        db.close()

tools = [search_hcp_by_name, extract_interaction_details, log_interaction, search_past_interactions, edit_interaction]

system_prompt = """You are an expert AI Assistant for a CRM. Your goal is to help users log and edit interactions with Healthcare Professionals (HCPs) autonomously.

CRITICAL RULES:
1. NEVER ASK FOR HCP IDs or INTERACTION IDs. Use your tools to find them.
2. When a user says "I met Dr. [Name]", use 'search_hcp_by_name' to find their ID.
3. When a user wants to "Update/Edit the interaction with Dr. [Name]", you MUST:
   a. Search for the HCP by name to get their ID.
   b. Search for their past interactions to find the relevant one (usually the most recent).
   c. Perform the edit.
4. For NEW interactions, always use 'extract_interaction_details' to fill the UI form first, then ask for confirmation to save.
5. If you can't find an HCP, tell the user, but still fill the form with the name they provided.
"""

agent_executor = create_react_agent(llm, tools, prompt=system_prompt)
