"""add premium fields to users

Revision ID: 019b20a56d33
Revises: 755ce9e8f273
Create Date: 2026-10-08 22:31:51.024366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '019b20a56d33'
down_revision: Union[str, None] = '755ce9e8f273'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column(
            'is_premium',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        'users',
        sa.Column(
            'premium_expires_at',
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.alter_column(
        'users',
        'is_premium',
        server_default=None,
    )


def downgrade() -> None:
    op.drop_column('users', 'premium_expires_at')
    op.drop_column('users', 'is_premium')
