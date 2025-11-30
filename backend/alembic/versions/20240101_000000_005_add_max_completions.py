"""add max_completions field to chores

Revision ID: 005
Revises: 004
Create Date: 2024-01-01 00:00:05.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add max_completions column to chores table
    op.add_column('chores', sa.Column('max_completions', sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column('chores', 'max_completions')

