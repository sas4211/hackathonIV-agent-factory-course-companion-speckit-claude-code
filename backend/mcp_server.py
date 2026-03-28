"""
Course Companion — MCP Server  (Layer 6: Runtime Skills + MCP)
==============================================================
Exposes all Course Companion capabilities as MCP tools, making the
platform accessible to any MCP-compatible client (Claude Desktop,
Claude Code, custom agents, etc.) without running the HTTP server.

Run:
    python mcp_server.py          # stdio transport (default)
    mcp dev mcp_server.py         # inspector UI for testing

Architecture note:
    Shares the same data layer as the FastAPI backend (storage.py).
    Zero LLM calls — pure deterministic tools. Phase 1 compliant.
"""
import json
import os
import sys
from pathlib import Path
from math import ceil

# Allow imports from backend/ directory when run as a script
sys.path.insert(0, str(Path(__file__).parent))

from mcp.server.fastmcp import FastMCP
from storage import read

# ── Server init ──────────────────────────────────────────────────────────────
mcp = FastMCP(
    "Course Companion FTE",
    instructions=(
        "You are a Course Companion AI Tutor. Always call check_access before "
        "delivering chapter content. Never reveal quiz answers before submission. "
        "Track progress after every lesson, chapter, or quiz completion."
    ),
)

PROGRESS_FILE = Path(__file__).parent / "data" / "progress.json"
FREE_CHAPTER_LIMIT = int(os.environ.get("FREE_CHAPTER_LIMIT", 3))


# ── Internal helpers ─────────────────────────────────────────────────────────
def _load_progress() -> dict:
    if not PROGRESS_FILE.exists():
        return {}
    with open(PROGRESS_FILE, encoding="utf-8") as f:
        return json.load(f)


def _save_progress(data: dict) -> None:
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _default_progress(user_id: str) -> dict:
    return {
        "user_id": user_id,
        "completed_lessons": [],
        "completed_chapters": [],
        "quiz_scores": {},
    }


# ── Tool: list_chapters ──────────────────────────────────────────────────────
@mcp.tool()
def list_chapters() -> list[dict]:
    """
    List all course chapters with their free/paid status, summary, and lesson count.
    Use this to show the curriculum overview or let students browse available content.
    """
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")
    return [
        {
            "id": ch["id"],
            "title": ch["title"],
            "order": ch["order"],
            "is_free": ch["is_free"],
            "summary": ch.get("summary", ""),
            "lesson_count": len(lessons_data.get(ch["id"], [])),
            "next_chapter_id": ch.get("next_chapter_id"),
            "prev_chapter_id": ch.get("prev_chapter_id"),
        }
        for ch in chapters
    ]


# ── Tool: get_chapter ────────────────────────────────────────────────────────
@mcp.tool()
def get_chapter(chapter_id: str) -> dict:
    """
    Get full chapter content including all lessons.
    Always call check_access first to enforce the freemium gate.

    Args:
        chapter_id: Chapter identifier, e.g. 'ch01', 'ch02'
    """
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        return {"error": f"Chapter '{chapter_id}' not found"}

    return {**chapter, "lessons": lessons_data.get(chapter_id, [])}


# ── Tool: next_chapter ───────────────────────────────────────────────────────
@mcp.tool()
def next_chapter(chapter_id: str) -> dict:
    """
    Navigate to the next chapter in the course sequence.

    Args:
        chapter_id: Current chapter identifier
    """
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    current = next((c for c in chapters if c["id"] == chapter_id), None)
    if not current:
        return {"error": f"Chapter '{chapter_id}' not found"}

    next_id = current.get("next_chapter_id")
    if not next_id:
        return {"error": "No next chapter — this is the last chapter in the course."}

    next_ch = next((c for c in chapters if c["id"] == next_id), None)
    return {**next_ch, "lessons": lessons_data.get(next_id, [])}


# ── Tool: previous_chapter ───────────────────────────────────────────────────
@mcp.tool()
def previous_chapter(chapter_id: str) -> dict:
    """
    Navigate to the previous chapter in the course sequence.

    Args:
        chapter_id: Current chapter identifier
    """
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    current = next((c for c in chapters if c["id"] == chapter_id), None)
    if not current:
        return {"error": f"Chapter '{chapter_id}' not found"}

    prev_id = current.get("prev_chapter_id")
    if not prev_id:
        return {"error": "No previous chapter — this is the first chapter in the course."}

    prev_ch = next((c for c in chapters if c["id"] == prev_id), None)
    return {**prev_ch, "lessons": lessons_data.get(prev_id, [])}


# ── Tool: search_content ─────────────────────────────────────────────────────
@mcp.tool()
def search_content(query: str) -> list[dict]:
    """
    Search all lesson content by keyword. Use this to ground explanations in
    actual course material rather than fabricating answers.

    Args:
        query: Search query string (keywords, concept names, etc.)

    Returns:
        Up to 10 results sorted by relevance, each with a text snippet.
    """
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    terms = query.lower().split()
    if not terms:
        return []

    chapter_map = {ch["id"]: ch["title"] for ch in chapters}
    results = []

    for ch_id, lessons in lessons_data.items():
        for lesson in lessons:
            text = (lesson.get("title", "") + " " + lesson.get("body", "")).lower()
            score = sum(1 for term in terms if term in text)
            if score == 0:
                continue
            body = lesson.get("body", "")
            idx = body.lower().find(terms[0])
            start = max(0, idx - 60)
            end = min(len(body), idx + 180)
            snippet = body[start:end].strip()
            results.append({
                "chapter_id": ch_id,
                "chapter_title": chapter_map.get(ch_id, ch_id),
                "lesson_id": lesson["id"],
                "lesson_title": lesson["title"],
                "snippet": snippet,
                "score": float(score),
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:10]


# ── Tool: get_quiz ───────────────────────────────────────────────────────────
@mcp.tool()
def get_quiz(chapter_id: str) -> list[dict]:
    """
    Fetch quiz questions for a chapter. Correct answers are NOT included —
    they are only revealed after submit_quiz is called.

    Present questions ONE AT A TIME. Collect all answers before submitting.

    Args:
        chapter_id: Chapter identifier, e.g. 'ch01'
    """
    quizzes = read("quizzes.json")
    questions = quizzes.get(chapter_id)
    if not questions:
        return [{"error": f"No quiz found for chapter '{chapter_id}'"}]

    return [
        {
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "correct_index": -1,   # hidden — revealed only after submit
            "explanation": "",     # hidden — revealed only after submit
        }
        for q in questions
    ]


# ── Tool: submit_quiz ────────────────────────────────────────────────────────
@mcp.tool()
def submit_quiz(chapter_id: str, answers: dict) -> dict:
    """
    Submit all quiz answers at once and receive the score with per-question
    feedback. Rule-based grading — 70% pass threshold. Zero LLM calls.

    Args:
        chapter_id: Chapter identifier
        answers: Dict mapping question_id -> chosen_option_index (0-based)
                 Example: {"ch01-q01": 2, "ch01-q02": 0, "ch01-q03": 1}

    Returns:
        score, total, passed (bool), feedback per question with explanation
    """
    quizzes = read("quizzes.json")
    questions = quizzes.get(chapter_id)
    if not questions:
        return {"error": f"No quiz found for chapter '{chapter_id}'"}

    score = 0
    feedback = {}

    for q in questions:
        qid = q["id"]
        chosen = answers.get(qid)
        correct = q["correct_index"]
        is_correct = chosen == correct
        if is_correct:
            score += 1
        feedback[qid] = {
            "correct": is_correct,
            "chosen_index": chosen,
            "correct_index": correct,
            "explanation": q["explanation"],
        }

    total = len(questions)
    passed = score >= ceil(total * 0.7)
    return {"score": score, "total": total, "passed": passed, "feedback": feedback}


# ── Tool: get_progress ───────────────────────────────────────────────────────
@mcp.tool()
def get_progress(user_id: str) -> dict:
    """
    Get a student's progress: completed lessons, chapters, and quiz scores.

    Args:
        user_id: Unique student identifier
    """
    data = _load_progress()
    return data.get(user_id, _default_progress(user_id))


# ── Tool: update_progress ────────────────────────────────────────────────────
@mcp.tool()
def update_progress(
    user_id: str,
    lesson_id: str = None,
    chapter_id: str = None,
    quiz_id: str = None,
    quiz_score: int = None,
    quiz_total: int = None,
) -> dict:
    """
    Mark a lesson or chapter complete, or record a quiz score.
    Only call this after genuine completion — never for skipped content.

    Args:
        user_id:    Unique student identifier
        lesson_id:  Lesson ID to mark complete (e.g. 'ch01-l01')
        chapter_id: Chapter ID to mark complete (e.g. 'ch01')
        quiz_id:    Quiz ID to record score for (e.g. 'ch01')
        quiz_score: Number of correct answers
        quiz_total: Total number of questions
    """
    data = _load_progress()
    user_data = data.get(user_id, _default_progress(user_id))

    if lesson_id and lesson_id not in user_data["completed_lessons"]:
        user_data["completed_lessons"].append(lesson_id)

    if chapter_id and chapter_id not in user_data["completed_chapters"]:
        user_data["completed_chapters"].append(chapter_id)

    if quiz_id and quiz_score is not None and quiz_total is not None:
        user_data["quiz_scores"][quiz_id] = {
            "score": quiz_score,
            "total": quiz_total,
            "passed": quiz_score >= ceil(quiz_total * 0.7),
        }

    data[user_id] = user_data
    _save_progress(data)
    return user_data


# ── Tool: check_access ───────────────────────────────────────────────────────
@mcp.tool()
def check_access(user_id: str, chapter_id: str, is_premium: bool = False) -> dict:
    """
    Check if a student has access to a chapter based on their subscription tier.
    ALWAYS call this before delivering chapter content.

    Free tier: first 2 chapters only.
    Premium: all chapters.

    Args:
        user_id:    Unique student identifier
        chapter_id: Chapter identifier to check
        is_premium: Whether the student has an active premium subscription
    """
    chapters = read("chapters.json")
    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        return {"error": f"Chapter '{chapter_id}' not found"}

    if chapter["is_free"]:
        return {
            "user_id": user_id, "chapter_id": chapter_id,
            "has_access": True, "reason": "Chapter is free for all users",
            "is_premium": is_premium,
        }

    if is_premium:
        return {
            "user_id": user_id, "chapter_id": chapter_id,
            "has_access": True, "reason": "Premium subscriber — full access granted",
            "is_premium": True,
        }

    if chapter["order"] <= FREE_CHAPTER_LIMIT:
        return {
            "user_id": user_id, "chapter_id": chapter_id,
            "has_access": True,
            "reason": f"Chapter {chapter['order']} is within the free tier limit ({FREE_CHAPTER_LIMIT} chapters)",
            "is_premium": False,
        }

    return {
        "user_id": user_id, "chapter_id": chapter_id,
        "has_access": False,
        "reason": (
            f"Chapter {chapter['order']} requires a premium subscription. "
            "Upgrade at coursecompanion.ai/pricing to unlock all chapters."
        ),
        "is_premium": False,
    }


# ═══════════════════════════════════════════════════════════════════════════
# Phase 2 Tools — Hybrid Intelligence (Pro-gated, LLM-powered)
# These tools call the Claude API. They are isolated from Phase 1 tools.
# Cost: ~$0.014–0.018 per call (claude-sonnet-4-6).
# Gate: tier must be "pro" or "team"; raises error otherwise.
# ═══════════════════════════════════════════════════════════════════════════

_PRO_TIERS = {"pro", "team"}
_LLM_MODEL = "claude-sonnet-4-6"

def _anthropic_client():
    """Return an Anthropic client, or raise a clear error if key not set."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set. Add it to .env to use Phase 2 features.")
    import anthropic as _anthropic
    return _anthropic.Anthropic(api_key=api_key)


# ── Tool: get_adaptive_learning_path ────────────────────────────────────────
@mcp.tool()
def get_adaptive_learning_path(user_id: str, tier: str = "free") -> dict:
    """
    [PHASE 2 — PRO] Analyse the student's progress and generate a
    personalised learning path with prioritised chapter recommendations.

    Why LLM: Requires reasoning over quiz failure patterns, completion velocity,
    and cross-chapter knowledge dependencies — not achievable with rules.
    Estimated cost: ~$0.018 per call (claude-sonnet-4-6).

    Args:
        user_id: Unique student identifier
        tier:    Subscription tier — must be "pro" or "team"
    """
    if tier not in _PRO_TIERS:
        return {"error": "Adaptive learning path requires a Pro subscription ($19.99/mo). Upgrade at /pricing."}

    client = _anthropic_client()
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")
    user_progress = _load_progress().get(user_id, _default_progress(user_id))

    chapter_ctx = []
    for ch in chapters:
        cid = ch["id"]
        lessons = lessons_data.get(cid, [])
        done = sum(1 for l in lessons if l["id"] in user_progress["completed_lessons"])
        qdata = user_progress["quiz_scores"].get(cid, {})
        chapter_ctx.append({
            "id": cid, "title": ch["title"], "is_free": ch["is_free"],
            "total_lessons": len(lessons), "completed_lessons": done,
            "chapter_complete": cid in user_progress["completed_chapters"],
            "quiz_score": qdata.get("score"), "quiz_total": qdata.get("total"),
            "quiz_passed": qdata.get("passed", False),
        })

    prompt = f"""You are an expert educational advisor for an AI Agent Development course.
Student progress: {json.dumps(chapter_ctx)}
Lessons completed: {len(user_progress['completed_lessons'])} | Chapters done: {len(user_progress['completed_chapters'])}

Generate a personalised learning path. Respond ONLY with valid JSON (no fences):
{{"summary":"2-3 sentence assessment","recommendations":[{{"chapter_id":"ch01","chapter_title":"...","priority":"urgent|recommended|optional","reason":"data-backed reason","action":"specific step"}}],"next_action":"single most important action","estimated_completion":"realistic time estimate"}}
Max 3 recommendations. Only chapters with clear improvement opportunities."""

    msg = client.messages.create(model=_LLM_MODEL, max_tokens=600,
                                  messages=[{"role": "user", "content": prompt}])
    # Sonnet 4.6 pricing: $3.00/M input, $15.00/M output
    cost = round((msg.usage.input_tokens * 0.000003) + (msg.usage.output_tokens * 0.000015), 6)

    try:
        result = json.loads(msg.content[0].text.strip())
    except json.JSONDecodeError:
        return {"error": "AI returned malformed response. Please retry."}

    return {**result, "input_tokens": msg.usage.input_tokens,
            "output_tokens": msg.usage.output_tokens, "estimated_cost_usd": cost}


# ── Tool: submit_written_assessment ─────────────────────────────────────────
@mcp.tool()
def submit_written_assessment(
    chapter_id: str,
    user_id: str,
    question: str,
    student_answer: str,
    tier: str = "free",
) -> dict:
    """
    [PHASE 2 — PRO] Grade a student's free-form written answer with
    detailed LLM feedback, strengths analysis, and gap identification.

    Why LLM: Rule-based grading evaluates multiple-choice only. Free-form answers
    require reasoning about conceptual accuracy, misconceptions, and partial credit.
    Estimated cost: ~$0.014 per assessment (claude-sonnet-4-6).

    Args:
        chapter_id:     Chapter the question is from
        user_id:        Unique student identifier
        question:       The open-ended question posed to the student
        student_answer: The student's written response
        tier:           Subscription tier — must be "pro" or "team"
    """
    if tier not in _PRO_TIERS:
        return {"error": "LLM-graded assessments require a Pro subscription ($19.99/mo). Upgrade at /pricing."}
    if len(student_answer.strip()) < 10:
        return {"error": "Answer too short. Please write at least one complete sentence."}

    client = _anthropic_client()
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        return {"error": f"Chapter '{chapter_id}' not found."}

    lessons = lessons_data.get(chapter_id, [])
    context = "\n\n".join(f"Lesson: {l['title']}\n{l.get('body','')[:500]}" for l in lessons[:2])

    prompt = f"""You are an expert assessor for an AI Agent Development course.
Chapter: {chapter['title']} — {chapter.get('summary','')}
Course content: {context[:1000]}

Question: {question}
Student's answer: {student_answer}

Grade on accuracy, completeness, terminology, and depth. Respond ONLY with valid JSON (no fences):
{{"score":<0-100>,"grade":"<Excellent|Good|Partial|Needs Work>","feedback":"2-4 sentence specific feedback referencing their answer","strengths":["what they got right"],"gaps":["specific gap or misconception"],"hint":"1-2 sentence nudge toward ideal answer"}}
Scale: Excellent=90-100, Good=70-89, Partial=40-69, Needs Work=0-39."""

    msg = client.messages.create(model=_LLM_MODEL, max_tokens=500,
                                  messages=[{"role": "user", "content": prompt}])
    # Sonnet 4.6 pricing: $3.00/M input, $15.00/M output
    cost = round((msg.usage.input_tokens * 0.000003) + (msg.usage.output_tokens * 0.000015), 6)

    try:
        result = json.loads(msg.content[0].text.strip())
    except json.JSONDecodeError:
        return {"error": "AI returned malformed response. Please retry."}

    return {**result, "input_tokens": msg.usage.input_tokens,
            "output_tokens": msg.usage.output_tokens, "estimated_cost_usd": cost}


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run()
