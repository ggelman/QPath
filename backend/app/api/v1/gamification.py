from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from app.core.database import get_session
from app.core.auth import get_current_active_user
from app.services.gamification_service import GamificationService
from app.models.models import (
    UserResponse,
    GamificationProfileResponse,
    ActivityLogResponse,
    ActivityType,
    StudyTaskCreate,
    StudyTaskResponse,
    StudyTaskCompletionUpdate,
    DashboardResponse,
    UserRewardCreate,
    UserRewardUpdate,
    UserRewardResponse,
    ProfileDetailsResponse,
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/profile", response_model=GamificationProfileResponse)
async def get_gamification_profile(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get current user's gamification profile"""
    gamification_service = GamificationService(session)
    profile = gamification_service.get_user_profile(current_user.id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gamification profile not found"
        )
    
    return profile


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard_data(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Aggregate dashboard data for the current user"""
    gamification_service = GamificationService(session)
    return gamification_service.get_dashboard_data(current_user.id)


@router.put("/tasks", response_model=List[StudyTaskResponse])
async def sync_tasks(
    tasks: List[StudyTaskCreate],
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Replace dashboard tasks (used for migration from localStorage)"""
    gamification_service = GamificationService(session)

    if tasks:
        payload = [task.model_dump() for task in tasks]
        return gamification_service.replace_tasks(current_user.id, payload)

    # No tasks provided - return existing tasks to keep defaults
    return gamification_service.get_dashboard_data(current_user.id).tasks


@router.patch("/tasks/{task_id}", response_model=StudyTaskResponse)
async def update_task_completion(
    task_id: int,
    update: StudyTaskCompletionUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Toggle completion state of a dashboard task"""
    gamification_service = GamificationService(session)
    updated = gamification_service.update_task_completion(
        user_id=current_user.id,
        task_id=task_id,
        completed=update.completed,
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return updated


@router.get("/rewards", response_model=List[UserRewardResponse])
async def list_rewards(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """List custom rewards for the current user"""
    gamification_service = GamificationService(session)
    return gamification_service.get_rewards(current_user.id)


@router.post("/rewards", response_model=UserRewardResponse, status_code=status.HTTP_201_CREATED)
async def create_reward(
    reward: UserRewardCreate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Create a custom reward"""
    if not reward.condition.strip() or not reward.reward.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Condition and reward must be provided",
        )

    gamification_service = GamificationService(session)
    return gamification_service.create_reward(current_user.id, reward)


@router.patch("/rewards/{reward_id}", response_model=UserRewardResponse)
async def update_reward(
    reward_id: int,
    update: UserRewardUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Update or mark a reward as achieved"""
    if update.achieved is None and not update.condition and not update.reward:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    gamification_service = GamificationService(session)
    updated = gamification_service.update_reward(current_user.id, reward_id, update)

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found",
        )

    return updated


@router.get("/profile/details", response_model=ProfileDetailsResponse)
async def get_profile_details(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Return extended profile details with achievements and rewards"""
    gamification_service = GamificationService(session)
    return gamification_service.get_profile_details(current_user.id)


@router.post("/complete-trilha", response_model=GamificationProfileResponse)
async def complete_trilha(
    trilha_name: str,
    xp_earned: int = 100,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Complete a trilha and award XP"""
    # Input validation with enhanced security
    if not trilha_name or not isinstance(trilha_name, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trilha name is required"
        )
    
    trilha_name = trilha_name.strip()
    if len(trilha_name) < 3 or len(trilha_name) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Trilha name must be between 3 and 100 characters"
        )
    
    if not isinstance(xp_earned, int) or xp_earned < 0 or xp_earned > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="XP earned must be between 0 and 1000"
        )
    
    # Sanitize input - remove any potentially dangerous characters
    import re
    trilha_name = re.sub(r'[<>"\'/\\&]', '', trilha_name)
    
    gamification_service = GamificationService(session)
    return gamification_service.complete_trilha(
        user_id=current_user.id,
        trilha_name=trilha_name,
        xp_earned=xp_earned
    )


@router.post("/pomodoro-session", response_model=GamificationProfileResponse)
async def log_pomodoro_session(
    duration_minutes: int,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Log a completed Pomodoro session"""
    if not isinstance(duration_minutes, int) or duration_minutes <= 0 or duration_minutes > 120:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duration must be between 1 and 120 minutes"
        )
    
    gamification_service = GamificationService(session)
    return gamification_service.log_pomodoro_session(
        user_id=current_user.id,
        duration_minutes=duration_minutes
    )


@router.post("/add-xp", response_model=GamificationProfileResponse)
async def add_xp(
    xp_amount: int,
    activity_type: ActivityType,
    description: str,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Add XP to current user (for manual activities)"""
    if not isinstance(xp_amount, int) or xp_amount <= 0 or xp_amount > 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="XP amount must be between 1 and 1000"
        )
    
    # Validate and sanitize description
    if not description or not isinstance(description, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description is required"
        )
    
    description = description.strip()
    if len(description) < 3 or len(description) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be between 3 and 500 characters"
        )
    
    # Sanitize description
    import re
    description = re.sub(r'[<>"\'/\\&]', '', description)
    
    gamification_service = GamificationService(session)
    return gamification_service.add_xp(
        user_id=current_user.id,
        xp_amount=xp_amount,
        activity_type=activity_type,
        description=description
    )


@router.get("/activity-logs", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Get current user's activity logs"""
    # Validate pagination parameters
    if skip < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skip parameter must be non-negative"
        )
    
    if limit <= 0 or limit > 100:
        limit = min(max(limit, 1), 100)
    
    gamification_service = GamificationService(session)
    return gamification_service.get_activity_logs(
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = 10,
    session: Session = Depends(get_session)
):
    """Get XP leaderboard (public endpoint)"""
    # Validate limit parameter
    if limit <= 0 or limit > 50:
        limit = min(max(limit, 1), 50)
    
    gamification_service = GamificationService(session)
    return gamification_service.get_leaderboard(limit=limit)


@router.get("/profile/{user_id}", response_model=GamificationProfileResponse)
async def get_user_gamification_profile(
    user_id: int,
    session: Session = Depends(get_session)
):
    """Get user's gamification profile (public endpoint)"""
    # Validate user_id
    if user_id <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    gamification_service = GamificationService(session)
    profile = gamification_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return profile
