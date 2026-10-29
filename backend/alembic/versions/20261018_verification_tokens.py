"""create verification_tokens table

Revision ID: 20261018_verification_tokens
Revises: 20261018_signup_states
Create Date: 2026-10-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261018_verification_tokens"
down_revision: Union[str, None] = "20261018_signup_states"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "verification_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("identifier", sa.String(length=255), nullable=False),
        sa.Column("token_type", sa.String(length=50), nullable=False),
        sa.Column("code", sa.String(length=128), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_used", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_verification_tokens_id"), "verification_tokens", ["id"], unique=False)
    op.create_index(op.f("ix_verification_tokens_identifier"), "verification_tokens", ["identifier"], unique=False)
    op.create_index(op.f("ix_verification_tokens_token_type"), "verification_tokens", ["token_type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_verification_tokens_token_type"), table_name="verification_tokens")
    op.drop_index(op.f("ix_verification_tokens_identifier"), table_name="verification_tokens")
    op.drop_index(op.f("ix_verification_tokens_id"), table_name="verification_tokens")
    op.drop_table("verification_tokens")
