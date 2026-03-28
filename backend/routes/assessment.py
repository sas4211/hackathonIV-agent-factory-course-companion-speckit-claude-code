"""
Phase 2 — Hybrid Feature B: LLM-Graded Assessments
====================================================
Premium-gated. User-initiated. Cleanly isolated from Phase 1 routes.

WHY LLM IS NECESSARY (cannot be zero-LLM):
    Rule-based grading (Phase 1) evaluates multiple-choice answers deterministically.
    Free-form written answers require reasoning about:
    - Conceptual accuracy — is the student's understanding correct?
    - Completeness — did they address all key aspects?
    - Misconceptions — what specific wrong ideas are present?
    - Partial credit — how close is a partially-correct answer?
    Keyword matching cannot distinguish "agents maintain state" (correct)
    from "agents are stateful by default" (subtly wrong in many contexts).

Estimated cost: ~$0.014 per assessment (claude-sonnet-4-6, ~1,500 tokens)
Cost gate:      Pro tier only ($19.99/mo+) — Phase 2 is NOT included in Premium ($9.99)
"""
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import anthropic
from config import ANTHROPIC_API_KEY
from storage import read

router = APIRouter()

PRO_TIERS = {"pro", "team"}
LLM_MODEL  = "claude-sonnet-4-6"


# ── Models ───────────────────────────────────────────────────────────────────

class AssessmentRequest(BaseModel):
    user_id: str
    tier: str = "free"     # "free" | "premium" | "pro" | "team"
    question: str          # The open-ended question posed to the student
    student_answer: str    # The student's free-form written response


class AssessmentResponse(BaseModel):
    score: int             # 0–100
    grade: str             # "Excellent" | "Good" | "Partial" | "Needs Work"
    feedback: str          # 2–4 sentences of specific, constructive feedback
    strengths: list[str]   # What the student got right
    gaps: list[str]        # Specific gaps or misconceptions
    hint: str              # Nudge toward ideal answer (not a giveaway)
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/{chapter_id}/submit", response_model=AssessmentResponse)
def submit_assessment(chapter_id: str, request: AssessmentRequest):
    """
    Grade a student's free-form written answer with detailed LLM feedback.

    Pro-only. Calls claude-sonnet-4-6 with ~900 input tokens.
    Grounding: chapter content is injected for accurate, curriculum-aligned grading.
    """
    # ── Pro gate (Pro + Team tiers only — NOT included in $9.99 Premium) ─────
    if request.tier not in PRO_TIERS:
        raise HTTPException(
            status_code=402,
            detail=(
                "LLM-graded assessments require a Pro subscription ($19.99/mo). "
                "Upgrade at /pricing to unlock AI-powered written answer grading."
            ),
        )

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured (ANTHROPIC_API_KEY missing).")

    if not request.student_answer or len(request.student_answer.strip()) < 10:
        raise HTTPException(status_code=400, detail="Answer is too short. Please write at least one sentence.")

    # ── Load chapter content for grounding ────────────────────────────────────
    chapters = read("chapters.json")
    lessons_data = read("lessons.json")

    chapter = next((c for c in chapters if c["id"] == chapter_id), None)
    if not chapter:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found.")

    lessons = lessons_data.get(chapter_id, [])
    # Use first 2 lessons, truncated — cost control
    context_parts = [
        f"Lesson: {l['title']}\n{l.get('body', '')[:600]}"
        for l in lessons[:2]
    ]
    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""You are an expert educational assessor for an AI Agent Development course.

Chapter being assessed: {chapter["title"]}
Chapter summary: {chapter.get("summary", "")}

Relevant course content (for grading reference):
{context}

---

Question asked to the student:
{request.question}

Student's written answer:
{request.student_answer}

---

Grade the answer on conceptual accuracy, completeness, correct use of terminology, and depth of understanding.

Respond with ONLY valid JSON (no markdown fences):
{{
  "score": <integer 0–100>,
  "grade": "<Excellent|Good|Partial|Needs Work>",
  "feedback": "<2–4 sentences of specific, constructive feedback that references what the student actually wrote>",
  "strengths": ["<specific thing they got right>", "<another strength if present>"],
  "gaps": ["<specific gap or misconception>", "<another if present>"],
  "hint": "<1–2 sentence nudge toward the ideal answer without giving it away>"
}}

Grade scale: Excellent = 90–100, Good = 70–89, Partial = 40–69, Needs Work = 0–39.
Be encouraging but honest. Reference specific phrases from the student's answer."""

    # ── LLM call ─────────────────────────────────────────────────────────────
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    message = client.messages.create(
        model=LLM_MODEL,
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )

    input_tokens  = message.usage.input_tokens
    output_tokens = message.usage.output_tokens
    # Sonnet 4.6 pricing: $3.00/M input, $15.00/M output
    cost = round((input_tokens * 0.000003) + (output_tokens * 0.000015), 6)

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

    return AssessmentResponse(
        score=int(result.get("score", 0)),
        grade=result.get("grade", "Needs Work"),
        feedback=result.get("feedback", ""),
        strengths=result.get("strengths", []),
        gaps=result.get("gaps", []),
        hint=result.get("hint", ""),
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        estimated_cost_usd=cost,
    )
