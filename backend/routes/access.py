from fastapi import APIRouter, Query, HTTPException
from models import AccessCheckResponse
from storage import read
from config import FREE_CHAPTER_LIMIT

router = APIRouter()

# In Phase 1 premium is a simple flag passed by the client.
# Phase 2 will replace this with real auth/subscription checks.


@router.get("/check", response_model=AccessCheckResponse)
def check_access(
    user_id: str = Query(..., description="User identifier"),
    chapter_id: str = Query(..., description="Chapter to check access for"),
    is_premium: bool = Query(False, description="Whether user has premium subscription"),
):
    """
    Freemium gate: returns whether a user can access the requested chapter.
    Free users can access the first FREE_CHAPTER_LIMIT chapters only.
    Premium users have access to all chapters.
    """
    chapters = read("chapters.json")
    chapter = next((c for c in chapters if c["id"] == chapter_id), None)

    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found")

    if is_premium:
        return AccessCheckResponse(
            user_id=user_id,
            chapter_id=chapter_id,
            has_access=True,
            reason="Premium subscriber",
            is_premium=True,
        )

    if chapter["is_free"] or chapter["order"] <= FREE_CHAPTER_LIMIT:
        return AccessCheckResponse(
            user_id=user_id,
            chapter_id=chapter_id,
            has_access=True,
            reason="Free chapter",
            is_premium=False,
        )

    return AccessCheckResponse(
        user_id=user_id,
        chapter_id=chapter_id,
        has_access=False,
        reason=f"Premium content — upgrade to access chapters beyond chapter {FREE_CHAPTER_LIMIT}",
        is_premium=False,
    )
