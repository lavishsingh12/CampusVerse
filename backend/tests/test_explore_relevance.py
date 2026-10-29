import unittest

from app.models.profile import Profile
from app.schemas.profile import ProfileDetailResponse
from app.services.explore_relevance import score_profiles


def make_profile(
    profile_id: int,
    *,
    interests: list[dict[str, str]] | None = None,
    bio: str | None = None,
    lifestyle: dict[str, str] | None = None,
    icebreakers: list[dict[str, str]] | None = None,
) -> Profile:
    return Profile(
        id=profile_id,
        user_id=profile_id,
        display_name=f"Student {profile_id}",
        age=20,
        degree="Student",
        year="2nd Year",
        branch="General",
        bio=bio,
        lifestyle=lifestyle,
        interests=interests,
        icebreakers=icebreakers,
        is_verified=True,
        is_active=True,
    )


class ExploreRelevanceTests(unittest.TestCase):
    def test_bike_signals_rank_above_weak_and_unrelated_profiles(self) -> None:
        strong = make_profile(
            1,
            interests=[{"label": "Late-night rides"}],
            bio="I love exploring roads after dark.",
        )
        partial = make_profile(2, bio="I like exploring roads.")
        unrelated = make_profile(3, interests=[{"label": "Reading"}])

        ranked = score_profiles([unrelated, partial, strong], "bikelovers")

        self.assertEqual([profile.id for profile, _ in ranked], [1, 2, 3])
        self.assertGreater(ranked[0][1], ranked[1][1])
        self.assertEqual(ranked[2][1], 0)

    def test_workout_and_saved_preferences_are_signals(self) -> None:
        gym_profile = make_profile(
            1,
            lifestyle={"workout": "Active (3–4x week)"},
            interests=[{"label": "Strength training"}],
        )
        long_term_profile = make_profile(
            2,
            lifestyle={"lookingFor": "Long-term relationship"},
        )

        self.assertGreater(score_profiles([gym_profile], "gym")[0][1], 0)
        self.assertGreater(score_profiles([long_term_profile], "longterm")[0][1], 0)
        self.assertGreater(score_profiles([long_term_profile], "romantic")[0][1], 0)

    def test_coffee_does_not_imply_romantic_interest(self) -> None:
        profile = make_profile(
            1,
            interests=[{"label": "Coffee"}],
            bio="I enjoy cafes and good conversations.",
        )

        self.assertGreater(score_profiles([profile], "coffee")[0][1], 0)
        self.assertEqual(score_profiles([profile], "romantic")[0][1], 0)

    def test_communities_uses_shared_saved_interest_concepts(self) -> None:
        viewer = make_profile(1, interests=[{"label": "AI / ML"}])
        shared = make_profile(2, interests=[{"label": "Artificial intelligence projects"}])
        unrelated = make_profile(3, interests=[{"label": "Cooking"}])

        ranked = score_profiles(
            [unrelated, shared],
            "communities",
            viewer_profile=viewer,
        )

        self.assertEqual([profile.id for profile, _ in ranked], [2, 3])
        self.assertGreater(ranked[0][1], 0)
        self.assertEqual(ranked[1][1], 0)

    def test_sparse_profiles_are_safe_and_remain_low_relevance(self) -> None:
        profile = make_profile(1)

        self.assertEqual(score_profiles([profile], "foodies")[0][1], 0)

    def test_missing_display_name_is_safe_to_sort(self) -> None:
        profile = make_profile(1)
        profile.display_name = None

        self.assertEqual(score_profiles([profile], "foodies")[0][1], 0)

    def test_discover_response_models_keep_saved_interests_matchable(self) -> None:
        response_profile = ProfileDetailResponse(
            id=1,
            user_id=1,
            display_name="Student",
            age=20,
            degree="B.Tech",
            year="2nd Year",
            branch="General",
            bio=None,
            university=None,
            campus=None,
            lifestyle=None,
            interests=[
                {"id": "1", "label": "Motorcycling", "emoji": "🏍️"},
                {"id": "2", "label": "Road trips", "emoji": "🛣️"},
                {"id": "3", "label": "Music", "emoji": "🎵"},
            ],
            icebreakers=[{"prompt": "Weekend", "text": "Road trips after class"}],
            is_verified=True,
            is_active=True,
            photos=[],
        )

        self.assertGreater(score_profiles([response_profile], "bikelovers")[0][1], 0)


if __name__ == "__main__":
    unittest.main()
