import os
import logging
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
# Import only Agent first to avoid circular dep issues in some envs
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- Schemas ---

class InterviewFeedback(BaseModel):
    score: int = Field(description="Score from 1-10 based on the quality of the answer")
    strengths: List[str] = Field(description="List of strong points in the answer")
    weaknesses: List[str] = Field(description="List of areas for improvement")
    suggested_answer: str = Field(description="A better way to answer the question")

class InterviewRequest(BaseModel):
    question: str
    answer: str

# --- Agent Configuration ---

# Ensure API Key is set for the process
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    logger.error("❌ OPENROUTER_API_KEY is missing!")
else:
    logger.info(f"✅ API Key detected (starts with: {api_key[:8]})")
    # Set standard OpenAI env vars so Pydantic AI picks them up automatically
    os.environ["OPENAI_API_KEY"] = api_key
    os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"

# Create model - using Gemini 2.0 Flash Exp (Free)
# This model supports Structured Output (Tools) robustly.
model = OpenAIChatModel('google/gemini-2.0-flash-exp:free')

# Initialize Agent
# We use output_type (correct for 0.0.x versions) to define structured output
agent = Agent(
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

@app.post("/api/interview", response_model=InterviewFeedback)
async def analyze_interview(request: InterviewRequest):
    try:
        logger.info(f"Received request for question: {request.question[:50]}...")
        
        prompt = f"Question: {request.question}\nCandidate Answer: {request.answer}"
        
        logger.info("Running Agent...")
        # Run the agent
        result = await agent.run(prompt)
        logger.info(f"Agent run complete. Result type: {type(result)}")
        logger.info(f"Result attributes: {dir(result)}")
        
        # Try to return output, or handle legacy/alternative field names
        if hasattr(result, 'data'):
            logger.info("Returing result.data")
            return result.data
        elif hasattr(result, 'output'):
            logger.info("Returing result.output")
            return result.output
        else:
            logger.info("result.data/output not found. Returning result directly.")
            return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Agent Error: {str(e)}")
        
        error_msg = str(e)
        if "429" in error_msg:
            detail_msg = "Free Model Rate Limited. Please wait 10s and retry."
        else:
            detail_msg = f"AI Agent Error: {error_msg}"
            
        raise HTTPException(status_code=500, detail=detail_msg)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model": "google/gemini-2.0-flash-exp:free"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)