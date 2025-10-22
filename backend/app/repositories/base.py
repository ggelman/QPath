from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from app.models.models import (
    User, UserCreate, UserUpdate,
    GamificationProfile, ActivityLog, ActivityType,
    UserProjectSubmission, UserProjectSubmissionCreate, UserProjectSubmissionUpdate
)
from app.core.security import security_service
from app.core.database import get_session
from datetime import datetime, timedelta, timezone, timezone
import logging

logger = logging.getLogger(__name__)


class UserRepository:
    """Repository for user-related database operations"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.session.get(User, user_id)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        # Sanitize input
        email = email.lower().strip()
        statement = select(User).where(User.email == email)
        return self.session.exec(statement).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        # Sanitize input
        username = username.lower().strip()
        statement = select(User).where(User.username == username)
        return self.session.exec(statement).first()
    
    def create(self, user_create: UserCreate) -> User:
        """Create new user"""
        # Hash password
        hashed_password = security_service.get_password_hash(user_create.password)
        
        # Create user instance
        user_data = user_create.model_dump(exclude={"password"})
        user = User(**user_data, hashed_password=hashed_password)
        
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        
        # Create gamification profile
        gamification_profile = GamificationProfile(user_id=user.id)
        self.session.add(gamification_profile)
        self.session.commit()
        
        logger.info(f"Created user: {user.email}")
        return user
    
    def update(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        # Update fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(user)
        
        logger.info(f"Updated user: {user.email}")
        return user
    
    def delete(self, user_id: int) -> bool:
        """Soft delete user (deactivate)"""
        user = self.get_by_id(user_id)
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        
        logger.info(f"Deactivated user: {user.email}")
        return True
    
    def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_by_email(email)
        if not user or not user.is_active:
            return None
        
        if not security_service.verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        self.session.commit()
        
        return user
    
    def update_last_login(self, user_id: int) -> None:
        """Update user's last login timestamp"""
        user = self.get_by_id(user_id)
        if user:
            user.last_login = datetime.now(timezone.utc)
            self.session.commit()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        statement = select(User).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())


class GamificationRepository:
    """Repository for gamification-related database operations"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_profile(self, user_id: int) -> Optional[GamificationProfile]:
        """Get user's gamification profile"""
        statement = select(GamificationProfile).where(GamificationProfile.user_id == user_id)
        return self.session.exec(statement).first()
    
    def add_xp(self, user_id: int, xp_amount: int, activity_type: ActivityType, description: str, metadata: Optional[Dict] = None) -> GamificationProfile:
        """Add XP to user and log activity"""
        profile = self.get_profile(user_id)
        if not profile:
            # Create profile if doesn't exist
            profile = GamificationProfile(user_id=user_id)
            self.session.add(profile)
        
        # Add XP
        profile.total_xp += xp_amount
        profile.last_activity_date = datetime.now(timezone.utc)
        profile.updated_at = datetime.now(timezone.utc)
        
        # Check for level up
        old_level = profile.current_level
        new_level = self._calculate_level(profile.total_xp)
        if new_level != old_level:
            profile.current_level = new_level
            # Log level up activity
            self.log_activity(
                user_id=user_id,
                activity_type=ActivityType.LEVEL_UP,
                description=f"Subiu para o nível {new_level.value}!",
                xp_earned=0,
                metadata={"old_level": old_level.value, "new_level": new_level.value}
            )
        
        # Log the original activity
        self.log_activity(
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            xp_earned=xp_amount,
            metadata=metadata
        )
        
        self.session.commit()
        self.session.refresh(profile)
        
        logger.info(f"Added {xp_amount} XP to user {user_id}. Total: {profile.total_xp}")
        return profile
    
    def update_streak(self, user_id: int) -> GamificationProfile:
        """Update user's daily streak"""
        profile = self.get_profile(user_id)
        if not profile:
            return None
        
        today = datetime.now(timezone.utc).date()
        last_activity = profile.last_activity_date.date() if profile.last_activity_date else None
        
        if last_activity == today:
            # Already updated today
            return profile
        
        if last_activity == today - timedelta(days=1):
            # Consecutive day
            profile.current_streak += 1
        else:
            # Streak broken
            profile.current_streak = 1
        
        # Update longest streak
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak
        
        profile.last_activity_date = datetime.now(timezone.utc)
        profile.updated_at = datetime.now(timezone.utc)
        
        # Log streak achievement for milestones
        if profile.current_streak % 7 == 0:  # Weekly milestones
            self.log_activity(
                user_id=user_id,
                activity_type=ActivityType.STREAK_ACHIEVEMENT,
                description=f"Sequência de {profile.current_streak} dias!",
                xp_earned=profile.current_streak * 5,  # Bonus XP for streaks
                metadata={"streak_days": profile.current_streak}
            )
        
        self.session.commit()
        self.session.refresh(profile)
        
        return profile
    
    def log_activity(self, user_id: int, activity_type: ActivityType, description: str, xp_earned: int = 0, metadata: Optional[Dict] = None) -> ActivityLog:
        """Log user activity"""
        import json
        metadata_str = json.dumps(metadata) if metadata else None
        
        activity = ActivityLog(
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            xp_earned=xp_earned,
            activity_metadata=metadata_str
        )
        
        self.session.add(activity)
        self.session.commit()
        self.session.refresh(activity)
        
        return activity
    
    def get_activity_logs(self, user_id: int, skip: int = 0, limit: int = 50) -> List[ActivityLog]:
        """Get user's activity logs"""
        statement = select(ActivityLog).where(
            ActivityLog.user_id == user_id
        ).order_by(ActivityLog.created_at.desc()).offset(skip).limit(limit)
        
        return list(self.session.exec(statement).all())
    
    def _calculate_level(self, total_xp: int) -> str:
        """Calculate level based on total XP"""
        if total_xp >= 15000:
            return "quantum_guardian"
        elif total_xp >= 7000:
            return "mestre"
        elif total_xp >= 3000:
            return "especialista"
        elif total_xp >= 1000:
            return "explorador"
        else:
            return "iniciante"


class ProjectRepository:
    """Repository for project submission operations"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def create_submission(self, user_id: int, submission_data: UserProjectSubmissionCreate) -> UserProjectSubmission:
        """Create new project submission"""
        submission = UserProjectSubmission(
            user_id=user_id,
            **submission_data.model_dump()
        )
        
        self.session.add(submission)
        self.session.commit()
        self.session.refresh(submission)
        
        logger.info(f"Created project submission: {submission.title} by user {user_id}")
        return submission
    
    def get_user_submissions(self, user_id: int, skip: int = 0, limit: int = 20) -> List[UserProjectSubmission]:
        """Get user's project submissions"""
        statement = select(UserProjectSubmission).where(
            UserProjectSubmission.user_id == user_id
        ).order_by(UserProjectSubmission.created_at.desc()).offset(skip).limit(limit)
        
        return list(self.session.exec(statement).all())
    
    def get_submission_by_id(self, submission_id: int, user_id: Optional[int] = None) -> Optional[UserProjectSubmission]:
        """Get project submission by ID"""
        statement = select(UserProjectSubmission).where(UserProjectSubmission.id == submission_id)
        
        if user_id:
            statement = statement.where(UserProjectSubmission.user_id == user_id)
        
        return self.session.exec(statement).first()
    
    def update_submission(self, submission_id: int, user_id: int, update_data: UserProjectSubmissionUpdate) -> Optional[UserProjectSubmission]:
        """Update project submission"""
        submission = self.get_submission_by_id(submission_id, user_id)
        if not submission:
            return None
        
        # Update fields
        update_fields = update_data.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(submission, field, value)
        
        submission.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(submission)
        
        logger.info(f"Updated project submission: {submission.title}")
        return submission
    
    def get_all_submissions(self, skip: int = 0, limit: int = 50, status_filter: Optional[str] = None) -> List[UserProjectSubmission]:
        """Get all project submissions (for admins/moderators)"""
        statement = select(UserProjectSubmission)
        
        if status_filter:
            statement = statement.where(UserProjectSubmission.status == status_filter)
        
        statement = statement.order_by(UserProjectSubmission.created_at.desc()).offset(skip).limit(limit)
        
        return list(self.session.exec(statement).all())