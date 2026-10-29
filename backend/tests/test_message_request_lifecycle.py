import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock

from app.api.v1.message_requests import (
    accept_message_request,
    reply_to_message_request,
)
from app.models.message_request import MessageRequest
from app.schemas.message_request import MessageRequestReply


class FakeResult:
    def __init__(self, value=None, scalar_list=None):
        self._value = value
        self._scalar_list = scalar_list or []

    def scalar_one_or_none(self):
        return self._value

    def scalars(self):
        return MagicMock(all=lambda: self._scalar_list)


class MessageRequestLifecycleTests(unittest.TestCase):
    def test_reply_keeps_request_pending_and_enforces_limit(self):
        request = MessageRequest(
            id=10,
            sender_id=1,
            receiver_id=2,
            content="hello",
            pending_messages=["hello", "second"],
            status="pending",
        )
        db = MagicMock()
        db.execute = AsyncMock(return_value=FakeResult(value=request))
        db.commit = AsyncMock()
        db.refresh = AsyncMock()

        async def run() -> MessageRequest:
            return await reply_to_message_request(
                10,
                MessageRequestReply(content="third"),
                db=db,
                user_id=1,
            )

        result = asyncio.run(run())
        self.assertEqual(result.pending_messages, ["hello", "second", "third"])
        self.assertEqual(result.status, "pending")

        request.pending_messages = ["hello", "second", "third"]
        db.execute = AsyncMock(return_value=FakeResult(value=request))

        with self.assertRaises(Exception) as ctx:
            asyncio.run(
                reply_to_message_request(
                    10,
                    MessageRequestReply(content="fourth"),
                    db=db,
                    user_id=1,
                )
            )

        self.assertEqual(ctx.exception.status_code, 429)

    def test_accept_is_idempotent_and_preserves_history(self):
        request = MessageRequest(
            id=88,
            sender_id=1,
            receiver_id=2,
            content="hello",
            pending_messages=["hello", "second"],
            status="pending",
        )
        db = MagicMock()
        db.execute = AsyncMock(side_effect=[
            FakeResult(value=request),
            FakeResult(value=None),
            FakeResult(value=[]),
            FakeResult(value=[]),
        ])
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        db.flush = AsyncMock()

        result = asyncio.run(
            accept_message_request(88, db=db, user_id=2)
        )

        self.assertEqual(result.status, "accepted")
        self.assertEqual(result.pending_messages, ["hello", "second"])
        self.assertGreaterEqual(db.add.call_count, 1)

        db.add.reset_mock()
        request.status = "accepted"
        db.execute = AsyncMock(return_value=FakeResult(value=request))

        asyncio.run(accept_message_request(88, db=db, user_id=2))
        self.assertEqual(db.add.call_count, 0)


if __name__ == "__main__":
    unittest.main()
