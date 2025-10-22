from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint
from pydantic import field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid

# Constants
USERS_TABLE_REF = "users.id"


class UserRole(str, Enum):
    """User roles for authorization"""
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"


class GamificationLevel(str, Enum):
    """Gamification levels based on XP"""
    INICIANTE = "iniciante"          # 0-999 XP
    EXPLORADOR = "explorador"        # 1000-2999 XP
    ESPECIALISTA = "especialista"    # 3000-6999 XP
    MESTRE = "mestre"               # 7000-14999 XP
    QUANTUM_GUARDIAN = "quantum_guardian"  # 15000+ XP


class ActivityType(str, Enum):
    """Types of activities that can be logged"""
    LOGIN = "login"
    TRILHA_COMPLETION = "trilha_completion"
    PROJETO_SUBMISSION = "projeto_submission"
    QMENTOR_INTERACTION = "qmentor_interaction"
    POMODORO_SESSION = "pomodoro_session"
    STREAK_ACHIEVEMENT = "streak_achievement"
    LEVEL_UP = "level_up"


class ProjectType(str, Enum):
    """Types of projects in Hub de Projetos"""
    RESEARCH = "research"
    STARTUP = "startup"


class ProjectStatus(str, Enum):
    """Status of user project submissions"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


# Base model with common fields
class BaseModel(SQLModel):
    """Base model with common fields for all tables"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# User models
class UserBase(SQLModel):
    """Base user model with common fields"""
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(max_length=255)
    username: str = Field(unique=True, index=True, max_length=50)
    role: UserRole = Field(default=UserRole.USER)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)


class User(UserBase, BaseModel, table=True):
    """User table model"""
    __tablename__ = "users"
    
    hashed_password: str = Field(max_length=255)
    last_login: Optional[datetime] = None
    password_reset_token: Optional[str] = None
    verification_token: Optional[str] = None
    
    # Relationships
    gamification_profile: Optional["GamificationProfile"] = Relationship(back_populates="user")
    activity_logs: List["ActivityLog"] = Relationship(back_populates="user")
    project_submissions: List["UserProjectSubmission"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"foreign_keys": "UserProjectSubmission.user_id"},
    )


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(min_length=8, max_length=100, description="Password must be at least 8 characters")
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format"""
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower().strip()
    
    @field_validator('username')
    @classmethod 
    def validate_username(cls, v: str) -> str:
        """Validate username format"""
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores and hyphens')
        return v.lower().strip()


class UserUpdate(SQLModel):
    """User update schema"""
    email: Optional[str] = None
    full_name: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema (excludes sensitive data)"""
    id: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


# Gamification models
class GamificationProfileBase(SQLModel):
    """Base gamification profile model"""
    user_id: int = Field(foreign_key=USERS_TABLE_REF, unique=True)
    total_xp: int = Field(default=0)
    current_level: GamificationLevel = Field(default=GamificationLevel.INICIANTE)
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    completed_trilhas: int = Field(default=0)
    completed_projects: int = Field(default=0)
    pomodoro_sessions: int = Field(default=0)
    last_activity_date: Optional[datetime] = None


class GamificationProfile(GamificationProfileBase, BaseModel, table=True):
    """Gamification profile table model"""
    __tablename__ = "gamification_profiles"
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="gamification_profile")


class GamificationProfileResponse(GamificationProfileBase):
    """Gamification profile response schema"""
    id: int
    created_at: datetime
    updated_at: datetime


# Activity Log models
class ActivityLogBase(SQLModel):
    """Base activity log model"""
    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    activity_type: ActivityType
    description: str = Field(max_length=500)
    xp_earned: int = Field(default=0)
    activity_metadata: Optional[str] = Field(default=None)


class ActivityLog(ActivityLogBase, BaseModel, table=True):
    """Activity log table model"""
    __tablename__ = "activity_logs"
    
    # Relationships
    user: Optional[User] = Relationship(back_populates="activity_logs")


class ActivityLogResponse(ActivityLogBase):
    """Activity log response schema"""
    id: int
    created_at: datetime


# Project Submission models
class UserProjectSubmissionBase(SQLModel):
    """Base user project submission model"""
    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    project_type: ProjectType
    title: str = Field(max_length=255)
    description: str = Field(max_length=2000)
    github_url: Optional[str] = Field(max_length=500)
    demo_url: Optional[str] = Field(max_length=500)
    status: ProjectStatus = Field(default=ProjectStatus.DRAFT)
    submission_notes: Optional[str] = Field(max_length=1000)
    reviewer_feedback: Optional[str] = Field(max_length=1000)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = Field(foreign_key=USERS_TABLE_REF)


class UserProjectSubmission(UserProjectSubmissionBase, BaseModel, table=True):
    """User project submission table model"""
    __tablename__ = "user_project_submissions"

    # Relationships
    user: Optional[User] = Relationship(
        back_populates="project_submissions",
        sa_relationship_kwargs={"foreign_keys": "UserProjectSubmission.user_id"},
    )


class UserProjectSubmissionCreate(SQLModel):
    """Project submission creation schema"""
    project_type: ProjectType
    title: str = Field(max_length=255)
    description: str = Field(max_length=2000)
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    submission_notes: Optional[str] = None


class UserProjectSubmissionUpdate(SQLModel):
    """Project submission update schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    status: Optional[ProjectStatus] = None
    submission_notes: Optional[str] = None
    reviewer_feedback: Optional[str] = None


class UserProjectSubmissionResponse(UserProjectSubmissionBase):
    """Project submission response schema"""
    id: int
    created_at: datetime
    updated_at: datetime


# Study task models for dashboard planning
class StudyTaskBase(SQLModel):
    """Base study task model"""
    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    title: str = Field(max_length=255)
    due_date: Optional[str] = Field(default=None, max_length=50)
    completed: bool = Field(default=False)


class StudyTask(StudyTaskBase, BaseModel, table=True):
    """Study task table"""
    __tablename__ = "study_tasks"


class StudyTaskCreate(SQLModel):
    """Study task creation schema"""
    title: str
    due_date: Optional[str] = None
    completed: bool = False


class StudyTaskUpdate(SQLModel):
    """Study task update schema"""
    title: Optional[str] = None
    due_date: Optional[str] = None
    completed: Optional[bool] = None


class StudyTaskResponse(StudyTaskBase):
    """Study task response schema"""
    id: int
    created_at: datetime
    updated_at: datetime


class StudyTaskCompletionUpdate(SQLModel):
    """Payload for toggling task completion"""
    completed: bool


class StudySession(BaseModel, table=True):
    """Study session (Pomodoro) tracking table"""
    __tablename__ = "study_sessions"

    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    duration_minutes: int = Field(ge=1, le=240)
    session_date: datetime = Field(default_factory=datetime.utcnow)


# Custom reward models
class UserRewardBase(SQLModel):
    """Base reward model"""
    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    condition: str = Field(max_length=255)
    reward: str = Field(max_length=255)
    achieved: bool = Field(default=False)
    achieved_at: Optional[datetime] = None


class UserReward(UserRewardBase, BaseModel, table=True):
    """User-defined reward table"""
    __tablename__ = "user_rewards"


class UserRewardCreate(SQLModel):
    """Reward creation schema"""
    condition: str
    reward: str


class UserRewardUpdate(SQLModel):
    """Reward update schema"""
    condition: Optional[str] = None
    reward: Optional[str] = None
    achieved: Optional[bool] = None


class UserRewardResponse(UserRewardBase):
    """Reward response schema"""
    id: int
    created_at: datetime
    updated_at: datetime


# Learning track models
class LearningTrackBase(SQLModel):
    """Base learning track model"""
    slug: str = Field(unique=True, index=True, max_length=100)
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    color: str = Field(default="quantum", max_length=50)


class LearningTrack(LearningTrackBase, BaseModel, table=True):
    """Learning track table"""
    __tablename__ = "learning_tracks"

    modules: List["TrackModule"] = Relationship(back_populates="track")


class TrackModuleBase(SQLModel):
    """Base track module model"""
    track_id: int = Field(foreign_key="learning_tracks.id")
    slug: str = Field(unique=True, index=True, max_length=100)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    order: int = Field(default=0)


class TrackModule(TrackModuleBase, BaseModel, table=True):
    """Track module table"""
    __tablename__ = "track_modules"

    track: Optional[LearningTrack] = Relationship(back_populates="modules")
    lessons: List["TrackLesson"] = Relationship(back_populates="module")


class TrackLessonBase(SQLModel):
    """Base track lesson model"""
    module_id: int = Field(foreign_key="track_modules.id")
    slug: str = Field(unique=True, index=True, max_length=100)
    title: str = Field(max_length=255)
    order: int = Field(default=0)


class TrackLesson(TrackLessonBase, BaseModel, table=True):
    """Track lesson table"""
    __tablename__ = "track_lessons"

    module: Optional[TrackModule] = Relationship(back_populates="lessons")
    user_progresses: List["UserLessonProgress"] = Relationship(back_populates="lesson")


class UserLessonProgress(SQLModel, table=True):
    """User lesson completion tracking"""
    __tablename__ = "user_lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key=USERS_TABLE_REF)
    lesson_id: int = Field(foreign_key="track_lessons.id")
    completed: bool = Field(default=False)
    completed_at: Optional[datetime] = None

    lesson: Optional[TrackLesson] = Relationship(back_populates="user_progresses")


class LessonCompletionUpdate(SQLModel):
    """Payload for marking lesson completion"""
    completed: bool


class TrackLessonResponse(SQLModel):
    """Lesson response with completion"""
    id: int
    slug: str
    title: str
    order: int
    completed: bool


class TrackModuleResponse(SQLModel):
    """Module response"""
    id: int
    slug: str
    title: str
    description: Optional[str]
    order: int
    progress: float
    lessons: List[TrackLessonResponse]


class TrackResponse(SQLModel):
    """Track response"""
    id: int
    slug: str
    name: str
    description: Optional[str]
    color: str
    progress: float
    modules: List[TrackModuleResponse]


class TrackSummaryItem(SQLModel):
    """Track summary data for dashboard"""
    track_id: int
    slug: str
    name: str
    color: str
    progress: float


class WeekProgressDay(SQLModel):
    """Week progress entry"""
    day: str
    hours: float


class WeekProgressResponse(SQLModel):
    """Weekly progress response"""
    streak: int
    total_hours: float
    week: List[WeekProgressDay]


# Aggregated responses for frontend views
class AchievementResponse(SQLModel):
    """Achievement data"""
    id: str
    name: str
    description: str
    unlocked: bool


class ProfileStatsResponse(SQLModel):
    """Additional stats for profile view"""
    total_xp: int
    current_level: GamificationLevel
    total_hours: float
    completed_lessons: int
    total_lessons: int
    pomodoro_sessions: int


class DashboardResponse(SQLModel):
    """Dashboard aggregated data"""
    tasks: List[StudyTaskResponse]
    week_progress: WeekProgressResponse
    track_summary: List[TrackSummaryItem]


class ProfileDetailsResponse(SQLModel):
    """Detailed profile response with achievements"""
    profile: GamificationProfileResponse
    achievements: List[AchievementResponse]
    rewards: List[UserRewardResponse]
    stats: ProfileStatsResponse
    week_progress: WeekProgressResponse
    tracks: List[TrackResponse]


# Token models for authentication
class Token(SQLModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(SQLModel):
    """Token refresh request model"""
    refresh_token: str


class LoginRequest(SQLModel):
    """Login request model"""
    email: str
    password: str


# Password reset models
class PasswordResetRequest(SQLModel):
    """Password reset request model"""
    email: str


class PasswordReset(SQLModel):
    """Password reset model"""
    token: str
    new_password: str = Field(min_length=8, max_length=100)