# AI Job Interview Simulator

A full-stack AI interview coach built with Next.js, FastAPI, and Pydantic AI.

## Features
- **AI Interviewer**: Simulates a tough interview environment.
- **Instant Feedback**: Scores your answer (1-10) and provides strengths, weaknesses, and a suggested answer.
- **Modern UI**: Clean, professional interface built with Shadcn/UI and Tailwind CSS.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/UI
- **Backend**: Python, FastAPI, Pydantic AI
- **AI Model**: OpenRouter (Google Gemini 2.0 Flash Exp)

## Prerequisites
- Node.js 18+
- Python 3.9+
- OpenRouter API Key

## Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd job-interview-simulator
   ```

2. **Backend Setup**
   ```bash
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   npm install
   ```

4. **Environment Variables**
   - Create a `.env` file in the root based on `.env.example`.
   - Add your `OPENROUTER_API_KEY`.
   ```bash
   cp .env.example .env
   # Edit .env and add your key
   ```

## Running Locally

1. **Start the Backend**
   ```bash
   # In a new terminal
   python api/index.py
   # Runs on http://0.0.0.0:8000
   ```

2. **Start the Frontend**
   ```bash
   # In a separate terminal
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Open Browser**
   - Navigate to `http://localhost:3000`

## Deployment (Vercel)

1. Push to GitHub.
2. Import project into Vercel.
3. Add `OPENROUTER_API_KEY` to Vercel Environment Variables.
4. Deploy! Vercel automatically handles the Next.js app and Python API.
