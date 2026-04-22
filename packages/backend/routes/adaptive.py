"""
Phase 2 — Hybrid Feature A: Adaptive Learning Path
====================================================
Premium-gated. User-initiated. Cleanly isolated from Phase 1 routes.

WHY LLM IS NECESSARY (cannot be zero-LLM):
    Personalising a learning path requires multi-dimensional reasoning:
    - Quiz failure patterns (which concepts are weak?)
    - Completion velocity (lessons/week) to estimate finishing time
    - Cross-chapter dependency inference (ch03 builds on ch01)
    - Generating *why* a specific chapter is the priority for *this* student
    A rule-based system can sort chapters by order; it cannot explain
    which knowledge gaps to close first or adapt to individual learning signals.

Estimated cost: ~$0.018 per request (claude-sonnet-4-6, ~2,000 tokens)
Cost gate:      Pro tier only ($19.99/mo+) — Phase 2 is NOT included in Premium ($9.99)
"""
import json
from math import ceil
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import google.generativeai as genai
from config import GEMINI_API_KEY
from storage import read

router = APIRouter()

PROGRESS_FILE = Path(__file__).parent.parent / "data" / "progress.json"


# ── Models ───────────────────────────────────────────────────────────────────

PRO_TIERS = {"pro", "team"}
LLM_MODEL  = "gemini-1.5-pro"   # Phase 2 uses Gemini Pro


class LearningPathRequest(BaseModel):
    user_id: str
    tier: str = "free"   # "free" | "premium" | "pro" | "team"


class Recommendation(BaseModel):
    chapter_id: str
    chapter_title: str
    priority: str          # "urgent" | "recommended" | "optional"
    reason: str
    action: str            # concrete step: "review lesson X", "retake quiz"


class LearningPathResponse(BaseModel):
    summary: str
    recommendations: list[Recommendation]
    next_action: str
    estimated_completion: str
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/learning-path", response_model=LearningPathResponse)
def get_learning_path(request: LearningPathRequest):
    """
    Analyse student progress and return a personalised learning path.

    Pro-only. Calls claude-sonnet-4-6 with ~700 input tokens.
    Isolated from Phase 1 routes — no shared state.
    """
    # ── Pro gate (Pro + Team tiers only — NOT included in $9.99 Premium) ─────
    if request.tier not in PRO_TIERS:
        raise HTTPException(
            status_code=402,
            detail=(
                "Adaptive learning path requires a Pro subscription ($19.99/mo). "
                "Upgrade at /pricing to unlock AI-powered personalised recommendations."
            ),
        )

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured (ANTHROPIC_API_KEY missing).")

    # ── Load data ─────────────────────────────────────────────────────────────
    all_progress: dict = json.loads(PROGRESS_FILE.read_text(encoding="utf-8")) if PROGRESS_FILE.exists() else {}
    user_progress = all_progress.get(request.user_id, {
        "completed_lessons": [], "completed_chapters": [], "quiz_scores": {},
    })
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    # ── Build compact context (no full lesson bodies — cost control) ──────────
    chapter_ctx = []
    for ch in chapters:
        cid = ch["id"]
        lessons = lessons_data.get(cid, [])
        done_lessons = [l["id"] for l in lessons if l["id"] in user_progress.get("completed_lessons", [])]
        qdata = user_progress.get("quiz_scores", {}).get(cid, {})
        chapter_ctx.append({
            "id": cid,
            "title": ch["title"],
            "is_free": ch["is_free"],
            "total_lessons": len(lessons),
            "completed_lessons": len(done_lessons),
            "chapter_complete": cid in user_progress.get("completed_chapters", []),
            "quiz_score": qdata.get("score"),
            "quiz_total": qdata.get("total"),
            "quiz_passed": qdata.get("passed", False),
        })

    prompt = f"""You are an expert educational advisor for an AI Agent Development course.

Student progress across {len(chapters)} chapters:
{json.dumps(chapter_ctx, indent=2)}

Total lessons completed: {len(user_progress.get("completed_lessons", []))}
Total chapters completed: {len(user_progress.get("completed_chapters", []))}
Quiz scores on record: {len(user_progress.get("quiz_scores", {}))}

Analyse this student's data and generate a focused, personalised learning path.
Consider: incomplete chapters, failed quizzes (score < 70%), knowledge gaps, optimal sequence.

Respond with ONLY valid JSON (no markdown, no code fences):
{{
  "summary": "2-3 sentences assessing current state, naming specific strengths and gaps",
  "recommendations": [
    {{
      "chapter_id": "ch01",
      "chapter_title": "Introduction to AI Agents",
      "priority": "urgent",
      "reason": "specific data-backed reason referencing their actual scores/completion",
      "action": "specific step: re-read lesson X, retake quiz, start chapter"
    }}
  ],
  "next_action": "The single most impactful thing to do right now (1 sentence)",
  "estimated_completion": "Realistic estimate based on current velocity, e.g. '3 weeks at current pace'"
}}

Rules: max 3 recommendations; only include chapters with clear improvement opportunities; priority must be urgent/recommended/optional."""

    # ── LLM call ─────────────────────────────────────────────────────────────
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(LLM_MODEL)
    response = model.generate_content(prompt)

    # Extract token usage and cost (approximate)
    input_tokens = response.usage_metadata.prompt_token_count
    output_tokens = response.usage_metadata.candidates_token_count
    # Gemini 1.5 Pro pricing: $0.00125K input, $0.00375K output (per 1K tokens)
    cost = round((input_tokens * 0.00000125) + (output_tokens * 0.00000375), 6)

    # ── Parse response ────────────────────────────────────────────────────────
    raw = message.content[0].text.strip()
    # Strip markdown code fences if the model wrapped the JSON
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed JSON. Please retry.")

    return LearningPathResponse(
        summary=result.get("summary", ""),
        recommendations=[Recommendation(**r) for r in result.get("recommendations", [])],
        next_action=result.get("next_action", ""),
        estimated_completion=result.get("estimated_completion", ""),
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost_usd=cost,
    )
