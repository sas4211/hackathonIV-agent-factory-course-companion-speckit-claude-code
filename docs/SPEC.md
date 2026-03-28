# Course Companion FTE — Specification Document

**Version:** 2.0
**Date:** 2026-03-25
**Topic:** AI Agent Development

---

## 1. Product Vision

Course Companion FTE is a Digital Full-Time Employee — an AI tutoring system that
operates 24/7, serves unlimited concurrent students, and delivers 99%+ consistency
at 85–90% cost savings versus human tutors.

The system is built using the **Agent Factory** pattern:

```
Spec Layer (Team)         → writes requirements, guardrails, skills
General Agent (Claude)    → reads spec, manufactures custom agent code
Custom Agent (FTE)        → deployed to production, serves students
```

---

## 2. Personas

| Persona | Access | Description |
|---|---|---|
| Free Student | Chapters 1–3 | Upgrade prompt on locked content |
| Premium Student | All chapters ($9.99/mo) | Full content access |
| Pro Student | Premium + AI features ($19.99/mo) | Adaptive path + LLM assessments |
| Team Student | Pro + seats ($49.99/mo) | Organisation-wide access |
| Admin | Full | Content management + analytics (Phase 3) |

---

## 3. Architecture Overview

Course Companion FTE is a **three-phase hybrid system**:

### Phase 1 — Zero-Backend-LLM
```
Student → ChatGPT App (intelligence) → FastAPI Backend (data only)
```
- Backend: pure data retrieval, zero LLM calls
- Intelligence: lives entirely in the ChatGPT Custom GPT
- Cost model: flat infrastructure, $0 AI inference

### Phase 2 — Hybrid Intelligence
```
Student → ChatGPT App → Backend
                         ├─ Phase 1 routes (zero LLM)
                         └─ Phase 2 routes (LLM, Pro-gated)
```
- Selective LLM calls for tasks rules cannot solve
- Isolated from Phase 1 routes — no shared state
- Cost: ~$0.014–0.018 per Pro feature call

### Phase 3 — Standalone Web App
```
Student → Next.js Frontend → Consolidated Backend (Phase 1 + 2)
Admin   → Admin Panel      ↗
```
- Full LMS accessible without ChatGPT
- Unified backend serves both frontends

---

## 4. 8-Layer Architecture

| Layer | Component | Description |
|---|---|---|
| L1 | Spec files (`sp/`) | Requirements, guardrails, skills |
| L2 | Agent factory logic | Claude Code manufactures agents from spec |
| L3 | ChatGPT Custom GPT | Student-facing tutor (Phase 1 frontend) |
| L4 | FastAPI backend | Content, quiz, progress, access APIs |
| L5 | Data layer | Cloudflare R2 (prod) / local JSON (dev) |
| L6 | MCP Server | 12-tool server for agent-to-backend bridge |
| L7 | Phase 2 LLM routes | Adaptive path + assessment (Pro-gated) |
| L8 | Web frontend | Vanilla HTML SPA → Next.js (Phase 3) |

---

## 5. Phase 1 — Feature Specification

**Constraint:** Backend has ZERO LLM API calls.

| ID | Endpoint | Feature |
|---|---|---|
| F1 | `GET /chapters/{id}` | Content delivery with lessons |
| F2 | `GET /chapters/{id}/next`, `/previous` | Chapter navigation |
| F3 | `GET /search?q=` | Keyword search across all lessons |
| F4 | `POST /quizzes/{id}/submit` | Rule-based quiz grading (70% pass) |
| F5 | `PUT /progress/{user_id}` | Progress tracking (lessons, chapters, quizzes) |
| F6 | `GET /access/check` | Freemium gate — free vs premium |
| F7 | ChatGPT Custom GPT | OpenAPI actions + system prompt |
| F8 | MCP Server | 10-tool bridge for agent integration (L6) |

---

## 6. Phase 2 — Hybrid Feature Specification

**Constraint:** Maximum 2 hybrid features. Pro tier only. User-initiated.

### Feature A — Adaptive Learning Path
- **Endpoint:** `POST /adaptive/learning-path`
- **Model:** Claude Sonnet 4.6
- **Gate:** `tier` must be `"pro"` or `"team"`
- **Why LLM:** Personalising a path requires reasoning over quiz failure patterns,
  completion velocity, and cross-chapter knowledge dependencies. Rules can sort;
  they cannot explain which gaps to close first.
- **Input:** User ID + subscription tier → student progress data (~1,400 tokens)
- **Output:** Summary + 3 prioritised recommendations + next action + ETA
- **Cost:** ~$0.018 per call

### Feature B — LLM-Graded Assessments
- **Endpoint:** `POST /assessment/{chapter_id}/submit`
- **Model:** Claude Sonnet 4.6
- **Gate:** `tier` must be `"pro"` or `"team"`
- **Why LLM:** Keyword matching cannot evaluate conceptual accuracy, partial credit,
  or nuanced misconceptions in free-form written answers.
- **Input:** Question + student answer + chapter context (~1,100 tokens)
- **Output:** Score (0–100), grade, feedback, strengths, gaps, hint
- **Cost:** ~$0.014 per assessment

---

## 7. Data Models

### Chapter
```json
{
  "id": "ch01",
  "title": "Introduction to AI Agents",
  "order": 1,
  "is_free": true,
  "summary": "...",
  "next_chapter_id": "ch02",
  "prev_chapter_id": null
}
```

### Lesson
```json
{
  "id": "ch01-l01",
  "title": "What is an AI Agent?",
  "body": "...",
  "order": 1
}
```

### UserProgress
```json
{
  "user_id": "user_abc",
  "completed_lessons": ["ch01-l01", "ch01-l02"],
  "completed_chapters": ["ch01"],
  "quiz_scores": {
    "ch01": { "score": 4, "total": 5, "passed": true }
  }
}
```

---

## 8. Subscription Tiers

| Tier | Price | Chapters | Phase 2 AI |
|---|---|---|---|
| Free | $0 | First 3 | ❌ |
| Premium | $9.99/mo | All | ❌ |
| Pro | $19.99/mo | All | ✅ |
| Team | $49.99/mo | All + seats | ✅ |

---

## 9. MCP Server — Tool Registry

| Tool | Phase | Type |
|---|---|---|
| `list_chapters` | 1 | Deterministic |
| `get_chapter` | 1 | Deterministic |
| `next_chapter` | 1 | Deterministic |
| `previous_chapter` | 1 | Deterministic |
| `search_content` | 1 | Deterministic |
| `get_quiz` | 1 | Deterministic |
| `submit_quiz` | 1 | Deterministic |
| `get_progress` | 1 | Deterministic |
| `update_progress` | 1 | Deterministic |
| `check_access` | 1 | Deterministic |
| `get_adaptive_learning_path` | 2 | LLM (Pro) |
| `submit_written_assessment` | 2 | LLM (Pro) |

---

## 10. Guardrails

See `sp/guardrails.md` for full detail. Key rules:

- Never invent lesson content — always retrieve from API
- Always check access before delivering paid content
- Never reveal quiz answers before submission
- Phase 2 LLM calls only for Pro/Team subscribers
- All state persists in the backend — agent holds no memory

---

## 11. Skills Registry

| Skill | Phase | Trigger |
|---|---|---|
| `quiz-master` | 1 | "take a quiz", "test me" |
| `concept-explainer` | 1 | "explain", "what is", "how does" |
| `socratic-tutor` | 1 | "help me understand", "I'm confused" |
| `progress-motivator` | 1 | "how am I doing", "my progress" |
| `adaptive-path` | 2 | "what should I study", "learning plan" |
| `llm-assessment` | 2 | "grade my answer", "written test" |

---

## 12. Scale Targets

| Metric | Target |
|---|---|
| Concurrent students | 10,000+ |
| Sessions/month | 50,000+ |
| Cost per session (Phase 1) | < $0.002 |
| Cost per Pro call (Phase 2) | < $0.020 |
| Uptime | 99%+ |
| Consistency | 99%+ (enforced via guardrails) |
| Languages | 50+ (via ChatGPT/Claude multilingual) |
