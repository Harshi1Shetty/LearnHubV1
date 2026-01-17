from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3:8b"
    SERPER_API_KEY: str = "e48606b50c93d1e7fd9ab141d617cbebccce8bbe"

settings = Settings()

