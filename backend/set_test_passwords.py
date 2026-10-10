import asyncio

from sqlalchemy import update

from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core.security import hash_password


async def main():
    async with AsyncSessionLocal() as db:
        password_hash = hash_password("Test@123")

        await db.execute(
            update(User)
            .where(User.id.in_([1, 2]))
            .values(password_hash=password_hash)
        )

        await db.commit()

    print("Test passwords updated successfully.")


if __name__ == "__main__":
    asyncio.run(main())