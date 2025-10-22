from typing import Optional, List, Dict, Any
from sqlmodel import Session, select, delete
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from app.models.models import (
    User, UserCreate, UserUpdate,
    GamificationProfile, ActivityLog, ActivityType,
    UserProjectSubmission, UserProjectSubmissionCreate, UserProjectSubmissionUpdate,
    StudyTask, StudyTaskCreate, StudyTaskUpdate,
    StudySession,
    UserReward, UserRewardCreate, UserRewardUpdate, UserRewardResponse,
    LearningTrack, TrackModule, TrackLesson, UserLessonProgress,
    TrackLessonResponse, TrackModuleResponse, TrackResponse, TrackSummaryItem,
    WeekProgressDay, WeekProgressResponse
)
from app.core.security import security_service
from app.core.database import get_session
from datetime import datetime, timedelta, timezone, date
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


DEFAULT_DASHBOARD_TASKS = [
    {
        "title": "Estudar Cambridge C1 - Writing Module",
        "due_date": "2025-12-15",
        "completed": False,
    },
    {
        "title": "Completar módulo de Vetores - Quantum",
        "due_date": "2025-12-18",
        "completed": False,
    },
    {
        "title": "Revisar conceitos de RSA - Cybersecurity",
        "due_date": "2025-12-20",
        "completed": False,
    },
]


DEFAULT_REWARDS = [
    {
        "condition": "Nível 10",
        "reward": "Comprar um livro novo",
    },
    {
        "condition": "Completar módulo Quantum",
        "reward": "Uma tarde livre de estudos",
    },
]


DEFAULT_TRACKS = [
    {
        "slug": "quantum",
        "name": "Computação Quântica",
        "color": "quantum",
        "description": "Fundamentos para dominar computação quântica",
        "modules": [
            {
                "slug": "q1",
                "title": "Fundamentos Matemáticos",
                "description": "Vetores, Matrizes e Probabilidade para Quantum",
                "order": 1,
                "lessons": [
                    {"slug": "q1l1", "title": "Introdução a Vetores", "order": 1},
                    {"slug": "q1l2", "title": "Operações com Matrizes", "order": 2},
                    {"slug": "q1l3", "title": "Probabilidade Básica", "order": 3},
                ],
            },
        ],
    },
    {
        "slug": "security",
        "name": "Cybersecurity",
        "color": "cyber",
        "description": "Domine os fundamentos de segurança da informação",
        "modules": [
            {
                "slug": "s1",
                "title": "Criptografia Essencial",
                "description": "Fundamentos de Criptografia Simétrica e Assimétrica",
                "order": 1,
                "lessons": [
                    {"slug": "s1l1", "title": "Criptografia Simétrica", "order": 1},
                    {"slug": "s1l2", "title": "Criptografia Assimétrica - RSA", "order": 2},
                ],
            },
        ],
    },
    {
        "slug": "english",
        "name": "Inglês C1",
        "color": "gold",
        "description": "Preparação avançada para certificações Cambridge",
        "modules": [
            {
                "slug": "e1",
                "title": "Writing - Essay Structure",
                "description": "Como estruturar redações para o exame Cambridge C1",
                "order": 1,
                "lessons": [
                    {"slug": "e1l1", "title": "Estrutura básica de Essay", "order": 1},
                    {"slug": "e1l2", "title": "Argumentação e Desenvolvimento", "order": 2},
                    {"slug": "e1l3", "title": "Conclusões efetivas", "order": 3},
                    {"slug": "e1l4", "title": "Prática: Essay completo", "order": 4},
                ],
            },
        ],
    },
    {
        "slug": "software",
        "name": "Software Development",
        "color": "software",
        "description": "Construa bases sólidas em engenharia de software",
        "modules": [
            {
                "slug": "sw1",
                "title": "Arquitetura de Software",
                "description": "Padrões de design e boas práticas",
                "order": 1,
                "lessons": [
                    {"slug": "sw1l1", "title": "SOLID Principles", "order": 1},
                    {"slug": "sw1l2", "title": "Design Patterns", "order": 2},
                ],
            },
        ],
    },
]


class StudyTaskRepository:
    """Repository for dashboard study tasks"""

    def __init__(self, session: Session):
        self.session = session

    def get_tasks(self, user_id: int, ensure_defaults: bool = True) -> List[StudyTask]:
        statement = select(StudyTask).where(StudyTask.user_id == user_id).order_by(
            StudyTask.due_date, StudyTask.created_at
        )
        tasks = list(self.session.exec(statement).all())

        if ensure_defaults and not tasks:
            tasks = self._create_default_tasks(user_id)

        return tasks

    def _create_default_tasks(self, user_id: int) -> List[StudyTask]:
        tasks: List[StudyTask] = []
        for template in DEFAULT_DASHBOARD_TASKS:
            task = StudyTask(
                user_id=user_id,
                title=template["title"],
                due_date=template.get("due_date"),
                completed=template.get("completed", False),
            )
            self.session.add(task)
            tasks.append(task)

        self.session.commit()
        for task in tasks:
            self.session.refresh(task)

        return tasks

    def replace_tasks(self, user_id: int, tasks_payload: List[Dict[str, Any]]) -> List[StudyTask]:
        """Replace user's tasks with provided payload (used for migration)"""
        self.session.exec(delete(StudyTask).where(StudyTask.user_id == user_id))
        self.session.commit()

        new_tasks: List[StudyTask] = []
        for payload in tasks_payload:
            title = str(payload.get("title", "")).strip()
            if not title:
                continue

            task = StudyTask(
                user_id=user_id,
                title=title,
                due_date=payload.get("due_date"),
                completed=bool(payload.get("completed")),
            )
            self.session.add(task)
            new_tasks.append(task)

        self.session.commit()
        for task in new_tasks:
            self.session.refresh(task)

        return new_tasks

    def update_task_completion(self, user_id: int, task_id: int, completed: bool) -> Optional[StudyTask]:
        task = self.session.get(StudyTask, task_id)
        if not task or task.user_id != user_id:
            return None

        task.completed = completed
        task.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(task)

        return task


class StudySessionRepository:
    """Repository for tracking study sessions and weekly summaries"""

    def __init__(self, session: Session):
        self.session = session

    def log_session(self, user_id: int, duration_minutes: int) -> StudySession:
        session_entry = StudySession(
            user_id=user_id,
            duration_minutes=duration_minutes,
            session_date=datetime.utcnow(),
        )

        self.session.add(session_entry)
        self.session.commit()
        self.session.refresh(session_entry)

        return session_entry

    def get_weekly_progress(self, user_id: int, reference_date: Optional[date] = None) -> WeekProgressResponse:
        reference = reference_date or datetime.utcnow().date()
        start_of_week = reference - timedelta(days=reference.weekday())
        end_of_week = start_of_week + timedelta(days=7)

        week_start_dt = datetime.combine(start_of_week, datetime.min.time())
        week_end_dt = datetime.combine(end_of_week, datetime.min.time())

        statement = select(StudySession).where(
            StudySession.user_id == user_id,
            StudySession.session_date >= week_start_dt,
            StudySession.session_date < week_end_dt,
        )

        sessions = list(self.session.exec(statement).all())

        hours_per_day = {i: 0.0 for i in range(7)}
        for session_entry in sessions:
            day_index = session_entry.session_date.weekday()
            hours_per_day[day_index] += session_entry.duration_minutes / 60.0

        day_labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
        week = [
            WeekProgressDay(day=day_labels[idx], hours=round(hours_per_day[idx], 2))
            for idx in range(7)
        ]

        total_hours = round(sum(hours_per_day.values()), 2)
        streak = self._calculate_streak(user_id, reference)

        return WeekProgressResponse(streak=streak, total_hours=total_hours, week=week)

    def _calculate_streak(self, user_id: int, reference_date: date) -> int:
        lookback_start = datetime.combine(reference_date - timedelta(days=30), datetime.min.time())
        statement = select(StudySession).where(
            StudySession.user_id == user_id,
            StudySession.session_date >= lookback_start,
        )
        sessions = list(self.session.exec(statement).all())
        session_days = {session_entry.session_date.date() for session_entry in sessions}

        streak = 0
        current_day = reference_date
        while current_day in session_days:
            streak += 1
            current_day -= timedelta(days=1)

        return streak

    def get_total_hours(self, user_id: int) -> float:
        statement = select(func.sum(StudySession.duration_minutes)).where(StudySession.user_id == user_id)
        total_minutes = self.session.exec(statement).one_or_none()
        if not total_minutes or total_minutes[0] is None:
            return 0.0
        return round(total_minutes[0] / 60.0, 2)


class UserRewardRepository:
    """Repository for user-defined rewards"""

    def __init__(self, session: Session):
        self.session = session

    def get_rewards(self, user_id: int, ensure_defaults: bool = True) -> List[UserReward]:
        statement = select(UserReward).where(UserReward.user_id == user_id).order_by(UserReward.created_at)
        rewards = list(self.session.exec(statement).all())

        if ensure_defaults and not rewards:
            rewards = self._create_default_rewards(user_id)

        return rewards

    def _create_default_rewards(self, user_id: int) -> List[UserReward]:
        rewards: List[UserReward] = []
        for template in DEFAULT_REWARDS:
            reward = UserReward(
                user_id=user_id,
                condition=template["condition"],
                reward=template["reward"],
            )
            self.session.add(reward)
            rewards.append(reward)

        self.session.commit()
        for reward in rewards:
            self.session.refresh(reward)

        return rewards

    def create_reward(self, user_id: int, reward_data: UserRewardCreate) -> UserReward:
        reward = UserReward(
            user_id=user_id,
            condition=reward_data.condition.strip(),
            reward=reward_data.reward.strip(),
        )

        self.session.add(reward)
        self.session.commit()
        self.session.refresh(reward)

        return reward

    def update_reward(self, user_id: int, reward_id: int, update_data: UserRewardUpdate) -> Optional[UserReward]:
        reward = self.session.get(UserReward, reward_id)
        if not reward or reward.user_id != user_id:
            return None

        update_fields = update_data.model_dump(exclude_unset=True)
        for field, value in update_fields.items():
            setattr(reward, field, value)

        if update_fields.get("achieved"):
            reward.achieved_at = datetime.utcnow()
        elif "achieved" in update_fields and not update_fields["achieved"]:
            reward.achieved_at = None

        reward.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(reward)

        return reward


class TrackRepository:
    """Repository for learning tracks and progress"""

    def __init__(self, session: Session):
        self.session = session

    def ensure_defaults(self) -> None:
        for track_data in DEFAULT_TRACKS:
            track = self.session.exec(
                select(LearningTrack).where(LearningTrack.slug == track_data["slug"])
            ).first()

            if not track:
                track = LearningTrack(
                    slug=track_data["slug"],
                    name=track_data["name"],
                    description=track_data.get("description"),
                    color=track_data.get("color", "quantum"),
                )
                self.session.add(track)
                self.session.commit()
                self.session.refresh(track)

            for module_data in track_data.get("modules", []):
                module = self.session.exec(
                    select(TrackModule).where(TrackModule.slug == module_data["slug"])
                ).first()

                if not module:
                    module = TrackModule(
                        track_id=track.id,
                        slug=module_data["slug"],
                        title=module_data["title"],
                        description=module_data.get("description"),
                        order=module_data.get("order", 0),
                    )
                    self.session.add(module)
                    self.session.commit()
                    self.session.refresh(module)

                for lesson_data in module_data.get("lessons", []):
                    lesson = self.session.exec(
                        select(TrackLesson).where(TrackLesson.slug == lesson_data["slug"])
                    ).first()

                    if not lesson:
                        lesson = TrackLesson(
                            module_id=module.id,
                            slug=lesson_data["slug"],
                            title=lesson_data["title"],
                            order=lesson_data.get("order", 0),
                        )
                        self.session.add(lesson)
                        self.session.commit()

    def get_tracks_with_progress(self, user_id: int) -> List[TrackResponse]:
        self.ensure_defaults()

        tracks = list(
            self.session.exec(
                select(LearningTrack)
                .options(selectinload(LearningTrack.modules).selectinload(TrackModule.lessons))
                .order_by(LearningTrack.id)
            ).unique().all()
        )

        progress_entries = list(
            self.session.exec(
                select(UserLessonProgress).where(UserLessonProgress.user_id == user_id)
            ).all()
        )
        progress_map = {entry.lesson_id: entry for entry in progress_entries}

        track_responses: List[TrackResponse] = []
        for track in tracks:
            total_lessons = 0
            completed_lessons = 0
            module_responses: List[TrackModuleResponse] = []

            modules_sorted = sorted(track.modules, key=lambda m: m.order)
            for module in modules_sorted:
                lessons_sorted = sorted(module.lessons, key=lambda l: l.order)
                lesson_responses: List[TrackLessonResponse] = []
                module_completed = 0

                for lesson in lessons_sorted:
                    completed = progress_map.get(lesson.id).completed if progress_map.get(lesson.id) else False
                    if completed:
                        completed_lessons += 1
                        module_completed += 1

                    total_lessons += 1
                    lesson_responses.append(
                        TrackLessonResponse(
                            id=lesson.id,
                            slug=lesson.slug,
                            title=lesson.title,
                            order=lesson.order,
                            completed=completed,
                        )
                    )

                module_progress = (module_completed / len(lessons_sorted) * 100) if lessons_sorted else 0.0
                module_responses.append(
                    TrackModuleResponse(
                        id=module.id,
                        slug=module.slug,
                        title=module.title,
                        description=module.description,
                        order=module.order,
                        progress=round(module_progress, 2),
                        lessons=lesson_responses,
                    )
                )

            track_progress = (completed_lessons / total_lessons * 100) if total_lessons else 0.0
            track_responses.append(
                TrackResponse(
                    id=track.id,
                    slug=track.slug,
                    name=track.name,
                    description=track.description,
                    color=track.color,
                    progress=round(track_progress, 2),
                    modules=module_responses,
                )
            )

        return track_responses

    def get_track_summary(self, user_id: int) -> List[TrackSummaryItem]:
        tracks = self.get_tracks_with_progress(user_id)
        return [
            TrackSummaryItem(
                track_id=track.id,
                slug=track.slug,
                name=track.name,
                color=track.color,
                progress=track.progress,
            )
            for track in tracks
        ]

    def set_lesson_completion(self, user_id: int, lesson_id: int, completed: bool) -> Optional[UserLessonProgress]:
        lesson = self.session.get(TrackLesson, lesson_id)
        if not lesson:
            return None

        progress = self.session.exec(
            select(UserLessonProgress).where(
                UserLessonProgress.user_id == user_id,
                UserLessonProgress.lesson_id == lesson_id,
            )
        ).first()

        if not progress:
            progress = UserLessonProgress(user_id=user_id, lesson_id=lesson_id)
            self.session.add(progress)

        progress.completed = completed
        progress.completed_at = datetime.utcnow() if completed else None
        self.session.commit()
        self.session.refresh(progress)

        return progress

    def get_completed_module_slugs(self, user_id: int) -> List[str]:
        self.ensure_defaults()

        progress_entries = list(
            self.session.exec(
                select(UserLessonProgress).where(
                    UserLessonProgress.user_id == user_id,
                    UserLessonProgress.completed.is_(True),
                )
            ).all()
        )

        completed_lessons = {entry.lesson_id for entry in progress_entries}
        modules = list(
            self.session.exec(
                select(TrackModule).options(selectinload(TrackModule.lessons))
            ).all()
        )

        completed_modules: List[str] = []
        for module in modules:
            lessons = module.lessons
            if lessons and all(lesson.id in completed_lessons for lesson in lessons):
                completed_modules.append(module.slug)

        return completed_modules


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