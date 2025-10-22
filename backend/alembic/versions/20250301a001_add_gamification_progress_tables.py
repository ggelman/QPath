"""Add gamification task, reward, and track tables"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = "20250301a001"
down_revision: Union[str, Sequence[str], None] = "73cbad05ecc9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

USERS_ID_REF = "users.id"
TRACKS_ID_REF = "learning_tracks.id"
MODULES_ID_REF = "track_modules.id"
LESSONS_ID_REF = "track_lessons.id"


def upgrade() -> None:
    """Upgrade schema with gamification support tables."""
    op.create_table(
        "study_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("due_date", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], [USERS_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "study_sessions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("session_date", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], [USERS_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "user_rewards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("condition", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("reward", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("achieved", sa.Boolean(), nullable=False),
        sa.Column("achieved_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], [USERS_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "learning_tracks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("slug", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("name", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column("color", sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_learning_tracks_slug", "learning_tracks", ["slug"], unique=True)

    op.create_table(
        "track_modules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("track_id", sa.Integer(), nullable=False),
        sa.Column("slug", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("description", sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["track_id"], [TRACKS_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_track_modules_slug", "track_modules", ["slug"], unique=True)

    op.create_table(
        "track_lessons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("module_id", sa.Integer(), nullable=False),
        sa.Column("slug", sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column("title", sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["module_id"], [MODULES_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_track_lessons_slug", "track_lessons", ["slug"], unique=True)

    op.create_table(
        "user_lesson_progress",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["lesson_id"], [LESSONS_ID_REF]),
        sa.ForeignKeyConstraint(["user_id"], [USERS_ID_REF]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "lesson_id", name="uq_user_lesson"),
    )


def downgrade() -> None:
    """Downgrade schema removing gamification support tables."""
    op.drop_table("user_lesson_progress")
    op.drop_index("ix_track_lessons_slug", table_name="track_lessons")
    op.drop_table("track_lessons")
    op.drop_index("ix_track_modules_slug", table_name="track_modules")
    op.drop_table("track_modules")
    op.drop_index("ix_learning_tracks_slug", table_name="learning_tracks")
    op.drop_table("learning_tracks")
    op.drop_table("user_rewards")
    op.drop_table("study_sessions")
    op.drop_table("study_tasks")
