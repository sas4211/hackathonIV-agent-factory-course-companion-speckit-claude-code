# Course Companion FTE — Work Log

**Topic:** AI Agent Development (Option A)
**Covers:** Claude Agent SDK, MCP, Agent Skills

---

## Phase Overview

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 | ChatGPT App Frontend + Deterministic FastAPI Backend | ✅ Complete |
| Phase 2 | Hybrid Backend with LLM Premium Features | ⏳ Pending |
| Phase 3 | Next.js Web App + Consolidated Backend | ⏳ Pending |

---

## Phase 1 — Deliverables Checklist

> **Core constraint:** Backend = pure data retrieval only. Zero LLM calls. All intelligence lives in ChatGPT.

| # | Task | Rule | Status |
|---|------|------|--------|
| 1 | Project structure + FastAPI skeleton | Foundation | ✅ |
| 2 | Content Delivery API — `GET /chapters/{id}` | Feature 1 | ✅ |
| 3 | Navigation API — `GET /chapters/{id}/next`, `/previous` | Feature 2 | ✅ |
| 4 | Search API (Grounded Q&A) — `GET /search?q=` | Feature 3 | ✅ |
| 5 | Rule-Based Quiz API — `POST /quizzes/{id}/submit` | Feature 4 | ✅ |
| 6 | Progress Tracking API — `PUT /progress/{user_id}` | Feature 5 | ✅ |
| 7 | Freemium Gate API — `GET /access/check` | Feature 6 | ✅ |
| 8 | ChatGPT Custom GPT spec + OpenAPI actions | Layer 3 | ✅ |
| 9 | LLM violation audit (zero tolerance) | Disqualification guard | ✅ |
| 10 | MCP Server — `backend/mcp_server.py` (10 tools, L6) | Layer 6 | ✅ |
| 11 | Frontend wired to live API (chapters, progress, quiz, search) | Phase 3 foundation | ✅ |
| 12 | `ChapterSummary` extended with `summary` + `lesson_count` | API completeness | ✅ |

---

## Phase 2 — Deliverables Checklist

| # | Task | Feature | Status |
|---|------|---------|--------|
| 1 | Hybrid backend: FastAPI + Claude API for premium features | Foundation | ✅ |
| 2 | Feature A: Adaptive Learning Path — `POST /adaptive/learning-path` | SK7 | ✅ |
| 3 | Feature B: LLM-Graded Assessments — `POST /assessment/{chapter_id}/submit` | SK8 | ✅ |
| 4 | Phase 2 MCP tools: `get_adaptive_learning_path`, `submit_written_assessment` | L6 | ✅ |
| 5 | Phase 2 skill files: `adaptive-path/SKILL.md`, `llm-assessment/SKILL.md` | Skills | ✅ |
| 6 | Premium-gated UI panel in dashboard (AI Features button + cards) | Phase 3 | ✅ |
| 7 | Cost tracking: tokens + USD per call returned in every response | Compliance | ✅ |

**Phase 2 Feature Decisions:**
- Feature A chosen: Adaptive Learning Path — requires multi-dimensional reasoning over student data; rules can rank but not explain.
- Feature B chosen: LLM-Graded Assessments — keyword matching cannot evaluate free-form conceptual understanding.
- Model: claude-haiku-4-5-20251001 (cost-optimised; ~$0.003–0.025/call)
- Phase 1 routes unchanged — zero LLM, no regression.

---

## Phase 3 — Deliverables Checklist

- [ ] Next.js / React web frontend (`/web`)
- [ ] Full LMS dashboard (progress visuals, lesson browser)
- [ ] Admin features (content management, analytics)
- [ ] Consolidated backend serving both frontends

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Course topic: AI Agent Development (Option A) | Team selection |
| 2026-03-24 | Start Phase 1: Backend + ChatGPT App | Per spec order |
| 2026-03-24 | OpenAPI spec at `backend/openapi_actions.yaml` | Standard ChatGPT Actions format |
| 2026-03-24 | Custom GPT prompt at `backend/chatgpt_system_prompt.md` | Defines tutor behavior + API usage rules |

---

## Blockers & Notes

_None yet._
