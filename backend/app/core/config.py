import json
from typing import List, Union, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Invisible City"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Database Settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "invisible_city"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/invisible_city"

    # JWT Authentication Secrets & Expiration
    JWT_SECRET_KEY: str = "invisible_city_super_secret_jwt_key_change_in_production_2026"
    JWT_REFRESH_SECRET_KEY: str = "invisible_city_super_secret_refresh_jwt_key_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage Abstraction Settings
    STORAGE_PROVIDER: str = "local"  # 'local' or 's3'
    STORAGE_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_IMAGE_MIMES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp"]

    # AI Layer Settings
    AI_PROVIDER: str = "local"  # 'local' or 'openai'
    AI_MODEL: str = "gpt-4o-mini"
    AI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    AI_CONFIDENCE_THRESHOLD: float = 0.70
    AI_TIMEOUT_SECONDS: int = 30
    AI_MAX_RETRIES: int = 2
    AI_PROMPT_VERSION: str = "v1"
    OPENAI_API_KEY: Optional[str] = None

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
