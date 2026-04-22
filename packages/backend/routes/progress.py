import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from models import UserProgress, ProgressUpdate

router = APIRouter()

PROGRESS_FILE = Path(__file__).parent.parent / "data" / "progress.json"


def _load() -> dict:
    with open(PROGRESS_FILE, encoding="utf-8") as f:
        return json.load(f)


def _save(data: dict):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _default_progress(user_id: str) -> dict:
    return {
        "user_id": user_id,
        "completed_lessons": [],
        "completed_chapters": [],
        "quiz_scores": {},
    }


@router.get("/{user_id}", response_model=UserProgress)
def get_progress(user_id: str):
    """Get a user's progress: completed lessons, chapters, and quiz scores."""
    data = _load()
    user_data = data.get(user_id, _default_progress(user_id))
    return UserProgress(**user_data)


@router.put("/{user_id}", response_model=UserProgress)
def update_progress(user_id: str, update: ProgressUpdate):
    """
    Update progress: mark a lesson/chapter complete or record a quiz score.
    At least one field must be provided.
    """
    if not any([update.lesson_id, update.chapter_id, update.quiz_id]):
        raise HTTPException(status_code=400, detail="Provide at least one of: lesson_id, chapter_id, quiz_id")

    data = _load()
    user_data = data.get(user_id, _default_progress(user_id))

    if update.lesson_id and update.lesson_id not in user_data["completed_lessons"]:
        user_data["completed_lessons"].append(update.lesson_id)

    if update.chapter_id and update.chapter_id not in user_data["completed_chapters"]:
        user_data["completed_chapters"].append(update.chapter_id)

    if update.quiz_id and update.quiz_score is not None and update.quiz_total is not None:
        user_data["quiz_scores"][update.quiz_id] = {
            "score": update.quiz_score,
            "total": update.quiz_total,
            "passed": update.quiz_score >= round(update.quiz_total * 0.7),
        }

    data[user_id] = user_data
    _save(data)

    return UserProgress(**user_data)
