# Course Companion FTE — Requirements Spec

## Product Vision

A Digital Full-Time Equivalent (FTE) educational tutor that operates 24/7, serves unlimited concurrent students, and delivers 99%+ consistency at 85–90% cost savings versus human tutors.

---

## Personas

| Persona | Description |
|---------|-------------|
| **Student** | Enrolled learner accessing course content, quizzes, and tutoring |
| **Free Student** | Access to first 2 chapters only; upgrade prompt on locked content |
| **Premium Student** | Full access to all chapters, adaptive features (Phase 2+) |
| **Admin** | Content manager and analytics viewer (Phase 3) |

---

## Phase 1 — Zero-Backend-LLM (ChatGPT App)

**Core Constraint:** Backend = pure data retrieval. Zero LLM calls. All intelligence lives in ChatGPT.

### Functional Requirements

| ID | Requirement |
|----|-------------|
| F1 | Deliver chapter content via `GET /chapters/{id}` |
| F2 | Navigate between chapters via `/next` and `/previous` |
| F3 | Keyword search across all lesson content via `GET /search?q=` |
| F4 | Rule-based quiz grading via `POST /quizzes/{id}/submit` (70% pass threshold) |
| F5 | Progress tracking — mark lessons, chapters, and quiz results via `PUT /progress/{user_id}` |
| F6 | Freemium gate — block paid chapters for free users via `GET /access/check` |
| F7 | ChatGPT Custom GPT with OpenAPI actions pointing to the backend |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| N1 | Zero LLM API calls in backend code (disqualification if violated) |
| N2 | API response time < 300ms for all content endpoints |
| N3 | OpenAPI spec must be valid and importable into ChatGPT Actions |
| N4 | CORS enabled for ChatGPT and web origins |

---

## Phase 2 — Hybrid Backend (LLM Premium Features)

**Core Constraint:** LLM calls only for premium features; free tier remains zero-LLM.

| ID | Requirement |
|----|-------------|
| F8 | Adaptive difficulty — adjust quiz/explanation based on student performance history |
| F9 | Personalized learning path recommendations via Claude API |
| F10 | AI-generated hints and explanations for failed quiz questions |
| F11 | Premium gate enforcement — LLM features require active premium subscription |

---

## Phase 3 — Standalone Web App (Next.js)

**Core Constraint:** Full-featured LMS accessible without ChatGPT.

| ID | Requirement |
|----|-------------|
| F12 | Next.js frontend with lesson browser, quiz interface, progress dashboard |
| F13 | Admin panel — content management, student analytics |
| F14 | Single consolidated backend serving both ChatGPT and web frontends |
| F15 | Authentication system (session or JWT) replacing the `is_premium` flag |

---

## Scale Targets

| Metric | Target |
|--------|--------|
| Concurrent students | 10,000+ |
| Sessions per month | 50,000+ |
| Cost per session | < $0.50 |
| Uptime | 99%+ |
| Languages supported | 50+ (via ChatGPT/Claude multilingual capability) |
| Consistency | 99%+ (enforced via guardrails) |
