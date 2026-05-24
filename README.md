# Let Him Cook 🍳

An AI-powered, full-stack web application that turns any dish into an interactive, step-by-step cooking guide. 

Instead of scrolling through endless food blogs, users simply type in what they want to eat. The app leverages bleeding-edge LLMs to generate a structured recipe and provides an interactive "Cooking Mode" complete with step-by-step navigation and integrated countdown timers.

## ✨ Features
* **AI Recipe Generation:** Powered by Meta's LLaMA 3.1 via the ultra-fast Groq API.
* **Interactive Cooking Mode:** Guides you through the recipe one step at a time so you don't lose your place.
* **Smart Timers:** Automatically detects steps that require cooking time (e.g., "Bake for 15 minutes") and spawns a functional countdown timer right on the screen.
* **Modern UI:** Built with React and Vite for a lightning-fast user experience.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, JavaScript, CSS
* **Backend:** Python, FastAPI, Uvicorn
* **AI/LLM:** Groq API (llama-3.1-8b-instant)

---

## 🚀 How to Run Locally

To run this project on your local machine, you will need to start both the backend and frontend servers.

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Activate the virtual environment (if you are using one).
3. Create a `.env` file in the `backend` directory and add your Groq API key:
   ```text
   GROQ_API_KEY=your_api_key_here

### 2. Frontend Setup
1. Open a second terminal and navigate to the frontend folder.
2. Install the Node modules.
3.Start the Vite development server.
