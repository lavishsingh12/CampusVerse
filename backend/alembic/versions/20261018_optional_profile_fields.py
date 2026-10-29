"""make profile demographic fields optional on initial signup

Revision ID: 20261018_optional_profile_fields
Revises: 20261018_verification_tokens
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261018_optional_profile_fields"
down_revision: Union[str, None] = "20261018_verification_tokens"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("profiles", "age", existing_type=sa.Integer(), nullable=True)
    op.alter_column("profiles", "degree", existing_type=sa.String(length=100), nullable=True)
    op.alter_column("profiles", "year", existing_type=sa.String(length=50), nullable=True)
    op.alter_column("profiles", "branch", existing_type=sa.String(length=150), nullable=True)


def downgrade() -> None:
    op.alter_column("profiles", "branch", existing_type=sa.String(length=150), nullable=False)
    op.alter_column("profiles", "year", existing_type=sa.String(length=50), nullable=False)
    op.alter_column("profiles", "degree", existing_type=sa.String(length=100), nullable=False)
    op.alter_column("profiles", "age", existing_type=sa.Integer(), nullable=False)
