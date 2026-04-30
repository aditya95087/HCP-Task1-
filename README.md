# AI-First CRM HCP Module

This is an AI-first Customer Relationship Management (CRM) system tailored for Healthcare Professionals (HCP). It empowers life science field representatives to log interactions either manually via a structured form or naturally via an intelligent conversational agent.

## Technology Stack

- **Frontend:** React (Vite) + Redux Toolkit + Vanilla CSS (Premium Glassmorphism Aesthetic)
- **Backend:** Python + FastAPI
- **Database:** SQLite (via SQLAlchemy) - *Fully compatible with PostgreSQL/MySQL drop-in replacement as per requirements*
- **AI Agent Framework:** LangGraph
- **LLM:** Groq (`gemma2-9b-it`)

## LangGraph AI Agent & Tools

### Role of the LangGraph Agent
The LangGraph agent acts as an intelligent assistant for the life science field representative. Instead of manually clicking through menus and filling out forms, the representative can converse naturally with the agent. The agent uses the Groq LLM to understand the context, extract relevant entities (like HCP names, discussion topics, and future actions), and uses its tools to interact with the database directly. It manages the state of the conversation, allowing for multi-step tasks like looking up a doctor's profile and then logging an interaction with them.

### The 5 Specific Tools

1. **Log Interaction (`log_interaction`)**: Captures and structures data from a natural language conversation to save a new interaction record. It extracts the HCP ID, method, summary, and next steps from the user's input.
2. **Edit Interaction (`edit_interaction`)**: Allows modification of already logged data. If a rep realizes they forgot to add a detail, they can ask the agent to "update the last interaction with Dr. Smith to include that we also discussed the new trial," and the tool will modify the DB record.
3. **Get HCP Profile (`get_hcp_profile`)**: Retrieves detailed information (specialty, hospital, email) about a specific Healthcare Professional, helping the rep prep for a meeting.
4. **Search Past Interactions (`search_past_interactions`)**: Looks up historical logs for context before meeting an HCP, returning the 5 most recent interactions.
5. **Schedule Follow-up (`schedule_followup`)**: Schedules a future action item or follow-up touchpoint by creating a specially marked interaction log.

## How to Run

### 1. Prerequisites
- Python 3.9+
- Node.js 18+

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: For this project, dependencies are `fastapi[standard] uvicorn sqlalchemy langgraph langchain-groq pydantic python-dotenv aiosqlite`)*
4. Set up the Environment Variables:
   Open `backend/.env` and add your Groq API Key:
   ```env
GEMINI_API_KEY=AIzaSyBF25a6-LtJD2ACxQK-_as-2kno8BbNGE8   DATABASE_URL=sqlite:///./hcp_crm.db
   ```
5. Run the FastAPI server:
   ```bash
   fastapi dev app/main.py
   ```
   *(The backend runs on `http://localhost:8000`)*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *(The frontend will run on `http://localhost:5173`)*

## Usage
- Open the frontend in your browser.
- Use the **Chat Assistant** tab to interact with the LangGraph agent. Try saying: *"What is Dr. Sarah Johnson's profile?"* and then *"Log an in-person interaction with her. We discussed the new cardiology drug. Next steps are to send her the clinical trial data."*
- Use the **Manual Log** tab if you prefer standard form entry.
- View all logged data in the **Dashboard** tab.
