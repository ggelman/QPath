from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from typing import Dict, Any, Optional
from app.core.database import get_session
from app.core.security import security_service
from app.core.auth import get_current_active_user
from app.repositories.base import UserRepository
from app.models.models import Token, LoginRequest, TokenRefresh, UserResponse
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Constants
INVALID_TOKEN_MSG = "Invalid or expired token"


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """Authenticate user and return JWT tokens"""
    user_repo = UserRepository(session)
    
    # Input validation
    if not form_data.username or not form_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )
    
    # Authenticate user (username can be email or username)
    user = user_repo.authenticate(form_data.username.lower().strip(), form_data.password)
    if not user:
        # Generic error message to prevent user enumeration
        logger.warning(f"Failed login attempt for username: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        logger.warning(f"Inactive user attempted login: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # Create access token
    access_token = security_service.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    
    # Create refresh token
    refresh_token = security_service.create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    logger.info(f"User {user.email} logged in successfully")
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: TokenRefresh,
    session: Session = Depends(get_session)
):
    """Refresh access token using refresh token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify refresh token
    payload = security_service.verify_token(refresh_data.refresh_token, "refresh")
    if payload is None:
        raise credentials_exception
    
    # Get user ID from token
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user_repo = UserRepository(session)
    user = user_repo.get_by_id(int(user_id))
    if user is None or not user.is_active:
        raise credentials_exception
    
    # Create new access token
    access_token = security_service.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    
    # Create new refresh token
    new_refresh_token = security_service.create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)"""
    # In a production app, you might want to blacklist the token
    # For now, we'll just return success and let the client handle token removal
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def forgot_password(
    email: str,
    session: Session = Depends(get_session)
):
    """Request password reset"""
    user_repo = UserRepository(session)
    user = user_repo.get_by_email(email)
    
    # Always return success to prevent email enumeration
    if user and user.is_active:
        # Generate password reset token
        reset_token = security_service.generate_password_reset_token(email)
        
        # In a real app, you would send this token via email
        # For now, we'll just log it
        logger.info(f"Password reset token for {email}: {reset_token}")
        
        # Store token in database (in production, you might want to hash this)
        user.password_reset_token = reset_token
        session.commit()
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    session: Session = Depends(get_session)
):
    """Reset password using token"""
    # Verify reset token
    email = security_service.verify_password_reset_token(token)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_TOKEN_MSG
        )
    
    # Get user
    user_repo = UserRepository(session)
    user = user_repo.get_by_email(email)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_TOKEN_MSG
        )
    
    # Verify token matches stored token
    if user.password_reset_token != token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_TOKEN_MSG
        )
    
    # Update password
    user.hashed_password = security_service.get_password_hash(new_password)
    user.password_reset_token = None  # Clear the reset token
    session.commit()
    
    logger.info(f"Password reset successful for user: {user.email}")
    
    return {"message": "Password reset successful"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get current user information"""
    return current_user