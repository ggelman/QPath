"""Gamification service layer"""

from __future__ import annotations

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.models import (
    GamificationProfileResponse,
    ActivityLogResponse,
    ActivityType,
    StudyTaskResponse,
    UserRewardCreate,
    UserRewardUpdate,
    UserRewardResponse,
    TrackResponse,
    TrackSummaryItem,
    WeekProgressResponse,
    DashboardResponse,
    ProfileDetailsResponse,
    ProfileStatsResponse,
    AchievementResponse,
    User,
    GamificationProfile,
)
from app.repositories.base import (
    GamificationRepository,
    StudyTaskRepository,
    StudySessionRepository,
    UserRewardRepository,
    TrackRepository,
)

import logging

logger = logging.getLogger(__name__)


class GamificationService:
    """Service layer for gamification operations"""

    def __init__(self, session: Session = Depends(get_session)):
        self.session = session
        self.gamification_repo = GamificationRepository(session)
        self.task_repo = StudyTaskRepository(session)
        self.session_repo = StudySessionRepository(session)
        self.reward_repo = UserRewardRepository(session)
        self.track_repo = TrackRepository(session)

    # Core profile operations -------------------------------------------------
    def get_user_profile(self, user_id: int) -> Optional[GamificationProfileResponse]:
        profile = self.gamification_repo.get_profile(user_id)
        if not profile:
            return None

        return GamificationProfileResponse.model_validate(profile)

    def add_xp(
        self,
        user_id: int,
        xp_amount: int,
        activity_type: ActivityType,
        description: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> GamificationProfileResponse:
        profile = self.gamification_repo.add_xp(
            user_id=user_id,
            xp_amount=xp_amount,
            activity_type=activity_type,
            description=description,
            metadata=metadata,
        )

        return GamificationProfileResponse.model_validate(profile)

    def complete_trilha(
        self, user_id: int, trilha_name: str, xp_earned: int = 100
    ) -> GamificationProfileResponse:
        profile = self.gamification_repo.get_profile(user_id)
        if profile:
            profile.completed_trilhas += 1
            profile.updated_at = datetime.now(timezone.utc)
            self.session.commit()

        updated_profile = self.gamification_repo.add_xp(
            user_id=user_id,
            xp_amount=xp_earned,
            activity_type=ActivityType.TRILHA_COMPLETION,
            description=f"Trilha '{trilha_name}' completada!",
            metadata={"trilha_name": trilha_name, "xp_earned": xp_earned},
        )

        return GamificationProfileResponse.model_validate(updated_profile)

    def log_pomodoro_session(
        self, user_id: int, duration_minutes: int
    ) -> GamificationProfileResponse:
        # Persist study session for progress analytics
        self.session_repo.log_session(user_id=user_id, duration_minutes=duration_minutes)

        xp_amount = min(duration_minutes, 60)
        profile = self.gamification_repo.get_profile(user_id)
        if profile:
            profile.pomodoro_sessions += 1
            profile.updated_at = datetime.now(timezone.utc)
            self.session.commit()

        updated_profile = self.gamification_repo.add_xp(
            user_id=user_id,
            xp_amount=xp_amount,
            activity_type=ActivityType.POMODORO_SESSION,
            description=f"Sessão Pomodoro de {duration_minutes} minutos concluída!",
            metadata={"duration_minutes": duration_minutes, "xp_earned": xp_amount},
        )

        return GamificationProfileResponse.model_validate(updated_profile)

    def get_activity_logs(
        self, user_id: int, skip: int = 0, limit: int = 50
    ) -> List[ActivityLogResponse]:
        activities = self.gamification_repo.get_activity_logs(
            user_id, skip=skip, limit=limit
        )
        return [ActivityLogResponse.model_validate(activity) for activity in activities]

    def get_leaderboard(self, limit: int = 10) -> List[Dict[str, Any]]:
        try:
            statement = (
                select(GamificationProfile)
                .order_by(GamificationProfile.total_xp.desc())
                .limit(limit)
            )
            profiles = list(self.session.exec(statement).all())

            leaderboard: List[Dict[str, Any]] = []
            for rank, profile in enumerate(profiles, 1):
                user = self.session.get(User, profile.user_id)
                leaderboard.append(
                    {
                        "rank": rank,
                        "username": user.username if user else "Unknown",
                        "total_xp": profile.total_xp,
                        "level": profile.current_level,
                        "completed_trilhas": profile.completed_trilhas,
                    }
                )

            return leaderboard
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.error("Error getting leaderboard: %s", str(exc))
            return []

    # Dashboard ----------------------------------------------------------------
    def get_dashboard_data(self, user_id: int) -> DashboardResponse:
        tasks = [
            StudyTaskResponse.model_validate(task) for task in self.task_repo.get_tasks(user_id)
        ]
        week_progress = self.session_repo.get_weekly_progress(user_id)
        track_summary = self.track_repo.get_track_summary(user_id)

        return DashboardResponse(
            tasks=tasks,
            week_progress=week_progress,
            track_summary=track_summary,
        )

    def replace_tasks(self, user_id: int, tasks_payload: List[Dict[str, Any]]) -> List[StudyTaskResponse]:
        tasks = self.task_repo.replace_tasks(user_id, tasks_payload)
        return [StudyTaskResponse.model_validate(task) for task in tasks]

    def update_task_completion(
        self, user_id: int, task_id: int, completed: bool
    ) -> Optional[StudyTaskResponse]:
        task = self.task_repo.update_task_completion(user_id, task_id, completed)
        if not task:
            return None
        return StudyTaskResponse.model_validate(task)

    # Rewards ------------------------------------------------------------------
    def get_rewards(self, user_id: int) -> List[UserRewardResponse]:
        rewards = self.reward_repo.get_rewards(user_id)
        return [UserRewardResponse.model_validate(reward) for reward in rewards]

    def create_reward(self, user_id: int, data: UserRewardCreate) -> UserRewardResponse:
        reward = self.reward_repo.create_reward(user_id, data)
        return UserRewardResponse.model_validate(reward)

    def update_reward(
        self, user_id: int, reward_id: int, data: UserRewardUpdate
    ) -> Optional[UserRewardResponse]:
        reward = self.reward_repo.update_reward(user_id, reward_id, data)
        if not reward:
            return None
        return UserRewardResponse.model_validate(reward)

    # Tracks -------------------------------------------------------------------
    def get_tracks(self, user_id: int) -> List[TrackResponse]:
        return self.track_repo.get_tracks_with_progress(user_id)

    def get_track_summary(self, user_id: int) -> List[TrackSummaryItem]:
        return self.track_repo.get_track_summary(user_id)

    def update_lesson_completion(
        self, user_id: int, lesson_id: int, completed: bool
    ) -> bool:
        progress = self.track_repo.set_lesson_completion(user_id, lesson_id, completed)
        return progress is not None

    # Profile details ----------------------------------------------------------
    def get_profile_details(self, user_id: int) -> ProfileDetailsResponse:
        profile = self.get_user_profile(user_id)
        if not profile:
            raise ValueError("Gamification profile not found")

        rewards = self.get_rewards(user_id)
        tracks = self.get_tracks(user_id)
        week_progress = self.session_repo.get_weekly_progress(user_id)
        total_hours = self.session_repo.get_total_hours(user_id)

        completed_lessons = sum(
            1 for track in tracks for module in track.modules for lesson in module.lessons if lesson.completed
        )
        total_lessons = sum(
            1 for track in tracks for module in track.modules for _ in module.lessons
        )

        completed_modules = set(self.track_repo.get_completed_module_slugs(user_id))

        achievements = self._build_achievements(
            profile=profile,
            total_hours=total_hours,
            streak=week_progress.streak,
            completed_modules=completed_modules,
            completed_lessons=completed_lessons,
        )

        stats = ProfileStatsResponse(
            total_xp=profile.total_xp,
            current_level=profile.current_level,
            total_hours=total_hours,
            completed_lessons=completed_lessons,
            total_lessons=total_lessons,
            pomodoro_sessions=profile.pomodoro_sessions,
        )

        return ProfileDetailsResponse(
            profile=profile,
            achievements=achievements,
            rewards=rewards,
            stats=stats,
            week_progress=week_progress,
            tracks=tracks,
        )

    # Helpers ------------------------------------------------------------------
    def _build_achievements(
        self,
        profile: GamificationProfileResponse,
        total_hours: float,
        streak: int,
        completed_modules: set[str],
        completed_lessons: int,
    ) -> List[AchievementResponse]:
        achievements = [
            AchievementResponse(
                id="first_pomodoro",
                name="Primeiro Circuito Quântico",
                description="Complete sua primeira sessão de foco registrada.",
                unlocked=profile.pomodoro_sessions > 0 or total_hours > 0,
            ),
            AchievementResponse(
                id="crypto_master",
                name="Módulo de Criptografia Concluído",
                description="Finalize todas as lições do módulo de Criptografia Essencial.",
                unlocked="s1" in completed_modules,
            ),
            AchievementResponse(
                id="hundred_hours",
                name="100h de Foco",
                description="Acumule 100 horas de estudo registradas.",
                unlocked=total_hours >= 100,
            ),
            AchievementResponse(
                id="weekly_master",
                name="Mestre da Semana",
                description="Mantenha uma sequência de pelo menos 7 dias de estudo.",
                unlocked=streak >= 7,
            ),
            AchievementResponse(
                id="lesson_hunter",
                name="Colecionador de Lições",
                description="Complete 20 lições nas trilhas de aprendizagem.",
                unlocked=completed_lessons >= 20,
            ),
        ]

        return achievements

