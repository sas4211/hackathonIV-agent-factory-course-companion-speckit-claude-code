from fastapi import APIRouter, Query, HTTPException
from models import SearchResult
from storage import read

router = APIRouter()


def _index_lessons() -> list[dict]:
    """Flatten all lessons into a searchable list."""
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")
    index = []
    for chapter in chapters:
        cid = chapter["id"]
        for lesson in lessons_data.get(cid, []):
            index.append({
                "chapter_id": cid,
                "chapter_title": chapter["title"],
                "lesson_id": lesson["id"],
                "lesson_title": lesson["title"],
                "body": lesson["body"].lower(),
                "body_raw": lesson["body"],
            })
    return index


@router.get("", response_model=list[SearchResult])
def search(q: str = Query(..., min_length=2, description="Search query")):
    """
    Keyword search across all lesson content.
    Returns matching lessons with a relevance score and snippet.
    No LLM — pure string matching.
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")

    query = q.strip().lower()
    terms = query.split()
    index = _index_lessons()
    results = []

    for entry in index:
        body_lower = entry["body"]
        # Score = number of query terms found in the body
        score = sum(1 for term in terms if term in body_lower or term in entry["lesson_title"].lower())
        if score == 0:
            continue

        # Extract a snippet around the first match
        body_raw = entry["body_raw"]
        first_term = next((t for t in terms if t in body_lower), terms[0])
        pos = body_lower.find(first_term)
        start = max(0, pos - 60)
        end = min(len(body_raw), pos + 120)
        snippet = ("..." if start > 0 else "") + body_raw[start:end].strip() + ("..." if end < len(body_raw) else "")

        results.append(SearchResult(
            chapter_id=entry["chapter_id"],
            chapter_title=entry["chapter_title"],
            lesson_id=entry["lesson_id"],
            lesson_title=entry["lesson_title"],
            snippet=snippet,
            score=float(score),
        ))

    results.sort(key=lambda r: r.score, reverse=True)
    return results[:10]
