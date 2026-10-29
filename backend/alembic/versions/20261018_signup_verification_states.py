"""add explicit signup verification states

Revision ID: 20261018_signup_states
Revises: 20261018_request_conversations
"""

from alembic import op
import sqlalchemy as sa

revision = "20261018_signup_states"
down_revision = "20261018_request_conversations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("phone_number", sa.String(length=32), nullable=True))
    op.add_column("users", sa.Column("phone_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_unique_constraint("uq_users_phone_number", "users", ["phone_number"])


def downgrade() -> None:
    op.drop_constraint("uq_users_phone_number", "users", type_="unique")
    op.drop_column("users", "phone_verified")
    op.drop_column("users", "phone_number")
    op.drop_column("users", "email_verified")
