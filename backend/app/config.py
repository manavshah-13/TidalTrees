from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://tidaltrees:tidaltrees_secret@localhost:5432/tidaltrees"

    # JWT
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # CORS
    frontend_url: str = "http://localhost:5173"

    # Redis Cache
    redis_url: str = "redis://localhost:6379/0"

    model_config = {"env_file": [".env", "../.env"], "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
