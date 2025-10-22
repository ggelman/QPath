from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Dict, Any
from app.core.config import settings
import secrets
import logging

logger = logging.getLogger(__name__)

# Password hashing context with stronger configuration
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12  # Stronger hashing rounds
)

class SecurityService:
    """Security service for authentication and authorization"""
    
    def __init__(self):
        self.SECRET_KEY = settings.SECRET_KEY
        self.ALGORITHM = settings.ALGORITHM
        self.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self.REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "type": "access",
            "iat": datetime.now(timezone.utc),
            "jti": secrets.token_urlsafe(32)  # JWT ID for revocation
        })
        
        return jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
    
    def create_refresh_token(self, data: dict) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "type": "refresh",
            "iat": datetime.now(timezone.utc),
            "jti": secrets.token_urlsafe(32)
        })
        
        return jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
    
    def verify_token(self, token: str, token_type: str = "access") -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            
            # Verify token type
            if payload.get("type") != token_type:
                logger.warning(f"Invalid token type: expected {token_type}, got {payload.get('type')}")
                return None
            
            # Check expiration
            exp_timestamp = payload.get("exp", 0)
            if datetime.fromtimestamp(exp_timestamp, tz=timezone.utc) < datetime.now(timezone.utc):
                logger.warning("Token has expired")
                return None
                
            return payload
            
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in token verification: {e}")
            return None
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    def generate_password_reset_token(self, email: str) -> str:
        """Generate password reset token"""
        delta = timedelta(hours=1)  # Reset token expires in 1 hour
        now = datetime.now(timezone.utc)
        expires = now + delta
        
        exp = expires.timestamp()
        encoded_jwt = jwt.encode(
            {"exp": exp, "nbf": now, "sub": email, "type": "password_reset"},
            self.SECRET_KEY,
            algorithm=self.ALGORITHM,
        )
        return encoded_jwt
    
    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """Verify password reset token"""
        try:
            decoded_token = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            if decoded_token.get("type") != "password_reset":
                return None
            return decoded_token["sub"]
        except JWTError:
            return None


# Global security service instance
security_service = SecurityService()