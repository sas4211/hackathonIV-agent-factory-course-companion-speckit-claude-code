# Course Companion FTE — Skills Spec

## Purpose

Skills define the capabilities the Course Companion FTE agent must possess. Each skill maps to one or more API actions and a behavior pattern the GPT must follow.

---

## Skill Index

| Skill ID | Skill Name | Phase | API Actions |
|----------|-----------|-------|-------------|
| SK1 | Content Delivery | 1 | `getChapter`, `listChapters` |
| SK2 | Navigation | 1 | `nextChapter`, `previousChapter` |
| SK3 | Grounded Search | 1 | `searchContent` |
| SK4 | Quiz Administration | 1 | `getQuiz`, `submitQuiz` |
| SK5 | Progress Tracking | 1 | `getProgress`, `updateProgress` |
| SK6 | Freemium Gate | 1 | `checkAccess` |
| SK7 | Adaptive Tutoring | 2 | Claude API + `getProgress` |
| SK8 | Personalized Paths | 2 | Claude API + `listChapters` |
| SK9 | Web Dashboard | 3 | All endpoints + auth |

---

## SK1 — Content Delivery

**Trigger:** Student asks to start a lesson, view a chapter, or read content.

**Behavior:**
1. Call `checkAccess` first — do not skip.
2. If access granted, call `getChapter` and present the first lesson.
3. Present one lesson at a time; offer to continue to the next.
4. Summarize key concepts at the end of each lesson.

**Output format:** Lesson title as heading, body as prose, followed by "Ready for a quick check? I can quiz you on this." prompt.

---

## SK2 — Navigation

**Trigger:** Student says "next", "previous", "go back", "move on", or similar.

**Behavior:**
1. Call `nextChapter` or `previousChapter` based on intent.
2. Call `checkAccess` on the target chapter before delivering content.
3. If no next/previous chapter exists, inform the student gracefully.

---

## SK3 — Grounded Search

**Trigger:** Student asks a question that could be answered by course content.

**Behavior:**
1. Extract key terms from the question.
2. Call `searchContent` with those terms.
3. Ground the answer in the returned snippets — cite lesson title and chapter.
4. If no results, say "That topic may not be covered in this course yet."

**Constraint:** Do not answer from memory if `searchContent` returns a relevant result.

---

## SK4 — Quiz Administration

**Trigger:** Student asks for a quiz, practice questions, or to test themselves.

**Behavior:**
1. Call `getQuiz` for the current chapter.
2. Present questions one at a time with lettered options (A, B, C, D).
3. Collect all answers before grading — do not reveal correct answers mid-quiz.
4. Call `submitQuiz` with all collected answers.
5. Share score, pass/fail, and explanation for each question.
6. If passed: call `updateProgress` with quiz result.
7. If failed: offer to review the relevant lessons before retrying.

---

## SK5 — Progress Tracking

**Trigger:** Student completes a lesson or chapter; quiz is passed; student asks "how am I doing?"

**Behavior:**
1. After lesson completion → call `updateProgress` with `lesson_id`.
2. After all lessons in a chapter → call `updateProgress` with `chapter_id`.
3. After quiz pass → call `updateProgress` with `quiz_id`, `quiz_score`, `quiz_total`.
4. When student asks for progress → call `getProgress` and present a summary.

**Output format:** "You've completed X of Y lessons. Quiz scores: [list]. Next up: [chapter title]."

---

## SK6 — Freemium Gate

**Trigger:** Student attempts to access any chapter.

**Behavior:**
1. Always call `checkAccess` before delivering content.
2. If `has_access: false` → explain the chapter is premium, show what free chapters are available.
3. Upgrade prompt: "To unlock all chapters, upgrade to premium. Chapters 1–2 are always free!"
4. Never reveal premium content to free users under any circumstances.

---

## SK7 — Adaptive Tutoring (Phase 2)

**Trigger:** Premium student fails a quiz or requests an explanation.

**Behavior:**
1. Retrieve student's `getProgress` to understand performance history.
2. Use Claude API to generate a tailored re-explanation at appropriate difficulty.
3. Gate this feature: if student is not premium, offer the standard lesson re-read instead.

---

## SK8 — Personalized Learning Paths (Phase 2)

**Trigger:** Premium student asks "what should I study next?" or "create a study plan."

**Behavior:**
1. Call `listChapters` and `getProgress`.
2. Use Claude API to generate a recommended study sequence based on completion and quiz scores.
3. Present as an ordered checklist with estimated time per chapter.

---

## SK9 — Web Dashboard (Phase 3)

**Trigger:** Student logs into the web app.

**Behavior:**
1. Authenticate via session/JWT (replaces `is_premium` flag).
2. Display progress dashboard: completed lessons, quiz scores, next recommended chapter.
3. Admin users see content management panel and aggregate analytics.
