"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create family_groups table
    op.create_table(
        'family_groups',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('admin_password_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('profile_image_url', sa.Text(), nullable=True),
        sa.Column('icon_emoji', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['family_groups.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create events table
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('emoji', sa.String(), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('source_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['family_groups.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create event_participants table
    op.create_table(
        'event_participants',
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('event_id', 'user_id')
    )

    # Create chores table
    op.create_table(
        'chores',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('emoji', sa.String(), nullable=True),
        sa.Column('point_value', sa.Integer(), nullable=False),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.Column('assigned_to_ids', sa.Text(), nullable=True),
        sa.Column('is_group_chore', sa.Boolean(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=True),
        sa.Column('completed_by_ids', sa.Text(), nullable=True),
        sa.Column('week_start', sa.Date(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), nullable=True),
        sa.Column('recurrence_type', sa.String(), nullable=True),
        sa.Column('recurrence_interval', sa.Integer(), nullable=True),
        sa.Column('recurrence_count', sa.Integer(), nullable=True),
        sa.Column('recurrence_days', sa.Text(), nullable=True),
        sa.Column('recurrence_time_of_day', sa.String(), nullable=True),
        sa.Column('recurrence_end_date', sa.Date(), nullable=True),
        sa.Column('parent_chore_id', sa.Integer(), nullable=True),
        sa.CheckConstraint('point_value BETWEEN 1 AND 10', name='chk_chore_points_between_1_10'),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ),
        sa.ForeignKeyConstraint(['family_id'], ['family_groups.id'], ),
        sa.ForeignKeyConstraint(['parent_chore_id'], ['chores.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create points table
    op.create_table(
        'points',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('chore_id', sa.Integer(), nullable=True),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('awarded_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['chore_id'], ['chores.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create goals table
    op.create_table(
        'goals',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('point_requirement', sa.Integer(), nullable=True),
        sa.Column('prize', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['family_groups.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create calendar_tokens table
    op.create_table(
        'calendar_tokens',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('family_id', sa.Integer(), nullable=False),
        sa.Column('service', sa.String(), nullable=False),
        sa.Column('access_token', sa.Text(), nullable=True),
        sa.Column('refresh_token', sa.Text(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['family_groups.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('calendar_tokens')
    op.drop_table('goals')
    op.drop_table('points')
    op.drop_table('chores')
    op.drop_table('event_participants')
    op.drop_table('events')
    op.drop_table('users')
    op.drop_table('family_groups')

