from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

app = FastAPI(title="AI Interview Simulator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", "your-key-here"))


# ── Pydantic Models ─────────────────────────────────────────────────────────

class GenerateQuestionsRequest(BaseModel):
    job_role: str
    difficulty: str = "medium"
    num_questions: int = 5

class AnalyzeAnswerRequest(BaseModel):
    question: str
    answer: str
    job_role: str
    question_type: str = "behavioral"

class AnswerRecord(BaseModel):
    question: str
    answer: str
    type: Optional[str] = "behavioral"
    analysis: dict

class GenerateFeedbackRequest(BaseModel):
    job_role: str
    answers: List[AnswerRecord]


# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_json(text: str):
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()
    # Find first '[' or '{' to handle any leading text
    start = min(
        text.find("[") if text.find("[") != -1 else len(text),
        text.find("{") if text.find("{") != -1 else len(text),
    )
    text = text[start:]
    if not text:
        raise ValueError("No JSON found in response")
    return json.loads(text)


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Interview Simulator API is running", "version": "1.0.0"}


@app.post("/api/generate-questions")
async def generate_questions(req: GenerateQuestionsRequest):
    try:
        prompt = f"""Generate exactly {req.num_questions} interview questions for a {req.job_role} position at {req.difficulty} difficulty.
Mix behavioral, technical, situational, and personality types.
Return ONLY a valid JSON array, no markdown, no explanation:
[{{"id":1,"question":"Full question text","type":"behavioral","hint":"Short coaching tip"}},{{"id":2,"question":"...","type":"technical","hint":"..."}}]
Types allowed: behavioral, technical, situational, personality"""

        msg = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        questions = extract_json(msg.content[0].text)
        return {"success": True, "questions": questions}

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze-answer")
async def analyze_answer(req: AnalyzeAnswerRequest):
    try:
        if not req.answer.strip() or req.answer.strip() == "(Skipped)":
            return {
                "success": True,
                "analysis": {
                    "score": 1, "clarity": 1, "relevance": 1,
                    "confidence_indicator": 1, "communication": 1,
                    "strengths": ["Attempted to participate"],
                    "improvements": ["Answer the question fully", "Speak clearly about your experience"],
                    "ideal_answer_hint": "Provide a complete, structured answer using real examples.",
                    "overall_comment": "No answer was given for this question.",
                },
            }

        prompt = f"""You are an expert interview coach. Analyse this interview response honestly.

Role: {req.job_role}
Question Type: {req.question_type}
Question: "{req.question}"
Candidate Answer: "{req.answer}"

Return ONLY a valid JSON object, no other text:
{{"score":8,"clarity":7,"relevance":8,"confidence_indicator":7,"communication":7,
"strengths":["specific strength 1","specific strength 2"],
"improvements":["specific improvement 1","specific improvement 2"],
"ideal_answer_hint":"What a great answer would include (1-2 sentences)",
"overall_comment":"One constructive sentence of feedback"}}

All scores 1-10. Be honest and constructive."""

        msg = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=800,
            messages=[{"role": "user", "content": prompt}],
        )
        analysis = extract_json(msg.content[0].text)
        return {"success": True, "analysis": analysis}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-feedback")
async def generate_feedback(req: GenerateFeedbackRequest):
    try:
        answers_list = [a.dict() for a in req.answers]
        summary = "\n---\n".join(
            f"Q{i+1} ({a['type']}): {a['question']}\nScore: {a['analysis']['score']}/10\nAnswer: {a['answer'][:250]}"
            for i, a in enumerate(answers_list)
        )
        avg = sum(a["analysis"]["score"] for a in answers_list) / max(len(answers_list), 1)
        overall = max(10, min(99, int(avg * 10)))

        prompt = f"""You are a senior interview coach. Give comprehensive final feedback for a {req.job_role} candidate.

Interview Summary (avg score {avg:.1f}/10):
{summary}

Return ONLY valid JSON, no other text:
{{"overall_score":{overall},
"hire_likelihood":"Yes",
"key_strengths":["strength 1","strength 2","strength 3"],
"key_improvements":["improvement 1","improvement 2","improvement 3"],
"communication_score":7,"technical_score":7,"confidence_score":7,"preparation_score":7,
"executive_summary":"2-3 sentence professional summary of the candidate",
"next_steps":["action 1","action 2","action 3","action 4"],
"recommended_resources":["resource 1","resource 2","resource 3"],
"interview_tips":["tip 1","tip 2","tip 3"]}}

hire_likelihood must be exactly one of: "Strong Yes", "Yes", "Maybe", "No"
All sub-scores 1-10, overall_score 1-100."""

        msg = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}],
        )
        fb = extract_json(msg.content[0].text)
        return {"success": True, "feedback": fb}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
