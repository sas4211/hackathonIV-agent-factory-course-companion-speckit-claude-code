# Course Companion FTE

> *From spec to production in one conversation.*
> An AI-powered tutoring system built with the Agent Factory pattern — where a team writes a specification, a general agent reads it, and a custom agent serves thousands of students around the clock.

---

## The Idea

Most organisations building AI agents face the same dilemma: the intelligence is in the model, but the *product* is in the system around it. Course Companion FTE is a working demonstration of how to solve that problem systematically.

Using the **Agent Factory pattern**, a human team writes structured specifications — requirements, guardrails, and skill definitions. Claude Code reads those specs and manufactures a fully-operational AI tutor: a digital Full-Time Employee that is available 24/7, serves unlimited concurrent students, and maintains near-perfect consistency across every interaction.

The result is a production-ready AI tutoring system for an online course on AI Agent Development. It handles content delivery, quiz administration, progress tracking, keyword search, and (for Pro subscribers) adaptive learning paths and LLM-graded written assessments — all from a clean FastAPI backend with an MCP server layer and two distinct frontend surfaces.

---

## Architecture at a Glance

The system is built in three phases, each adding a layer of intelligence while keeping costs predictable.

### Phase 1 — Zero-Backend-LLM

```
Student → ChatGPT Custom GPT → FastAPI (pure data layer)
```

All reasoning lives inside ChatGPT. The backend is a deterministic data service: it reads, filters, grades by rule, and returns JSON. No LLM calls, no variable costs, no hallucination risk on the critical path.

**Backend AI cost: $0.** Scales to 10,000+ concurrent students on flat infrastructure.

### Phase 2 — Selective Hybrid

```
Student → ChatGPT → FastAPI ─┬─ Phase 1 routes  (zero LLM, always free)
                               └─ Phase 2 routes  (Claude API, Pro-gated)
```

Two capabilities that rules genuinely cannot replace are added for Pro subscribers: an adaptive learning path that reasons over a student's full progress history, and a written-assessment grader that evaluates free-form answers against the course curriculum. LLM is called only when (a) the student explicitly requests it and (b) their subscription authorises it.

**AI cost at 500 Pro users: ~$46/month against $9,995/month in Pro revenue. < 0.5% of revenue.**

### Phase 3 — Standalone Web App

A Next.js application with Clerk authentication, a student dashboard, and an admin panel. Currently in progress.

---

## Agent Factory Pattern

```
Spec Layer      sp/requirements.md      Human team writes product requirements
                sp/guardrails.md        Human team writes hard behavioural limits
                sp/skills.md            Human team defines agent capabilities

General Agent   Claude Code             Reads spec, builds the system end-to-end

Custom Agent    Course Companion FTE    Runs in production, serves students
```

The pattern separates *what the agent should do* (spec) from *how it is built* (general agent) from *who it serves* (custom agent). This means a non-engineering team can own the product definition, and a new custom agent can be manufactured for a different course, domain, or client by changing only the spec layer.

---

## Quick Start

```bash
# 1. Install dependencies
cd backend
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env — add ANTHROPIC_API_KEY to enable Phase 2 features

# 3. Start the API
uvicorn main:app --reload --port 8000

# 4. Explore the interactive docs
open http://localhost:8000/docs
```

---

## API Reference

### Phase 1 — Deterministic (Zero LLM)

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/chapters` | List all chapters with metadata |
| GET | `/chapters/{id}` | Full chapter content with lessons |
| GET | `/chapters/{id}/next` | Navigate to the next chapter |
| GET | `/chapters/{id}/previous` | Navigate to the previous chapter |
| GET | `/search?q=` | Keyword search across all course content |
| GET | `/quizzes/{id}` | Fetch quiz questions (answers hidden) |
| POST | `/quizzes/{id}/submit` | Grade submission — 70% pass threshold |
| GET | `/progress/{user_id}` | Retrieve a student's progress record |
| PUT | `/progress/{user_id}` | Record lesson completion or quiz score |
| GET | `/access/check` | Evaluate freemium access for a chapter |

### Phase 2 — Hybrid LLM (Pro Tier Only)

| Method | Endpoint | What it does | Cost per call |
|--------|----------|--------------|---------------|
| POST | `/adaptive/learning-path` | Personalised study plan based on progress history | ~$0.018 |
| POST | `/assessment/{id}/submit` | LLM-graded written response with detailed feedback | ~$0.014 |

Phase 2 endpoints require `"tier": "pro"` or `"tier": "team"` in the request body and return `input_tokens`, `output_tokens`, and `estimated_cost_usd` in every response for full observability.

Full OpenAPI schema: `backend/openapi_actions.yaml`
Interactive documentation: `http://localhost:8000/docs`

---

## MCP Server

Course Companion FTE exposes a 12-tool MCP server, making the entire tutoring system composable with any agent that speaks the Model Context Protocol.

```bash
# Start the MCP server (stdio transport)
python backend/mcp_server.py

# Inspect available tools
mcp dev backend/mcp_server.py
```

**10 deterministic tools** cover all Phase 1 capabilities. **2 LLM tools** expose adaptive learning and written assessment to Pro-tier subscribers. The MCP layer means Course Companion FTE can be embedded inside any other agent system without custom integration work.

---

## Course Content

The course covers AI Agent Development from first principles to production deployment across fifteen chapters:

| Chapter | Title | Access |
|---------|-------|--------|
| 1 | Introduction to AI Agents | Free |
| 2 | The Claude Agent SDK | Free |
| 3 | Model Context Protocol (MCP) | Free |
| 4 | Agent Skills | Premium |
| 5 | Building & Deploying Agents | Premium |
| 6 | Multi-Agent Systems & Orchestration | Premium |
| 7 | Memory & State Management | Premium |
| 8 | Agent Security & Safety | Premium |
| 9 | Advanced Prompt Engineering for Agents | Premium |
| 10 | Production Case Studies | Premium |
| 11 | Agentic RAG & Knowledge Systems | Premium |
| 12 | Agent Evaluation & Benchmarking | Premium |
| 13 | Streaming & Real-Time Agents | Premium |
| 14 | Fine-Tuning & Model Specialization | Premium |
| 15 | Capstone: Shipping Your Agent | Premium |

Each chapter contains three structured lessons with code examples, a five-question graded quiz, and tracked completion state.

---

## Guardrails

The system is governed by a documented set of hard rules (`sp/guardrails.md`) that the agent must never violate, regardless of how a student frames a request:

- **No answers before submission.** Quiz answers are never revealed until a student has submitted their own response.
- **No fabricated content.** The agent stays grounded in course material. It does not invent facts, make predictions, or speculate beyond the curriculum.
- **No premium leakage.** Content gated by subscription is never partially exposed to free-tier users, even in summaries.
- **No off-topic engagement.** The agent is a tutor, not a general assistant. Off-topic requests are redirected, not answered.
- **No Phase 1 LLM calls.** The backend never calls a language model during Phase 1. This is a zero-tolerance constraint — verifiable by inspection.

---

## Skills

Agent capabilities are defined as modular, documented skills in `skills/`. Each skill has a trigger vocabulary, a step-by-step workflow, and explicit principles.

| Skill | What it does |
|-------|--------------|
| `concept-explainer` | Delivers lesson content with clear explanations and anchored examples |
| `quiz-master` | Guides students through quizzes question by question, grades on submission |
| `socratic-tutor` | Responds to confusion with guiding questions rather than direct answers |
| `progress-motivator` | Summarises a student's journey and provides calibrated encouragement |
| `adaptive-path` | (Pro) Analyses progress history and generates a personalised study plan |
| `llm-assessment` | (Pro) Grades free-form written answers against the course curriculum |

---

## Subscription Tiers

| Tier | Price | What's included |
|------|-------|-----------------|
| Free | $0 / month | Chapters 1–3, all Phase 1 features |
| Premium | $9.99 / month | All 15 chapters, all Phase 1 features |
| Pro | $19.99 / month | Everything in Premium + adaptive learning path + LLM assessment |
| Team | $49.99 / month | Pro features + multi-seat access |

---

## Cost Model

| Scenario | Monthly AI cost |
|----------|----------------|
| 10,000 students — Phase 1 only | **$0** |
| 500 Pro students — 2 adaptive calls each | $18 |
| 500 Pro students — 4 assessments each | $28 |
| Combined Phase 2 at 500 Pro users | **~$46** |
| Pro revenue at 500 users ($19.99 × 500) | **$9,995** |
| AI cost as a share of Pro revenue | **< 0.5%** |

The economics work because the system is architecturally honest about what needs intelligence and what does not. Content delivery, quiz grading, search, and progress tracking are solved problems — they do not need a language model. Adaptive reasoning and written assessment genuinely do. The cost structure reflects that distinction.

Full projections: `docs/cost-analysis.md`

---

## Project Structure

```
agent-factory/
│
├── sp/                            Specification layer (human-authored)
│   ├── requirements.md            Product requirements (F1–F15)
│   ├── guardrails.md              Hard behavioural constraints (G1–T3)
│   └── skills.md                  Agent capability definitions (SK1–SK9)
│
├── backend/                       FastAPI application
│   ├── main.py                    App entry point + router registration
│   ├── config.py                  Environment configuration
│   ├── storage.py                 Data layer (local JSON / Cloudflare R2)
│   ├── models.py                  Pydantic data models
│   ├── mcp_server.py              MCP server — 12 tools
│   ├── openapi_actions.yaml       ChatGPT Actions schema
│   ├── chatgpt_system_prompt.md   Custom GPT system prompt
│   ├── routes/
│   │   ├── chapters.py            Content delivery + navigation
│   │   ├── search.py              Keyword search
│   │   ├── quizzes.py             Quiz grading (deterministic, 70% rule)
│   │   ├── progress.py            Progress read/write
│   │   ├── access.py              Freemium gate
│   │   ├── adaptive.py            Adaptive learning path (Phase 2, Pro)
│   │   └── assessment.py          LLM assessment grading (Phase 2, Pro)
│   └── data/
│       ├── chapters.json          Course structure (15 chapters)
│       ├── lessons.json           All lesson content
│       ├── quizzes.json           Quiz questions and answers
│       └── progress.json          User progress (development)
│
├── skills/                        Agent skill definitions
│   ├── quiz-master/SKILL.md
│   ├── concept-explainer/SKILL.md
│   ├── socratic-tutor/SKILL.md
│   ├── progress-motivator/SKILL.md
│   ├── adaptive-path/SKILL.md     (Phase 2)
│   └── llm-assessment/SKILL.md    (Phase 2)
│
├── docs/
│   ├── SPEC.md                    Full 12-section system specification
│   ├── product-overview.md        Client-facing product brief
│   ├── architecture-comparison.md Zero-LLM vs Hybrid trade-off analysis
│   ├── architecture-diagram.md    Mermaid diagrams — all three phases
│   └── cost-analysis.md           Detailed cost projections
│
├── frontend/
│   └── index.html                 Marketing landing page (static, no framework)
│
└── web/                           Phase 3 — Next.js student web application
    ├── src/app/                   Pages: dashboard, chapters, quiz, progress, admin
    ├── src/components/            UI components
    └── src/lib/                   API client, types, auth hook
```

---

## Environment Variables

```env
# Cloudflare R2 (production storage)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=course-companion-content
R2_ENDPOINT_URL=

# Application
APP_ENV=development          # Set to "production" to enable R2 storage
FREE_CHAPTER_LIMIT=3         # Number of free chapters

# Phase 2 — required for LLM features
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Build Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Zero-Backend-LLM — ChatGPT Custom GPT + deterministic FastAPI | Complete |
| Phase 2 | Hybrid Backend — Claude-powered Pro features | Complete |
| Phase 3 | Next.js Web App — student dashboard + admin panel | In progress |

---

## Documentation

| Document | Audience | What it covers |
|----------|----------|----------------|
| `docs/product-overview.md` | Clients, stakeholders | Value proposition, business model, capabilities summary |
| `docs/SPEC.md` | Engineering team | Full 12-section technical specification |
| `docs/architecture-comparison.md` | Technical leads | Zero-LLM vs Hybrid — when each is the right choice |
| `docs/cost-analysis.md` | Product, finance | Token costs, projections, optimisation techniques |
| `sp/requirements.md` | Spec authors | Functional and non-functional requirements |
| `sp/guardrails.md` | Spec authors | Hard behavioural constraints |
| `sp/skills.md` | Spec authors | Agent skill definitions |
