import type {
  Chapter,
  ChapterSummary,
  SearchResult,
  QuizQuestion,
  QuizResult,
  UserProgress,
  ProgressUpdate,
  AccessCheckResponse,
  LearningPathResponse,
  AssessmentResponse,
} from "./types";

// In development and production the browser calls /api/* which Next.js
// proxies to the FastAPI backend (configured via BACKEND_URL in next.config.js).
// Override NEXT_PUBLIC_API_URL only if you need to point at a remote backend.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// ── Shared fetch helper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(
      `API error ${res.status} at ${path}: ${errorText}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Chapters ──────────────────────────────────────────────────────────────────

export async function listChapters(): Promise<ChapterSummary[]> {
  return apiFetch<ChapterSummary[]>("/chapters");
}

export async function getChapter(id: string): Promise<Chapter> {
  return apiFetch<Chapter>(`/chapters/${encodeURIComponent(id)}`);
}

export async function nextChapter(id: string): Promise<Chapter> {
  return apiFetch<Chapter>(`/chapters/${encodeURIComponent(id)}/next`);
}

export async function previousChapter(id: string): Promise<Chapter> {
  return apiFetch<Chapter>(
    `/chapters/${encodeURIComponent(id)}/previous`
  );
}

// ── Search ────────────────────────────────────────────────────────────────────

export async function searchContent(q: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({ q });
  return apiFetch<SearchResult[]>(`/search?${params.toString()}`);
}

// ── Quizzes ───────────────────────────────────────────────────────────────────

export async function getQuiz(chapterId: string): Promise<QuizQuestion[]> {
  return apiFetch<QuizQuestion[]>(
    `/quizzes/${encodeURIComponent(chapterId)}`
  );
}

export async function submitQuiz(
  chapterId: string,
  answers: Record<string, number>
): Promise<QuizResult> {
  return apiFetch<QuizResult>(
    `/quizzes/${encodeURIComponent(chapterId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({ answers }),
    }
  );
}

// ── Progress ──────────────────────────────────────────────────────────────────

export async function getProgress(userId: string): Promise<UserProgress> {
  return apiFetch<UserProgress>(
    `/progress/${encodeURIComponent(userId)}`
  );
}

export async function updateProgress(
  userId: string,
  update: ProgressUpdate
): Promise<UserProgress> {
  return apiFetch<UserProgress>(
    `/progress/${encodeURIComponent(userId)}`,
    {
      method: "PUT",
      body: JSON.stringify(update),
    }
  );
}

// ── Access control ────────────────────────────────────────────────────────────

export async function checkAccess(
  userId: string,
  chapterId: string,
  isPremium: boolean
): Promise<AccessCheckResponse> {
  const params = new URLSearchParams({
    user_id: userId,
    chapter_id: chapterId,
    is_premium: String(isPremium),
  });
  return apiFetch<AccessCheckResponse>(`/access/check?${params.toString()}`);
}

// ── Phase 2: Adaptive Learning Path ──────────────────────────────────────────

export async function getAdaptiveLearningPath(
  userId: string,
  tier: string
): Promise<LearningPathResponse> {
  return apiFetch<LearningPathResponse>("/adaptive/learning-path", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, tier }),
  });
}

// ── Phase 2: LLM Assessment ───────────────────────────────────────────────────

export async function submitAssessment(
  chapterId: string,
  userId: string,
  tier: string,
  question: string,
  studentAnswer: string
): Promise<AssessmentResponse> {
  return apiFetch<AssessmentResponse>(
    `/assessment/${encodeURIComponent(chapterId)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        tier,
        question,
        student_answer: studentAnswer,
      }),
    }
  );
}
