# Course Companion FTE — Product Overview

> A production-ready AI tutoring system that operates as a Digital Full-Time Employee, serving students around the clock with 99%+ consistency at a fraction of the cost of human instruction.

---

## The Problem

Online courses lose students in the gap between content and understanding. A student gets stuck at 11pm on a concept that a human tutor would clarify in two minutes — but no human is available. They re-watch the same video. They leave the question in a forum and wait. The next morning, momentum is gone.

Scaling human support is expensive. A course with 10,000 students and a 1% daily help-request rate needs 100 tutoring hours per day. At any meaningful staffing rate, that cost alone can exceed the revenue the course generates.

The standard workaround — a chatbot with canned responses — does not work either. It cannot explain a concept three different ways. It cannot guide a student through a quiz without revealing the answers. It cannot notice that a student has passed every quiz but skipped most of the reading and adjust their learning path accordingly.

---

## The Solution

Course Companion FTE is an AI tutor that genuinely understands the course. It knows the curriculum, knows where each student is in it, and can respond intelligently to any question about the material — in the student's own language, at any hour, without a queue.

It is built using the **Agent Factory pattern**: a human team writes structured specifications, and a general AI agent (Claude Code) manufactures the custom tutoring agent from those specifications. The custom agent is then deployed to production.

This means:

- The product is defined in plain language, not code. A subject-matter expert can own the specification.
- A new course, domain, or client gets a new custom agent by changing only the specification.
- The manufactured system is fully auditable: every behavioural rule is written down before the first line of code is generated.

---

## What It Does

### For Students

**Instant answers.** A student can ask any question about the material and receive an accurate, curriculum-grounded response. The agent does not hallucinate. It does not speculate beyond the course content. When it doesn't know, it says so.

**Guided learning, not answer-giving.** The Socratic Tutor skill responds to confusion with questions, not answers. Students who say "I don't understand" are led through the concept rather than handed a solution — the cognitive work happens on their side, where the learning actually occurs.

**Quizzes with integrity.** The agent administers quizzes question by question, collects all answers before grading, and never reveals the correct answer before submission. The 70% pass threshold is enforced deterministically — no amount of prompting or social engineering changes it.

**Progress that means something.** Completion is recorded only when a student genuinely finishes a lesson or passes a quiz. The agent never marks content complete on a student's behalf.

**Personalised study plans (Pro).** For Pro subscribers, the agent analyses their full progress history — quiz scores, completion velocity, knowledge gaps — and generates a tailored recommendation: which chapters to revisit, where to focus, what to do next.

**Written assessment feedback (Pro).** Free-form written answers are evaluated against the curriculum by the AI, with per-question scores, identified strengths, identified gaps, and a concrete hint for improvement.

---

### For Course Operators

**No staffing cost for routine support.** Concept explanations, navigation questions, quiz retakes, and progress queries are handled automatically. Human instructors can focus on the questions that genuinely require them.

**Consistent quality at any scale.** Whether the course has 100 students or 100,000, every student receives the same quality of response. There is no fatigue, no off-day, no inconsistency between tutors.

**Full behavioural control.** The system's behaviour is defined by a documented set of guardrails before deployment. Those rules cannot be overridden by student prompting. The agent will not go off-topic, will not reveal premium content to free-tier users, and will not fabricate information.

**Transparent cost model.** Phase 1 (content, quizzes, search, progress) costs nothing in AI fees. Phase 2 features (adaptive learning, written assessment) are gated to paid subscribers and cost less than 0.5% of the revenue they generate.

**Composable architecture.** Every capability is exposed as a tool via the Model Context Protocol. The system can be embedded inside any other agent, extended with new tools, or connected to external systems without rebuilding from scratch.

---

## Architecture in Three Sentences

The backend is a deterministic data service: it stores content, grades quizzes by rule, and tracks progress in structured JSON. A ChatGPT Custom GPT sits in front of it, providing the conversational intelligence that makes the data come alive. A Claude-powered layer, gated to Pro subscribers, handles the two tasks that genuinely require reasoning: adaptive path generation and written assessment grading.

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Students served simultaneously | Unlimited |
| Response consistency | 99%+ |
| Backend AI cost (Phase 1) | $0 |
| AI cost at 500 Pro users | ~$46 / month |
| Pro revenue at 500 users | ~$9,995 / month |
| AI cost as share of Pro revenue | < 0.5% |
| Quiz grading accuracy | 100% (deterministic) |
| Guardrail rules documented | 18 (G1–T3) |
| MCP tools exposed | 12 |
| Course chapters | 15 |

---

## Subscription Tiers

| Tier | Price | Access |
|------|-------|--------|
| Free | $0 / month | First 3 chapters — enough to evaluate the product |
| Premium | $9.99 / month | All 15 chapters — the complete course |
| Pro | $19.99 / month | Everything in Premium plus AI-powered adaptive learning and written assessment |
| Team | $49.99 / month | Pro features with multi-seat access for cohorts |

The free tier is intentionally generous — students experience real value before being asked to pay. The upgrade moment is natural: a student hits chapter 4 mid-flow and is invited to continue.

---

## Course Curriculum

The course teaches AI Agent Development from first principles to production deployment.

**Chapter 1 — Introduction to AI Agents** *(Free)*
What separates an AI agent from a chatbot or a pipeline. The perceive–reason–act loop. Why agentic architecture is the defining shift in modern software development.

**Chapter 2 — The Claude Agent SDK** *(Free)*
Installing the SDK, defining tools with automatic schema generation, wiring up memory, and running a first working agent in under 30 lines of code.

**Chapter 3 — Model Context Protocol (MCP)** *(Free)*
The open standard that lets any agent connect to any tool without custom integration code. Host, server, and transport architecture. Building a functional MCP server from scratch.

**Chapter 4 — Agent Skills** *(Premium)*
Packaging capabilities into reusable Skill modules. Composing multiple skills on a single agent. Designing skill libraries that a whole team can share and extend.

**Chapter 5 — Building & Deploying Agents** *(Premium)*
Trajectory testing, evaluation harnesses, Docker packaging, cloud deployment, structured observability, and guardrails that keep agents safe at scale.

**Chapter 6 — Multi-Agent Systems & Orchestration** *(Premium)*
The orchestrator-worker pattern, building a working orchestrator that delegates to specialist subagents, and mastering fan-out/fan-in execution for parallel workloads.

**Chapter 7 — Memory & State Management** *(Premium)*
The four types of agent memory, semantic search with vector databases, and state machines for agents that run across multiple sessions.

**Chapter 8 — Agent Security & Safety** *(Premium)*
Prompt injection, tool privilege abuse, data exfiltration, input/output validation, and responsible deployment practices against the OWASP LLM Top 10.

**Chapter 9 — Advanced Prompt Engineering for Agents** *(Premium)*
The five-component system prompt architecture, dynamic context management as a scarce resource, and few-shot examples with chain-of-thought reasoning.

**Chapter 10 — Production Case Studies** *(Premium)*
Two detailed real-world walkthroughs — a code review agent and a data analysis agent — showing how every course concept combines in production systems.

**Chapter 11 — Agentic RAG & Knowledge Systems** *(Premium)*
Hybrid retrieval with BM25 and dense vectors, cross-encoder re-ranking, structured document processing, and building a production knowledge pipeline that stays fresh.

**Chapter 12 — Agent Evaluation & Benchmarking** *(Premium)*
Designing robust eval frameworks, writing calibrated LLM-as-judge rubrics, and building continuous evaluation pipelines that catch regressions before they reach users.

**Chapter 13 — Streaming & Real-Time Agents** *(Premium)*
Response streaming for perceived latency, profiling and eliminating latency bottlenecks, and building event-driven agents that react to webhooks and real-time data.

**Chapter 14 — Fine-Tuning & Model Specialization** *(Premium)*
The fine-tuning decision framework, collecting high-quality trajectory data, training with DPO, and evaluating specialised models rigorously before deployment.

**Chapter 15 — Capstone: Shipping Your Agent** *(Premium)*
Multi-tenant agent SaaS architecture, usage metering, the agent developer career and toolchain, and applying the full course framework to an original capstone project.

---

## Behavioural Guarantees

The system makes the following promises, enforced by documented guardrails that cannot be overridden by any student input:

- **Curriculum-grounded answers only.** The agent does not speculate, invent, or respond outside the scope of the course material.
- **Quiz integrity preserved.** Correct answers are never revealed before submission. Grading is deterministic and consistent across every student.
- **Subscription boundaries enforced.** Free-tier students receive exactly the access they are entitled to — no more, regardless of how the question is framed.
- **No off-topic engagement.** The agent is a tutor. It declines general conversation, opinion requests, and tasks unrelated to the course.
- **Zero AI cost on the critical path.** Phase 1 operations — the vast majority of all student interactions — involve no language model calls on the backend.

---

## Technology

| Layer | Technology |
|-------|-----------|
| API framework | FastAPI (Python) |
| Data models | Pydantic |
| Production storage | Cloudflare R2 (S3-compatible) |
| Development storage | Local JSON |
| LLM (Phase 2) | Claude Sonnet 4.6 (Anthropic) |
| Agent protocol | Model Context Protocol (MCP) |
| Frontend (Phase 1 & 2) | ChatGPT Custom GPT |
| Frontend (Phase 3) | Next.js + Clerk authentication |

---

## Development Status

| Phase | What it delivers | Status |
|-------|-----------------|--------|
| Phase 1 | Full tutoring system — zero AI cost. Content, quizzes, search, progress, freemium gate, ChatGPT app, MCP server. | Complete |
| Phase 2 | Pro-tier AI features — adaptive learning path, written assessment grading with LLM feedback. | Complete |
| Phase 3 | Standalone web application — Next.js, student dashboard, admin panel, real authentication. | In progress |

---

## For Developers

The full technical specification, API reference, architecture diagrams, and cost analysis are in the `docs/` directory. The source is in `backend/` (FastAPI) and `frontend/` (web app). The specification layer that defines the agent's behaviour is in `sp/`. Skill definitions are in `skills/`.

Start here: `README.md`
Full spec: `docs/SPEC.md`
Run locally: `cd backend && uvicorn main:app --reload`
