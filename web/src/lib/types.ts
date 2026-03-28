// ── Core content types ────────────────────────────────────────────────────────

export interface ChapterSummary {
  id: string;
  title: string;
  order: number;
  is_free: boolean;
  summary: string;
  lesson_count: number;
}

export interface Lesson {
  id: string;
  title: string;
  body: string;
  order: number;
}

export interface Chapter extends ChapterSummary {
  lessons: Lesson[];
  next_chapter_id: string | null;
  prev_chapter_id: string | null;
}

// ── Progress types ────────────────────────────────────────────────────────────

export interface QuizScoreEntry {
  score: number;
  total: number;
  passed: boolean;
}

export interface UserProgress {
  user_id: string;
  completed_lessons: string[];
  completed_chapters: string[];
  quiz_scores: Record<string, QuizScoreEntry>;
}

export interface ProgressUpdate {
  chapter_id?: string;
  lesson_id?: string;
  quiz_id?: string;
  quiz_score?: number;
  quiz_total?: number;
}

// ── Quiz types ────────────────────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizFeedbackEntry {
  correct: boolean;
  chosen_index: number;
  correct_index: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  feedback: Record<string, QuizFeedbackEntry>;
}

// ── Search types ──────────────────────────────────────────────────────────────

export interface SearchResult {
  chapter_id: string;
  chapter_title: string;
  lesson_id: string;
  lesson_title: string;
  snippet: string;
  score: number;
}

// ── Access control types ──────────────────────────────────────────────────────

export interface AccessCheckResponse {
  user_id: string;
  chapter_id: string;
  has_access: boolean;
  reason: string;
  is_premium: boolean;
}

// ── Phase 2 AI types ──────────────────────────────────────────────────────────

export interface Recommendation {
  chapter_id: string;
  chapter_title: string;
  priority: "urgent" | "recommended" | "optional";
  reason: string;
  action: string;
}

export interface LearningPathResponse {
  summary: string;
  recommendations: Recommendation[];
  next_action: string;
  estimated_completion: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
}

export interface AssessmentResponse {
  score: number;
  grade: string;
  feedback: string;
  strengths: string[];
  gaps: string[];
  hint: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
}

// ── App-level types ───────────────────────────────────────────────────────────

export type UserTier = "free" | "premium" | "pro" | "team";

export interface AppUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  tier: UserTier;
  isAdmin: boolean;
}
