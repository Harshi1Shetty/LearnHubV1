import json
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.core.config import settings

# Initialize Ollama
llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model="llama3.2:3b",
    temperature=0.7
)

async def generate_quiz_questions(topic: str, subtopic: str, difficulty: str, language: str = "English", num_questions: int = 5, user_status: str = "novice"):
    
    # Adaptive Logic
    adaptive_instruction = ""
    if user_status == "expert":
        adaptive_instruction = "The user is an EXPERT. Generate challenging questions that test deep understanding, edge cases, and application. Avoid simple recall questions."
    elif user_status == "competent":
        adaptive_instruction = "The user is COMPETENT. Mix intermediate and advanced questions. Focus on application and analysis."
    else:
        adaptive_instruction = "The user is a NOVICE. Focus on foundational concepts, definitions, and basic understanding. Keep questions straightforward."

    quiz_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert quiz generator. Create {num_questions} multiple choice questions to test the user's understanding of the subtopic.
        
        Target Audience Difficulty: {difficulty}
        User Proficiency Level: {user_status}
        {adaptive_instruction}
        Language: {language}
        
        Return ONLY a raw JSON array of objects. Do not include any markdown formatting like ```json or ```. Do not include any introductory text.
        The structure must be:
        [
            {{
                "id": 1,
                "question": "Question text here",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "The correct option text (must match one of the options exactly)",
                "explanation": "Brief explanation of why this is correct"
            }}
        ]
        """),
        ("user", f"Create a quiz for the subtopic '{subtopic}' which is part of '{topic}'.")
    ])
    
    chain = quiz_prompt | llm | JsonOutputParser()
    
    try:
        questions = await chain.ainvoke({
            "topic": topic,
            "subtopic": subtopic,
            "difficulty": difficulty,
            "language": language,
            "num_questions": num_questions,
            "user_status": user_status,
            "adaptive_instruction": adaptive_instruction
        })
        return questions
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        return []
