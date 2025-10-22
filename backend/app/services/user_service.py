from typing import Optional, List
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.repositories.base import UserRepository, GamificationRepository, ProjectRepository
from app.models.models import (
    User, UserCreate, UserUpdate, UserResponse,
    ActivityType,
    UserProjectSubmission, UserProjectSubmissionCreate,
    UserProjectSubmissionUpdate, UserProjectSubmissionResponse
)
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


class UserService:
    """Service layer for user operations"""
    
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session
        self.user_repo = UserRepository(session)
        self.gamification_repo = GamificationRepository(session)
    
    def create_user(self, user_create: UserCreate) -> UserResponse:
        """Create new user with gamification profile"""
        # Check if user already exists
        if self.user_repo.get_by_email(user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        if self.user_repo.get_by_username(user_create.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create user
        user = self.user_repo.create(user_create)
        
        # Log registration activity
        self.gamification_repo.log_activity(
            user_id=user.id,
            activity_type=ActivityType.LOGIN,
            description="Bem-vindo ao Q-Path! Conta criada com sucesso.",
            xp_earned=50,
            metadata={"registration": True}
        )
        
        # Add welcome XP
        self.gamification_repo.add_xp(
            user_id=user.id,
            xp_amount=50,
            activity_type=ActivityType.LOGIN,
            description="Bônus de boas-vindas!",
            metadata={"welcome_bonus": True}
        )
        
        return UserResponse.model_validate(user)
    
    def get_user(self, user_id: int) -> Optional[UserResponse]:
        """Get user by ID"""
        user = self.user_repo.get_by_id(user_id)
        if not user:
            return None
        
        return UserResponse.model_validate(user)
    
    def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        """Get user by email"""
        user = self.user_repo.get_by_email(email)
        if not user:
            return None
        
        return UserResponse.model_validate(user)
    
    def update_user(self, user_id: int, user_update: UserUpdate, current_user_id: int) -> UserResponse:
        """Update user (only by themselves or admin)"""
        # Check authorization
        if user_id != current_user_id:
            current_user = self.user_repo.get_by_id(current_user_id)
            if not current_user or current_user.role != "admin":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to update this user"
                )
        
        user = self.user_repo.update(user_id, user_update)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse.model_validate(user)
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        user = self.user_repo.authenticate(email, password)
        if user:
            # Update streak and log login
            self.gamification_repo.update_streak(user.id)
            self.gamification_repo.log_activity(
                user_id=user.id,
                activity_type=ActivityType.LOGIN,
                description="Login realizado",
                xp_earned=5,
                metadata={"login_time": datetime.now(timezone.utc).isoformat()}
            )
        
        return user
    
    def get_users(self, skip: int = 0, limit: int = 100) -> List[UserResponse]:
        """Get all users (admin only)"""
        users = self.user_repo.get_all(skip=skip, limit=limit)
        return [UserResponse.model_validate(user) for user in users]


class ProjectService:
    """Service layer for project operations"""
    
    def __init__(self, session: Session = Depends(get_session)):
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.gamification_repo = GamificationRepository(session)
    
    def create_submission(self, user_id: int, submission_data: UserProjectSubmissionCreate) -> UserProjectSubmissionResponse:
        """Create new project submission"""
        submission = self.project_repo.create_submission(user_id, submission_data)
        
        # Award XP for submission
        self.gamification_repo.add_xp(
            user_id=user_id,
            xp_amount=150,
            activity_type=ActivityType.PROJETO_SUBMISSION,
            description=f"Projeto '{submission.title}' submetido!",
            metadata={
                "project_title": submission.title,
                "project_type": submission.project_type,
                "submission_id": submission.id
            }
        )
        
        return UserProjectSubmissionResponse.model_validate(submission)
    
    def get_user_submissions(self, user_id: int, skip: int = 0, limit: int = 20) -> List[UserProjectSubmissionResponse]:
        """Get user's project submissions"""
        submissions = self.project_repo.get_user_submissions(user_id, skip=skip, limit=limit)
        return [UserProjectSubmissionResponse.model_validate(sub) for sub in submissions]
    
    def get_submission(self, submission_id: int, user_id: Optional[int] = None) -> Optional[UserProjectSubmissionResponse]:
        """Get project submission by ID"""
        submission = self.project_repo.get_submission_by_id(submission_id, user_id)
        if not submission:
            return None
        
        return UserProjectSubmissionResponse.model_validate(submission)
    
    def update_submission(self, submission_id: int, user_id: int, update_data: UserProjectSubmissionUpdate) -> UserProjectSubmissionResponse:
        """Update project submission"""
        submission = self.project_repo.update_submission(submission_id, user_id, update_data)
        if not submission:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project submission not found"
            )
        
        return UserProjectSubmissionResponse.model_validate(submission)
    
    def get_all_submissions(self, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None) -> List[UserProjectSubmissionResponse]:
        """Get all project submissions (admin/moderator only)"""
        submissions = self.project_repo.get_all_submissions(skip=skip, limit=limit, status_filter=status_filter)
        return [UserProjectSubmissionResponse.model_validate(sub) for sub in submissions]