from pydantic import BaseModel
from typing import List, Optional

class ContentRequest(BaseModel):
    topic: str
    subtopic: str
    mode: str = "story" # story, deep, exam
    difficulty: str = "Normal"
    language: str = "English"
    images: Optional[List[str]] = None
    videos: Optional[List[str]] = None

class ContentResponse(BaseModel):
    content: str
    images: List[str] = []
    videos: List[str] = []
    quiz_questions: List[dict] = []
