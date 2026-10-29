import re
import unicodedata
from collections.abc import Iterable

from app.models.profile import Profile


CONCEPTS: dict[str, tuple[str, ...]] = {
    "romance": (
        "romantic",
        "romance",
        "dating",
        "date",
        "casual dating",
        "looking for a partner",
        "romantic connection",
    ),
    "long_term": (
        "long term",
        "longterm",
        "committed",
        "commitment",
        "serious relationship",
        "life partner",
        "lasting relationship",
    ),
    "short_term": (
        "short term",
        "shortterm",
        "casual",
        "casual meetup",
        "short term fun",
        "something casual",
    ),
    "garba": ("garba", "dandiya", "navratri", "dodhiya"),
    "dance_culture": (
        "dance",
        "dancing",
        "folk dance",
        "cultural event",
        "cultural events",
        "festival",
        "festivals",
        "traditional music",
    ),
    "food": (
        "food",
        "foodie",
        "cooking",
        "baking",
        "restaurant",
        "restaurants",
        "dining",
        "cuisine",
        "brunch",
        "chef",
    ),
    "coffee": (
        "coffee",
        "cafe",
        "cafes",
        "café",
        "cafés",
        "espresso",
        "coffee shop",
        "coffee shops",
        "tea",
        "chai",
    ),
    "conversation": ("good conversation", "deep conversations", "conversation"),
    "social": (
        "hangout",
        "hangouts",
        "going out",
        "social activities",
        "parties",
        "party",
        "meet new people",
    ),
    "fitness": (
        "gym",
        "fitness",
        "workout",
        "workouts",
        "strength training",
        "weight training",
        "lifting",
        "exercise",
        "running",
        "sports",
        "badminton",
        "basketball",
        "football",
        "volleyball",
        "tennis",
    ),
    "biking": (
        "bike",
        "bikes",
        "biking",
        "motorbike",
        "motorcycle",
        "motorcycling",
        "cycling",
        "bicycle",
        "long ride",
        "long rides",
        "road trip",
        "road trips",
        "exploring roads",
        "late night ride",
        "late night rides",
        "late night driving",
    ),
    "technical": (
        "coding",
        "programming",
        "software",
        "computer science",
        "artificial intelligence",
        "machine learning",
        "ai",
        "ml",
        "hackathon",
        "hackathons",
        "tech project",
        "tech projects",
        "building projects",
        "open source",
        "developer",
        "engineering",
    ),
    "music": ("music", "singing", "guitar", "instrument", "concert"),
    "photography": ("photography", "photograph", "camera"),
    "reading": ("reading", "books", "book club", "literature"),
    "travel": ("travel", "travelling", "traveling", "trekking", "hiking"),
    "gaming": ("gaming", "games", "video games"),
    "art": ("art", "painting", "drawing", "design", "creative"),
    "film": ("movies", "films", "cinema", "anime"),
}

CATEGORY_CONCEPTS: dict[str, tuple[str, ...]] = {
    "romantic": ("romance", "long_term"),
    "garba": ("garba", "dance_culture"),
    "foodies": ("food", "coffee"),
    "shortterm": ("short_term", "social"),
    "coffee": ("coffee", "conversation"),
    "gym": ("fitness",),
    "bikelovers": ("biking",),
    "longterm": ("long_term",),
    "hackathon": ("technical",),
    "communities": tuple(CONCEPTS),
}

HIGH_RELEVANCE_SCORE = 6
SOME_RELEVANCE_SCORE = 2


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.casefold())
    ascii_text = "".join(char for char in normalized if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", " ", ascii_text).strip()


def _contains_term(text: str, term: str) -> bool:
    normalized_text = f" {normalize_text(text)} "
    normalized_term = f" {normalize_text(term)} "
    return normalized_term in normalized_text


def _values(items: object, field: str) -> Iterable[str]:
    if isinstance(items, list):
        for item in items:
            value = item.get(field) if isinstance(item, dict) else getattr(item, field, None)
            if isinstance(value, str) and value.strip():
                yield value


def _profile_signals(profile: Profile) -> dict[str, list[str]]:
    lifestyle = profile.lifestyle if isinstance(profile.lifestyle, dict) else {}
    return {
        "interests": list(_values(profile.interests, "label")),
        "bio": [profile.bio] if isinstance(profile.bio, str) and profile.bio.strip() else [],
        "icebreakers": [
            value
            for item in (profile.icebreakers or [])
            for value in (
                item.get("prompt") if isinstance(item, dict) else getattr(item, "prompt", None),
                item.get("text") if isinstance(item, dict) else getattr(item, "text", None),
            )
            if isinstance(value, str) and value.strip()
        ] if isinstance(profile.icebreakers, list) else [],
        "looking_for": [
            value
            for key, value in lifestyle.items()
            if isinstance(key, str)
            and "looking" in key.casefold()
            and isinstance(value, str)
            and value.strip()
        ],
        "workout": [
            value
            for key, value in lifestyle.items()
            if isinstance(key, str)
            and ("workout" in key.casefold() or "gym" in key.casefold())
            and isinstance(value, str)
            and value.strip()
        ],
        "other_lifestyle": [
            value
            for key, value in lifestyle.items()
            if isinstance(key, str)
            and key.casefold() not in {"lookingfor", "looking_for", "workout", "gym"}
            and isinstance(value, str)
            and value.strip()
        ],
        "education": [
            value
            for value in (profile.degree, profile.branch)
            if isinstance(value, str) and value.strip()
        ],
    }


def _matched_concepts(values: Iterable[str]) -> set[str]:
    matched: set[str] = set()
    for concept, terms in CONCEPTS.items():
        if any(_contains_term(value, term) for value in values for term in terms):
            matched.add(concept)
    return matched


def _score_category(profile: Profile, category_id: str) -> int:
    signals = _profile_signals(profile)
    concepts = CATEGORY_CONCEPTS[category_id]

    if category_id == "communities":
        # Communities are relevant when the candidate shares concepts with the viewer.
        return 0

    score = 0
    for concept in concepts:
        terms = CONCEPTS[concept]
        if concept in {"romance", "long_term", "short_term"}:
            if any(_contains_term(value, term) for value in signals["looking_for"] for term in terms):
                score += 7
            if any(_contains_term(value, term) for value in signals["interests"] for term in terms):
                score += 4
            if any(_contains_term(value, term) for value in signals["bio"] for term in terms):
                score += 2
            if any(_contains_term(value, term) for value in signals["icebreakers"] for term in terms):
                score += 1
            continue

        if any(_contains_term(value, term) for value in signals["interests"] for term in terms):
            score += 4
        if any(_contains_term(value, term) for value in signals["bio"] for term in terms):
            score += 2
        if any(_contains_term(value, term) for value in signals["icebreakers"] for term in terms):
            score += 1
        if any(_contains_term(value, term) for value in signals["looking_for"] for term in terms):
            score += 4
        if concept == "fitness":
            if any(_contains_term(value, term) for value in signals["workout"] for term in terms):
                score += 5
            else:
                for value in signals["workout"]:
                    if _contains_term(value, "active") or _contains_term(value, "daily"):
                        score += 6
                        break
                    if _contains_term(value, "occasionally"):
                        score += 2
                        break
        if concept == "technical" and any(
            _contains_term(value, term) for value in signals["education"] for term in terms
        ):
            score += 1

    return score


def score_profiles(
    profiles: list[Profile],
    category_id: str,
    viewer_profile: Profile | None = None,
) -> list[tuple[Profile, int]]:
    if category_id not in CATEGORY_CONCEPTS:
        raise ValueError(f"Unsupported Explore category: {category_id}")

    if category_id == "communities":
        viewer_concepts = (
            _matched_concepts(_profile_signals(viewer_profile)["interests"])
            if viewer_profile is not None
            else set()
        )
        scored = []
        for profile in profiles:
            signals = _profile_signals(profile)
            candidate_concepts = _matched_concepts(
                signals["interests"] + signals["bio"] + signals["icebreakers"]
            )
            overlap = len(viewer_concepts & candidate_concepts)
            scored.append((profile, overlap * 4))
    else:
        scored = [(profile, _score_category(profile, category_id)) for profile in profiles]

    def rank(item: tuple[Profile, int]) -> tuple[int, int, str, int]:
        profile, score = item
        display_name = str(getattr(profile, "display_name", "") or "")
        relevance_tier = 2 if score >= HIGH_RELEVANCE_SCORE else 1 if score >= SOME_RELEVANCE_SCORE else 0
        return (-relevance_tier, -score, display_name.casefold(), getattr(profile, "id", 0))

    return sorted(scored, key=rank)


def category_ids() -> tuple[str, ...]:
    return tuple(CATEGORY_CONCEPTS)
