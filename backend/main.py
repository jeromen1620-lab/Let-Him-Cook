import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- NEW IMPORT
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

current_dir = Path(__file__).resolve().parent
env_path = current_dir / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.environ.get("GROQ_API_KEY")

if not api_key:
    raise ValueError(f"🚨 CRITICAL: Could not find GROQ_API_KEY. I looked exactly here: {env_path}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=api_key)

class RecipeRequest(BaseModel):
    dish: str

@app.post("/api/generate-recipe")
async def generate_recipe(request: RecipeRequest):
    prompt = f"""
    You are an expert chef. The user wants to cook {request.dish}. 
    Output a step-by-step recipe in strict JSON format. 
    The JSON must be an array of objects. 
    Each object must have these exact keys: 'step_number' (int), 'instruction' (string), 'requires_user_input' (boolean), 'timer_minutes' (int, 0 if none), and 'tips' (string).
    Do not output any introductory text or markdown formatting outside of the JSON. Just the raw JSON array.
    """
    
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant", # Updated to the latest supported model!
        temperature=0.2,
    )
    
    return {"recipe": chat_completion.choices[0].message.content}