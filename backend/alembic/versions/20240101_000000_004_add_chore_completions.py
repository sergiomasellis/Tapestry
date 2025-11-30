"""add chore completions table

Revision ID: 004
Revises: 003
Create Date: 2024-01-01 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create chore_completions table
    op.create_table(
        "chore_completions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("chore_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=False),
        sa.Column("points_awarded", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["chore_id"],
            ["chores.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # Create indexes for faster queries
    op.create_index("ix_chore_completions_chore_id", "chore_completions", ["chore_id"])
    op.create_index("ix_chore_completions_user_id", "chore_completions", ["user_id"])
    op.create_index(
        "ix_chore_completions_completed_at", "chore_completions", ["completed_at"]
    )


def downgrade() -> None:
    op.drop_index("ix_chore_completions_completed_at", table_name="chore_completions")
    op.drop_index("ix_chore_completions_user_id", table_name="chore_completions")
    op.drop_index("ix_chore_completions_chore_id", table_name="chore_completions")
    op.drop_table("chore_completions")
