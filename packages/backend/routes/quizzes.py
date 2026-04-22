from fastapi import APIRouter, HTTPException
from models import QuizQuestion, QuizSubmission, QuizResult
from storage import read

router = APIRouter()


def _all_quizzes() -> dict:
    return read("quizzes.json")


@router.get("/{chapter_id}", response_model=list[QuizQuestion])
def get_quiz(chapter_id: str):
    """Fetch quiz questions for a chapter. Correct answers are NOT included in response."""
    quizzes = _all_quizzes()
    questions = quizzes.get(chapter_id)
    if questions is None:
        raise HTTPException(status_code=404, detail=f"No quiz found for chapter '{chapter_id}'")

    # Strip correct_index and explanation before returning to client
    return [
        QuizQuestion(
            id=q["id"],
            question=q["question"],
            options=q["options"],
            correct_index=-1,       # hidden from client
            explanation="",         # hidden until after submission
        )
        for q in questions
    ]


@router.post("/{chapter_id}/submit", response_model=QuizResult)
def submit_quiz(chapter_id: str, submission: QuizSubmission):
    """
    Submit quiz answers. Returns score and per-question feedback.
    Rule-based grading — no LLM involved.
    """
    quizzes = _all_quizzes()
    questions = quizzes.get(chapter_id)
    if questions is None:
        raise HTTPException(status_code=404, detail=f"No quiz found for chapter '{chapter_id}'")

    score = 0
    feedback = {}

    for q in questions:
        qid = q["id"]
        chosen = submission.answers.get(qid)
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
    passed = score >= round(total * 0.7)  # 70% pass threshold

    return QuizResult(score=score, total=total, passed=passed, feedback=feedback)
