from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Optional
from app.core.database import get_session
from app.core.security import security_service
from app.repositories.base import UserRepository
from app.models.models import User, UserResponse
import logging

logger = logging.getLogger(__name__)

# OAuth2 scheme
security = HTTPBearer()

# Constants
INACTIVE_USER_MSG = "Inactive user"


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials or not credentials.credentials:
        logger.warning("No credentials provided")
        raise credentials_exception
    
    # Verify token
    try:
        payload = security_service.verify_token(credentials.credentials, "access")
        if payload is None:
            logger.warning("Token verification failed")
            raise credentials_exception
    except Exception as e:
        logger.warning("Token verification error: %s", str(e))
        raise credentials_exception
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        logger.warning("No user ID in token")
        raise credentials_exception
    
    # Validate user_id is numeric
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        logger.warning("Invalid user ID format: %s", user_id)
        raise credentials_exception
    
    # Get user from database
    user_repo = UserRepository(session)
    user = user_repo.get_by_id(user_id_int)
    if user is None:
        logger.warning("User not found: %s", user_id)
        raise credentials_exception
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INACTIVE_USER_MSG
        )
    
    return UserResponse.model_validate(current_user)


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current admin user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INACTIVE_USER_MSG
        )
    
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return current_user


def get_current_moderator_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current moderator or admin user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INACTIVE_USER_MSG
        )
    
    if current_user.role not in ["moderator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return current_user


def optional_authentication(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    session: Session = Depends(get_session)
) -> Optional[User]:
    """Optional authentication - returns user if token is valid, None otherwise"""
    if not credentials or not credentials.credentials:
        return None
    
    try:
        payload = security_service.verify_token(credentials.credentials, "access")
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        # Validate user_id is numeric
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            logger.warning("Invalid user ID format in optional auth: %s", user_id)
            return None
        
        user_repo = UserRepository(session)
        user = user_repo.get_by_id(user_id_int)
        return user
    
    except Exception as e:
        logger.warning("Optional authentication failed: %s", str(e))
        return None