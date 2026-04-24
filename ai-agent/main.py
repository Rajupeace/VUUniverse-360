import os
import sys
import json
import glob
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
    except OSError:
        pass

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(parent_env):
    load_dotenv(parent_env)

load_dotenv()

app = FastAPI(title="Vu AI Agent - Ultra Fast Mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load context data directly into memory to act as a lightweight RAG
knowledge_base = "Vignan University is a premier educational institution.\n"
try:
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    knowledge_dir = os.path.join(repo_root, "knowledge")
    txt_files = glob.glob(os.path.join(knowledge_dir, "*.txt")) + glob.glob(os.path.join(knowledge_dir, "*.md"))
    for fpath in txt_files:
        with open(fpath, "r", encoding="utf-8") as f:
            knowledge_base += f.read()[:2000] + "\n"  # limit size per file
except Exception as e:
    print(f"Warning: Could not load knowledge base: {e}")

class ChatRequest(BaseModel):
    message: str = None
    prompt: str = None
    role: str = "student"
    user_id: str = "guest"
    user_name: str = "Student"

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_message = req.message or req.prompt
    if not user_message:
        return {"response": "No message received."}

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {"response": "API Key not configured. Please set GOOGLE_API_KEY in the environment."}

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    system_prompt = f"You are Vu Ai, an intelligent assistant for Vignan University. Keep answers concise, helpful and friendly. Here is some context about the university:\n{knowledge_base[:3000]}\n"
    
    payload = {
        "contents": [{"parts": [{"text": system_prompt + "\nUser asks: " + user_message}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 800
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        response.raise_for_status()
        data = response.json()
        text_response = data['candidates'][0]['content']['parts'][0]['text']
        return {"response": text_response}
    except Exception as e:
        print(f"LLM Error: {e}")
        return {"response": "I'm having trouble connecting to my neural core. Please try again later."}

@app.get("/")
def health_check():
    return {
        "status": "active",
        "mode": "ultra_fast_api",
        "rag_ready": True,
        "llm_ready": True
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Ultra Fast VuAiAgent Server on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
