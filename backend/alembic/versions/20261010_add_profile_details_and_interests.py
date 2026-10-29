"""add persisted profile details, interests, and icebreakers

Revision ID: 20261010_profile_details
Revises: 1d271db25afc
Create Date: 2026-10-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20261010_profile_details"
down_revision: Union[str, None] = "1d271db25afc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    op.add_column(
        "profiles", sa.Column("university", sa.String(length=150), nullable=True)
    )
    op.add_column("profiles", sa.Column("campus", sa.String(length=150), nullable=True))
    op.add_column("profiles", sa.Column("lifestyle", sa.JSON(), nullable=True))
    op.add_column("profiles", sa.Column("interests", sa.JSON(), nullable=True))
    op.add_column("profiles", sa.Column("icebreakers", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("profiles", "icebreakers")
    op.drop_column("profiles", "interests")
    op.drop_column("profiles", "lifestyle")
    op.drop_column("profiles", "campus")
    op.drop_column("profiles", "university")
