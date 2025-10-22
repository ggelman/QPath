from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional
from app.core.database import get_session
from app.services.user_service import UserService
from app.models.models import UserCreate, UserUpdate, UserResponse
from app.core.auth import get_current_user, get_current_active_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_create: UserCreate,
    session: Session = Depends(get_session)
):
    """Register a new user"""
    user_service = UserService(session)
    return user_service.create_user(user_create)


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """Get current user's profile"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update current user's profile"""
    user_service = UserService(session)
    return user_service.update_user(
        user_id=current_user.id,
        user_update=user_update,
        current_user_id=current_user.id
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get user by ID (public profile)"""
    # Validate user_id
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    user_service = UserService(session)
    user = user_service.get_user(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get all users (admin only)"""
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )
    
    if limit <= 0 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100"
        )
    
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
    
    user_service = UserService(session)
    return user_service.get_users(skip=skip, limit=limit)