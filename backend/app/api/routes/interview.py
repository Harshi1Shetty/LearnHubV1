from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import requests
import json
import re
from app.core.config import settings

router = APIRouter()

class InterviewRequest(BaseModel):
    topic: str
    difficulty: str
    previous_question: str | None = None
    answer: str | None = None


def extract_json(text: str):
    """
    Extract first JSON object from LLM output
    """
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    return match.group(0)


@router.post("/")
def interview(req: InterviewRequest):

    if not req.previous_question:
        prompt = f"""
You are an interview examiner.

Ask ONE interview question only.
Topic: {req.topic}
Difficulty: {req.difficulty}

Respond in JSON only:
{{ "question": "..." }}
"""
    else:
        prompt = f"""
You are an interview examiner.

Previous Question:
{req.previous_question}

Candidate Answer:
{req.answer}

Evaluate briefly and ask next question.

Respond in JSON only:
{{
  "score": 0,
  "feedback": "...",
  "next_question": "..."
}}
"""

    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=120,
        )
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ollama connection failed: {str(e)}"
        )

    raw_text = response.json().get("response", "").strip()

    print("\n===== OLLAMA RAW OUTPUT =====\n", raw_text)

    json_text = extract_json(raw_text)
    if not json_text:
        return {
            "error": "Could not extract JSON from AI output",
            "raw_response": raw_text
        }

    try:
        return json.loads(json_text)
    except Exception as e:
        return {
            "error": "JSON parse failed",
            "raw_response": raw_text,
            "exception": str(e)
        }
