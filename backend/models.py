from pydantic import BaseModel
from typing import Optional


class ChapterSummary(BaseModel):
    id: str
    title: str
    order: int
    is_free: bool
    summary: str = ""
    lesson_count: int = 0


class Lesson(BaseModel):
    id: str
    title: str
    body: str
    order: int


class Chapter(BaseModel):
    id: str
    title: str
    order: int
    is_free: bool
    summary: str
    lessons: list[Lesson]
    next_chapter_id: Optional[str] = None
    prev_chapter_id: Optional[str] = None


class SearchResult(BaseModel):
    chapter_id: str
    chapter_title: str
    lesson_id: str
    lesson_title: str
    snippet: str
    score: float


class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_index: int
    explanation: str


class QuizSubmission(BaseModel):
    answers: dict[str, int]  # question_id -> chosen option index


class QuizResult(BaseModel):
    score: int
    total: int
    passed: bool
    feedback: dict[str, dict]  # question_id -> {correct, chosen, explanation}


class ProgressUpdate(BaseModel):
    chapter_id: Optional[str] = None
    lesson_id: Optional[str] = None
    quiz_id: Optional[str] = None
    quiz_score: Optional[int] = None
    quiz_total: Optional[int] = None


class UserProgress(BaseModel):
    user_id: str
    completed_lessons: list[str]
    completed_chapters: list[str]
    quiz_scores: dict[str, dict]  # quiz_id -> {score, total, passed}


class AccessCheckResponse(BaseModel):
    user_id: str
    chapter_id: str
    has_access: bool
    reason: str
    is_premium: bool
