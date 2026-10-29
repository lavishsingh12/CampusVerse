"""backfill legacy active users email_verified state

Revision ID: 20261018_backfill_legacy_users
Revises: 20261018_optional_profile_fields
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261018_backfill_legacy_users"
down_revision: Union[str, None] = "20261018_optional_profile_fields"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Any user who was active in the database prior to the verification columns addition
    # and has a complete profile is a verified legacy user
    op.execute(
        """
        UPDATE users 
        SET email_verified = true 
        WHERE is_active = true 
          AND id IN (SELECT user_id FROM profiles)
        """
    )


def downgrade() -> None:
    pass
