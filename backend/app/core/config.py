from pydantic_settings import BaseSettings
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    # Project Information
    PROJECT_NAME: str = "Q-Path Backend API"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Database Configuration
    DATABASE_HOST: str = "127.0.0.1"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "qpath_db"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = ""  # Must be set via environment variable
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # JWT Configuration  
    SECRET_KEY: str = ""  # Must be set via environment variable
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Gemini AI Configuration
    GEMINI_API_KEY: Optional[str] = None
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from components"""
        from urllib.parse import quote_plus
        password = quote_plus(self.DATABASE_PASSWORD or "dev_password")
        return f"postgresql://{self.DATABASE_USER}:{password}@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
    GOOGLE_AI_API_KEY: Optional[str] = None  # Alternative name
    
    # Application Configuration
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Security Configuration
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Security
    BCRYPT_ROUNDS: int = 12
    
    # Gamification Configuration
    XP_BASE_VALUE: int = 100
    XP_CURVE_FACTOR: float = 1.8
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()