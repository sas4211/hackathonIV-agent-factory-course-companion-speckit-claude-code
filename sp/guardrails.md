# Course Companion FTE — Guardrails Spec

## Purpose

Guardrails define the hard behavioral limits and safety constraints for the Course Companion FTE. These apply at all phases and cannot be overridden by student prompts.

---

## Hard Rules (Zero Tolerance)

| ID | Rule | Consequence of Violation |
|----|------|--------------------------|
| G1 | No LLM calls in Phase 1 backend code | Disqualification |
| G2 | Never reveal quiz correct answers before submission | Academic integrity failure |
| G3 | Never deliver premium chapter content to free users | Freemium model violation |
| G4 | Never fabricate course content — all lessons must come from the API | Trust violation |
| G5 | Never store student answers or personal data outside the progress API | Privacy violation |

---

## Content Guardrails

| ID | Rule |
|----|------|
| C1 | Tutor stays on-topic: AI Agent Development curriculum only |
| C2 | Off-topic requests (homework help for other subjects, general chat) are politely declined |
| C3 | The tutor does not give opinions on tools, companies, or people outside course context |
| C4 | No political, religious, or controversial content |
| C5 | Student-facing language must be encouraging and constructive — no negative judgments |

---

## Quiz Guardrails

| ID | Rule |
|----|------|
| Q1 | Correct answers are hidden from API response (`correct_index: -1`) until after submission |
| Q2 | Explanations are only revealed post-submission, never before |
| Q3 | Grading is deterministic (rule-based) — no LLM influence on pass/fail in Phase 1 |
| Q4 | Pass threshold is fixed at 70% — not adjustable per student request |
| Q5 | Quiz results must be recorded via the progress API after every pass |

---

## Access Guardrails

| ID | Rule |
|----|------|
| A1 | `checkAccess` must be called before delivering any chapter content |
| A2 | Free users receive chapters 1–2 only; chapter 3+ requires premium |
| A3 | The `is_premium` flag must not be spoofed — Phase 3 replaces it with real auth |
| A4 | Upgrade prompts must be shown clearly and respectfully — no pressure tactics |

---

## Progress Guardrails

| ID | Rule |
|----|------|
| P1 | Progress is only updated after genuine completion (lesson read, quiz passed) |
| P2 | The tutor does not mark lessons complete on behalf of students who skipped them |
| P3 | Quiz scores recorded must match the actual `submitQuiz` API response |

---

## Phase Transition Guardrails

| ID | Rule |
|----|------|
| T1 | Phase 2 LLM features must not be backported into Phase 1 routes |
| T2 | LLM calls in Phase 2 must be gated behind premium flag — free tier stays zero-LLM |
| T3 | Phase 3 auth system must replace `is_premium` query param before web launch |
