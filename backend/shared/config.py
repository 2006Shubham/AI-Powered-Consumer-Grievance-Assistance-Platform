from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "grievance_db"
    jwt_secret: str = "dev-jwt-secret-key-consumer-grievance-2026"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    storage_path: str = "storage"
    faiss_index_path: str = "storage/faiss_index.bin"
    imagekit_private_key: str = ""
    imagekit_public_key: str = ""
    imagekit_url_endpoint: str = ""
    qdrant_url: str = ""
    qdrant_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
