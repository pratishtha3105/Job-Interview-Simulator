import os
import logging
import traceback
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS Middleware for cross-domain requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---

class InterviewFeedback(BaseModel):
    score: int = Field(description="Score from 1-10 based on the quality of the answer")
    strengths: List[str] = Field(description="List of strong points in the answer")
    weaknesses: List[str] = Field(description="List of areas for improvement")
    suggested_answer: str = Field(description="A better way to answer the question")

class InterviewRequest(BaseModel):
    question: str
    answer: str

# --- Agent Helper ---

def get_agent():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.error("❌ OPENROUTER_API_KEY is missing!")
        # On Vercel, this must be set in the Project Settings -> Environment Variables
        raise HTTPException(status_code=500, detail="API Key Missing. Set OPENROUTER_API_KEY in Vercel settings.")
    
    # Set standard OpenAI env vars so Pydantic AI picks them up automatically
    # This is necessary because OpenAIChatModel defaults to these
    os.environ["OPENAI_API_KEY"] = api_key
    os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"
    
    # Using Gemini 2.0 Flash Exp (Free) via OpenRouter
    model = OpenAIChatModel('google/gemini-2.0-flash-exp:free')
    
    return Agent(
        model,
        output_type=InterviewFeedback,
        retries=3,
        system_prompt=(
            "You are a tough, professional job interview coach. "
            "Evaluate the candidate's answer strictly but fairly. "
            "Provide constructive feedback in a structured JSON format."
        ),
    )

# --- Endpoints ---

# We use multiple decorators to handle both local dev and Vercel routing quirks
@app.post("/api/interview", response_model=InterviewFeedback)
@app.post("/interview", response_model=InterviewFeedback)
async def analyze_interview(request: InterviewRequest):
    try:
        logger.info(f"Analyzing question: {request.question[:50]}...")
        
        agent = get_agent()
        prompt = f"Question: {request.question}\nCandidate Answer: {request.answer}"
        
        # Run the agent
        result = await agent.run(prompt)
        
        # Determine the correct attribute based on Pydantic AI version
        if hasattr(result, 'output'):
            return result.output
        elif hasattr(result, 'data'):
            return result.data
        else:
            return result
            
    except Exception as e:
        traceback.print_exc()
        logger.error(f"Agent Error: {str(e)}")
        
        error_msg = str(e)
        if "429" in error_msg:
            detail = "Model busy (Rate Limit). Please wait 10s and retry."
        else:
            detail = f"AI Analysis Failed: {error_msg}"
            
        raise HTTPException(status_code=500, detail=detail)

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {"status": "ok", "environment": os.getenv("NODE_ENV", "production")}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)