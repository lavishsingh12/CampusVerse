import asyncio
import json
from datetime import datetime, timezone
from sqlalchemy import select, delete
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.models.profile import Profile
from app.models.profile_action import ProfileAction
from app.models.match import Match
from app.models.message import Message
from app.core.security import create_access_token, hash_password
from app.api.v1.discover import get_discover_profiles
from app.api.v1.actions import create_action
from app.api.v1.likes import get_received_likes, get_sent_likes
from app.api.v1.matches import get_my_matches
from app.api.v1.messages import get_messages, send_message
from app.schemas.profile_action import ProfileActionCreate
from app.schemas.message import MessageCreate
from fastapi import HTTPException

async def run_direct_flow_verification():
    print("=== STARTING DIRECT ENDPOINT FLOW VERIFICATION ===")
    
    async with AsyncSessionLocal() as db:
        # 1. Ensure test users 1 & 2
        res1 = await db.execute(select(User).where(User.id == 1))
        user1 = res1.scalar_one_or_none()
        res2 = await db.execute(select(User).where(User.id == 2))
        user2 = res2.scalar_one_or_none()

        if not user1:
            user1 = User(id=1, email="alex.chen@campus.edu", name="Alex Chen", password_hash=hash_password("Test@123"))
            db.add(user1)
        if not user2:
            user2 = User(id=2, email="maya.sharma@campus.edu", name="Maya Sharma", password_hash=hash_password("Test@123"))
            db.add(user2)
        await db.commit()

        # Profiles
        prof1_res = await db.execute(select(Profile).where(Profile.user_id == 1))
        prof1 = prof1_res.scalar_one_or_none()
        if not prof1:
            prof1 = Profile(user_id=1, display_name="Alex Chen", age=21, degree="B.Tech", year="3rd Year", branch="CS", bio="Loves hackathons & coffee", is_verified=True, is_active=True)
            db.add(prof1)

        prof2_res = await db.execute(select(Profile).where(Profile.user_id == 2))
        prof2 = prof2_res.scalar_one_or_none()
        if not prof2:
            prof2 = Profile(user_id=2, display_name="Maya Sharma", age=20, degree="B.Tech", year="2nd Year", branch="Design", bio="UI/UX & Robotics enthusiast", is_verified=True, is_active=True)
            db.add(prof2)
        await db.commit()
        await db.refresh(prof1)
        await db.refresh(prof2)

        # Clean slate between user 1 and user 2
        await db.execute(delete(ProfileAction).where(ProfileAction.user_id.in_([1, 2])))
        await db.execute(delete(Message).where(Message.sender_id.in_([1, 2])))
        await db.execute(delete(Match).where(
            (Match.user_one_id.in_([1, 2])) & (Match.user_two_id.in_([1, 2]))
        ))
        await db.commit()

        print("\n--- 1. Testing Discover Endpoint for User 1 ---")
        discover_user1 = await get_discover_profiles(db=db, user_id=1)
        assert all(p.user_id != 1 for p in discover_user1), "User 1 should never see self in Discover"
        print(f"User 1 sees {len(discover_user1)} profiles on Discover.")

        print("\n--- 2. Testing Self-Like Rejection ---")
        try:
            await create_action(
                action_data=ProfileActionCreate(target_profile_id=prof1.id, action="like"),
                db=db,
                user_id=1
            )
            assert False, "Self-like should have raised HTTPException 400"
        except HTTPException as exc:
            assert exc.status_code == 400
            print("Self-like correctly rejected with 400 Bad Request.")

        print("\n--- 3. User 1 Likes User 2 ---")
        action_u1 = await create_action(
            action_data=ProfileActionCreate(target_profile_id=prof2.id, action="like"),
            db=db,
            user_id=1
        )
        assert action_u1.match_created is False, "Match created prematurely!"
        print("User 1 liked User 2 -> match_created is False (Expected).")

        print("\n--- 4. Checking Likes Sent and Received ---")
        sent_u1 = await get_sent_likes(db=db, user_id=1)
        assert len(sent_u1) >= 1
        assert any(item.profile.user_id == 2 for item in sent_u1)
        print(f"User 1 sent likes: found {len(sent_u1)} items including User 2.")

        rec_u2 = await get_received_likes(db=db, user_id=2)
        assert len(rec_u2) >= 1
        assert any(item.profile.user_id == 1 for item in rec_u2)
        print(f"User 2 received likes: found {len(rec_u2)} items including User 1.")

        # Check premature match state
        matches_u1 = await get_my_matches(db=db, user_id=1)
        assert not any(m.user.id == 2 for m in matches_u1)
        print("Confirmed no match exists prematurely.")

        print("\n--- 5. User 2 Likes User 1 (Mutual Match Creation) ---")
        action_u2 = await create_action(
            action_data=ProfileActionCreate(target_profile_id=prof1.id, action="like"),
            db=db,
            user_id=2
        )
        assert action_u2.match_created is True, "Expected mutual match to be created!"
        print("User 2 liked User 1 -> match_created is True! MATCH CREATED SUCCESS")

        print("\n--- 6. Duplicate Like Handling (Idempotency) ---")
        action_u2_dup = await create_action(
            action_data=ProfileActionCreate(target_profile_id=prof1.id, action="like"),
            db=db,
            user_id=2
        )
        assert action_u2_dup.match_created is False, "Duplicate like should not re-trigger match_created"
        print("Duplicate like handled safely.")

        print("\n--- 7. Check Matches for both users ---")
        matches_u1_after = await get_my_matches(db=db, user_id=1)
        matched_u2 = [m for m in matches_u1_after if m.user.id == 2]
        assert len(matched_u2) == 1, f"Expected 1 match, found {len(matched_u2)}"
        match_id = matched_u2[0].id
        print(f"User 1 sees exactly 1 match with User 2 (Match ID: {match_id}).")

        matches_u2_after = await get_my_matches(db=db, user_id=2)
        matched_u1 = [m for m in matches_u2_after if m.user.id == 1]
        assert len(matched_u1) == 1, f"Expected 1 match, found {len(matched_u1)}"
        print(f"User 2 sees exactly 1 match with User 1 (Match ID: {matched_u1[0].id}).")

        print("\n--- 8. Discover Exclusion of Matched Users ---")
        discover_u1_after = await get_discover_profiles(db=db, user_id=1)
        assert not any(p.user_id == 2 for p in discover_u1_after), "Matched user still appeared in Discover!"
        print("Matched users properly excluded from Discover query.")

        print("\n--- 9. Testing Match Messaging ---")
        msg_resp = await send_message(
            match_id=match_id,
            message_data=MessageCreate(content="Hey Maya! Great to connect!"),
            db=db,
            user_id=1
        )
        assert msg_resp.content == "Hey Maya! Great to connect!"
        print("User 1 sent a message.")

        msgs = await get_messages(match_id=match_id, db=db, user_id=2)
        assert len(msgs) >= 1
        assert msgs[-1].content == "Hey Maya! Great to connect!"
        print("User 2 read the message from match.")

        print("\n=== ALL DIRECT LIKES & MATCH FLOW VERIFICATIONS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(run_direct_flow_verification())
