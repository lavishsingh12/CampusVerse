"""persist pending request messages and separate request conversations from matches

Revision ID: 20261018_request_conversations
Revises: 20261010_profile_details
"""

from alembic import op
import sqlalchemy as sa

revision = "20261018_request_conversations"
down_revision = "20261010_profile_details"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("message_requests", sa.Column("pending_messages", sa.JSON(), nullable=True))
    op.add_column("messages", sa.Column("message_request_id", sa.Integer(), nullable=True))
    op.alter_column("messages", "match_id", existing_type=sa.Integer(), nullable=True)
    op.create_foreign_key(
        "fk_messages_message_request_id", "messages", "message_requests",
        ["message_request_id"], ["id"], ondelete="CASCADE",
    )
    op.create_index("ix_messages_message_request_id", "messages", ["message_request_id"])
    op.create_check_constraint(
        "ck_message_request_distinct_users", "message_requests", "sender_id <> receiver_id"
    )
    op.create_check_constraint(
        "ck_message_request_status", "message_requests",
        "status IN ('pending', 'accepted', 'rejected')"
    )


def downgrade() -> None:
    op.drop_constraint("ck_message_request_status", "message_requests", type_="check")
    op.drop_constraint("ck_message_request_distinct_users", "message_requests", type_="check")
    op.drop_index("ix_messages_message_request_id", table_name="messages")
    op.drop_constraint("fk_messages_message_request_id", "messages", type_="foreignkey")
    op.alter_column("messages", "match_id", existing_type=sa.Integer(), nullable=False)
    op.drop_column("messages", "message_request_id")
    op.drop_column("message_requests", "pending_messages")
