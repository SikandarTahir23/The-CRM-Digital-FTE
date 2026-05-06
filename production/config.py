# production/config.py
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    EMAIL_ADDRESS: str = ""
    EMAIL_PASSWORD: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    IMAP_HOST: str = "imap.gmail.com"
    IMAP_PORT: int = 993
    DATABASE_URL: str = ""
    OPENAI_API_KEY: str = ""
    WHAPI_API_KEY: str = ""
    WHAPI_PHONE_ID: str = ""
    WHAPI_BASE_URL: str = "https://gate.whapi.cloud"
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    POLL_INTERVAL: int = 60
    SENTIMENT_THRESHOLD: float = 0.3
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    SENTIMENT_MODEL: str = "distilbert-base-uncased-finetuned-sst-2-english"
    LOG_LEVEL: str = "DEBUG"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production"

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
