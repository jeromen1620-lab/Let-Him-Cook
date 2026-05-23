from fastapi import FastAPI
from pydantic import BaseModel
import os
from groq import Groq
from dotenv import load_dotenv

# Load the secret API key from the .env file
load_dotenv()

app = FastAPI()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# Define what data the frontend will send us
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
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3-8b-8192", # Using LLaMA 3 8B model
        temperature=0.2, # Keep it low so the AI is strict about the JSON format
    )
    
    # Return the AI's response to the frontend
    return {"recipe": chat_completion.choices[0].message.content}