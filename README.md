# 🤖 AI Interview Simulator — Full Stack

> A full-stack AI-powered mock interview platform built with **React + FastAPI + Claude AI**.
> Practice real interviews, get voice transcription, emotion tracking, and detailed AI feedback.

---

## 📁 Project Structure

```
ai-interview-simulator/
├── backend/
│   ├── main.py              ← FastAPI server (all AI endpoints)
│   ├── requirements.txt     ← Python dependencies
│   ├── .env                 ← Your API key goes here (create this)
│   └── .env.example         ← Template
│
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── LandingScreen.jsx + .module.css
    │   │   ├── SetupScreen.jsx   + .module.css
    │   │   ├── InterviewScreen.jsx + .module.css
    │   │   ├── FeedbackScreen.jsx  + .module.css
    │   │   └── LoadingScreen.jsx   + .module.css
    │   ├── hooks/
    │   │   └── useInterviewHooks.js
    │   ├── App.jsx          ← Root component
    │   ├── api.js           ← API service layer
    │   ├── main.jsx         ← React entry point
    │   └── index.css        ← Global styles
    ├── index.html
    ├── package.json
    └── vite.config.js       ← Vite dev server + API proxy
```

---

## 🚀 Quick Start (Step-by-Step)

### Prerequisites
- **Python 3.9+** — https://python.org/downloads
- **Node.js 18+** — https://nodejs.org
- **Anthropic API Key** — https://console.gemini.com

---

### Step 1 — Get your API Key

1. Go to https://console.gemini.com//
2. Click **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

---

### Step 2 — Set up Backend

```bash
# Navigate to backend folder
cd ai-interview-simulator/backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
# On Windows (Command Prompt):
copy .env.example .env
# On Mac/Linux:
cp .env.example .env
```

Now open `.env` and paste your API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Start the backend server:
```bash
python main.py
```

✅ Backend runs at: **http://localhost:8000**
📖 API docs at:     **http://localhost:8000/docs**

---

### Step 3 — Set up Frontend

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend folder
cd ai-interview-simulator/frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

✅ Frontend runs at: **http://localhost:5173**

---

### Step 4 — Open in Browser

Open **http://localhost:5173** in **Google Chrome** (required for voice recognition).

When prompted, **allow camera and microphone access**.

---

## 🎯 How to Use

| Step | Action |
|------|--------|
| 1 | Click **"Start Interview Practice"** on the homepage |
| 2 | Choose your **Job Role** (e.g., Software Engineer) |
| 3 | Set **Difficulty** (Easy / Medium / Hard) and number of questions |
| 4 | Click **"Begin Interview"** — AI generates personalized questions |
| 5 | Answer each question by **typing** or clicking **🎙️ Start Voice** |
| 6 | After all questions, receive a **full AI performance report** |
| 7 | Review scores, strengths, improvements, and your action plan |

---

## 🧠 AI Features

| Feature | Technology |
|---------|-----------|
| Dynamic question generation | Claude claude-sonnet-4-5 |
| Per-answer analysis (clarity, relevance, confidence) | Claude claude-sonnet-4-5 |
| Final performance report & hire recommendation | Claude claude-sonnet-4-5 |
| Voice-to-text transcription | Web Speech API (Chrome) |
| Real-time emotion simulation | JavaScript interval simulation |
| Live webcam feed | Browser MediaDevices API |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/` | Health check |
| POST | `/api/generate-questions` | Generate role-specific questions |
| POST | `/api/analyze-answer` | Analyze a single answer |
| POST | `/api/generate-feedback` | Generate full interview report |

---

## 🛠️ Troubleshooting

**Backend won't start?**
- Make sure your `.env` file has the correct API key
- Ensure your virtual environment is activated
- Try: `pip install -r requirements.txt --upgrade`

**Voice not working?**
- Must use **Google Chrome** or **Microsoft Edge**
- Allow microphone permission when the browser asks
- Check browser settings → Site Settings → Microphone

**Camera not showing?**
- Allow camera permission when the browser asks
- If blocked, click the 🔒 icon in address bar → allow camera

**CORS error?**
- Make sure backend is running on port 8000
- Make sure frontend is running on port 5173
- Do not change ports without updating `vite.config.js` and `main.py`

**API rate limit / quota error?**
- Check your Anthropic account usage at console.gemini.com
- The app will use fallback questions/feedback if the API fails

---

## 📦 Build for Production

```bash
# Build frontend for production
cd frontend
npm run build

# Serve built files (optional)
npm run preview
```

For deployment, you can host:
- **Backend**: Railway, Render, Heroku, or any Python server
- **Frontend**: Vercel, Netlify, or any static host

---

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Gemini API key from console.gemini.com |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS Modules |
| Backend | Python, FastAPI, Uvicorn |
| AI | Gemini, Claude claude-sonnet-4-5 |
| Voice | Web Speech Recognition API |
| Camera | MediaDevices.getUserMedia() |
| Fonts | Google Fonts (Syne + DM Sans) |

---

Made with ❤️ for placement preparation · Powered by AYUSH DUBEY----
