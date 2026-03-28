from fastapi import APIRouter, HTTPException
from models import Chapter, ChapterSummary, Lesson
from storage import read

router = APIRouter()


def _all_chapters() -> list[dict]:
    return read("chapters.json")


def _all_lessons() -> dict:
    return read("lessons.json")


@router.get("", response_model=list[ChapterSummary])
def list_chapters():
    """List all course chapters with their free/paid status, summary, and lesson count."""
    chapters = _all_chapters()
    lessons_data = _all_lessons()
    return [
        ChapterSummary(
            id=c["id"],
            title=c["title"],
            order=c["order"],
            is_free=c["is_free"],
            summary=c.get("summary", ""),
            lesson_count=len(lessons_data.get(c["id"], [])),
        )
        for c in chapters
    ]


@router.get("/{chapter_id}", response_model=Chapter)
def get_chapter(chapter_id: str):
    """Get full chapter content including all lessons."""
    chapters = _all_chapters()
    lessons_data = _all_lessons()

    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found")

    raw_lessons = lessons_data.get(chapter_id, [])
    lessons = [Lesson(**l) for l in raw_lessons]

    return Chapter(**chapter, lessons=lessons)


@router.get("/{chapter_id}/next", response_model=Chapter)
def next_chapter(chapter_id: str):
    """Navigate to the next chapter."""
    chapters = _all_chapters()
    lessons_data = _all_lessons()

    current = next((c for c in chapters if c["id"] == chapter_id), None)
    if not current:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found")

    next_id = current.get("next_chapter_id")
    if not next_id:
        raise HTTPException(status_code=404, detail="No next chapter — this is the last chapter")

    next_ch = next((c for c in chapters if c["id"] == next_id), None)
    lessons = [Lesson(**l) for l in lessons_data.get(next_id, [])]
    return Chapter(**next_ch, lessons=lessons)


@router.get("/{chapter_id}/previous", response_model=Chapter)
def previous_chapter(chapter_id: str):
    """Navigate to the previous chapter."""
    chapters = _all_chapters()
    lessons_data = _all_lessons()

    current = next((c for c in chapters if c["id"] == chapter_id), None)
    if not current:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found")

    prev_id = current.get("prev_chapter_id")
    if not prev_id:
        raise HTTPException(status_code=404, detail="No previous chapter — this is the first chapter")

    prev_ch = next((c for c in chapters if c["id"] == prev_id), None)
    lessons = [Lesson(**l) for l in lessons_data.get(prev_id, [])]
    return Chapter(**prev_ch, lessons=lessons)
