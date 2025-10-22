"""Learning tracks API endpoints"""

from typing import List

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.core.database import get_session
from app.core.auth import get_current_active_user
from app.services.gamification_service import GamificationService
from app.models.models import (
    UserResponse,
    TrackResponse,
    TrackSummaryItem,
    LessonCompletionUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[TrackResponse])
async def list_tracks(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Return learning tracks with progress for current user"""
    service = GamificationService(session)
    return service.get_tracks(current_user.id)


@router.get("/summary", response_model=List[TrackSummaryItem])
async def get_track_summary(
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Return compact track summary (progress percentages)"""
    service = GamificationService(session)
    return service.get_track_summary(current_user.id)


@router.patch("/lessons/{lesson_id}")
async def update_lesson_completion(
    lesson_id: int,
    update: LessonCompletionUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """Mark or unmark a lesson as completed"""
    service = GamificationService(session)
    success = service.update_lesson_completion(
        user_id=current_user.id,
        lesson_id=lesson_id,
        completed=update.completed,
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    return {"success": True}

