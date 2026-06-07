# Config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Groq Inference and HuggingFaces
    hf_token: str
    groq_api_key: str

    # App's Secret and Refresh Token Config
    secret_key: str
    refresh_token_secret: str

    # MongoDB Config
    mongo_uri: str = "mongodb://localhost:27017"
    mongodb_atlas_uri: str
    db_name: str = "test"

    # Attendee Config
    webhook_secret: str
    attendee_api_key: str

    # STT Config
    deepgram_api_key: str
    assembly_api_key: str | None = None
    
    # Zoom OAuth Config
    zoom_client_id: str
    zoom_client_secret: str
    zoom_redirect_uri: str = "http://localhost:3000/api/v1/zoom/callback/"
    
    # Google Gemini Config
    google_api_key: str

    # Cohere API Key for Reranking
    cohere_api_key: str
    
settings = Settings()

