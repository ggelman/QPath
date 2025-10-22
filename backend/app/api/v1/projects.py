from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional
from app.core.database import get_session
from app.core.auth import get_current_active_user, get_current_moderator_user
from app.services.user_service import ProjectService
from app.models.models import (
    UserResponse, UserProjectSubmissionCreate, 
    UserProjectSubmissionUpdate, UserProjectSubmissionResponse,
    ProjectStatus
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Constants
INVALID_SUBMISSION_ID_MSG = "Invalid submission ID"
PROJECT_NOT_FOUND_MSG = "Project submission not found"


@router.post("/submit", response_model=UserProjectSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_project(
    submission_data: UserProjectSubmissionCreate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Submit a new project"""
    project_service = ProjectService(session)
    return project_service.create_submission(
        user_id=current_user.id,
        submission_data=submission_data
    )


@router.get("/my-submissions", response_model=List[UserProjectSubmissionResponse])
async def get_my_submissions(
    skip: int = 0,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get current user's project submissions"""
    if limit > 100:
        limit = 100
    
    project_service = ProjectService(session)
    return project_service.get_user_submissions(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )


@router.get("/submission/{submission_id}", response_model=UserProjectSubmissionResponse)
async def get_submission(
    submission_id: int,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get project submission by ID"""
    # Validate submission_id
    if submission_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_SUBMISSION_ID_MSG
        )
    
    project_service = ProjectService(session)
    submission = project_service.get_submission(
        submission_id=submission_id,
        user_id=current_user.id
    )
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=PROJECT_NOT_FOUND_MSG
        )
    
    return submission


@router.put("/submission/{submission_id}", response_model=UserProjectSubmissionResponse)
async def update_submission(
    submission_id: int,
    update_data: UserProjectSubmissionUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update project submission"""
    # Validate submission_id
    if submission_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_SUBMISSION_ID_MSG
        )
    
    project_service = ProjectService(session)
    return project_service.update_submission(
        submission_id=submission_id,
        user_id=current_user.id,
        update_data=update_data
    )


@router.get("/all-submissions", response_model=List[UserProjectSubmissionResponse])
async def get_all_submissions(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[ProjectStatus] = None,
    current_user: UserResponse = Depends(get_current_moderator_user),
    session: Session = Depends(get_session)
):
    """Get all project submissions (moderator/admin only)"""
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )
    
    if limit <= 0 or limit > 100:
        limit = min(max(limit, 1), 100)
    
    project_service = ProjectService(session)
    return project_service.get_all_submissions(
        skip=skip,
        limit=limit,
        status_filter=status_filter.value if status_filter else None
    )


@router.get("/user/{user_id}/submissions", response_model=List[UserProjectSubmissionResponse])
async def get_user_submissions(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    current_user: UserResponse = Depends(get_current_moderator_user),
    session: Session = Depends(get_session)
):
    """Get user's project submissions (moderator/admin only)"""
    # Validate user_id
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )
    
    if limit <= 0 or limit > 100:
        limit = min(max(limit, 1), 100)
    
    project_service = ProjectService(session)
    return project_service.get_user_submissions(
        user_id=user_id,
        skip=skip,
        limit=limit
    )


@router.get("/public/submission/{submission_id}", response_model=UserProjectSubmissionResponse)
async def get_public_submission(
    submission_id: int,
    session: Session = Depends(get_session)
):
    """Get approved project submission (public endpoint)"""
    # Validate submission_id
    if submission_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=INVALID_SUBMISSION_ID_MSG
        )
    
    project_service = ProjectService(session)
    submission = project_service.get_submission(submission_id=submission_id)
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=PROJECT_NOT_FOUND_MSG
        )
    
    # Only show approved submissions publicly
    if submission.status != ProjectStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=PROJECT_NOT_FOUND_MSG
        )
    
    return submission