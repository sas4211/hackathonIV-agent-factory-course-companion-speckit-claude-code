# Architecture Diagram — Course Companion FTE

> Render this file with any Mermaid-compatible viewer (GitHub, Mermaid Live Editor,
> VS Code with Mermaid extension) to generate a PNG/PDF for submission.

## System Architecture

```mermaid
graph TB
    subgraph Students["👩‍🎓 Students"]
        S1[Free Student]
        S2[Premium Student]
        S3[Pro Student]
    end

    subgraph Frontends["🖥️ Frontends (Layer 3 + 8)"]
        GPT["ChatGPT Custom GPT\n(Phase 1 + 2 frontend)"]
        WEB["Web App\n(Phase 3 — Next.js)"]
    end

    subgraph Backend["⚙️ FastAPI Backend"]
        direction TB
        subgraph Phase1["Phase 1 — Zero-LLM Routes"]
            CH["GET /chapters/{id}\nContent Delivery"]
            NAV["GET /chapters/{id}/next|previous\nNavigation"]
            SRC["GET /search?q=\nKeyword Search"]
            QZ["POST /quizzes/{id}/submit\nRule-Based Grading"]
            PR["PUT /progress/{user_id}\nProgress Tracking"]
            AC["GET /access/check\nFreemium Gate"]
        end
        subgraph Phase2["Phase 2 — Hybrid LLM Routes (Pro only)"]
            AP["POST /adaptive/learning-path\nAdaptive Path · ~$0.018"]
            AS["POST /assessment/{id}/submit\nLLM Assessment · ~$0.014"]
        end
    end

    subgraph Data["💾 Data Layer (Layer 5)"]
        R2["Cloudflare R2\n(production)"]
        JSON["Local JSON\n(development)"]
    end

    subgraph LLM["🤖 Claude API (Phase 2 only)"]
        SONNET["Claude Sonnet 4.6\nPro-gated · cost-tracked"]
    end

    subgraph MCP["🔧 MCP Server (Layer 6)"]
        MCP12["12 Tools\n10 deterministic + 2 LLM"]
    end

    subgraph Spec["📋 Spec Layer (Layer 1)"]
        SP["sp/requirements.md\nsp/guardrails.md\nsp/skills.md"]
    end

    S1 --> GPT
    S2 --> GPT
    S3 --> GPT
    S1 --> WEB
    S2 --> WEB
    S3 --> WEB

    GPT -->|"OpenAPI Actions"| Phase1
    GPT -->|"OpenAPI Actions (Pro)"| Phase2
    WEB --> Phase1
    WEB --> Phase2

    Phase1 --> Data
    Phase2 --> Data
    Phase2 -->|"LLM call"| SONNET

    MCP12 --> Phase1
    MCP12 -->|"Pro-gated"| SONNET

    SP -.->|"defines behavior"| GPT
```

## Agent Factory Pattern

```mermaid
graph LR
    SPEC["📋 Spec Layer\nTeam writes:\n• requirements\n• guardrails\n• skills"]
    GEN["🤖 General Agent\nClaude Code:\n• reads spec\n• writes code\n• builds infra"]
    FTE["🎓 Course Companion FTE\nCustom Agent:\n• tutors students\n• grades answers\n• tracks progress"]

    SPEC -->|"spec files"| GEN
    GEN -->|"manufactures"| FTE
    FTE -->|"serves"| STUDENTS["👩‍🎓 10,000+ students"]
```

## Phase Progression

```mermaid
timeline
    title Course Companion FTE — Phase Progression
    Phase 1 : ChatGPT App
            : Zero-backend-LLM
            : 6 deterministic features
            : MCP server (12 tools)
    Phase 2 : Hybrid Intelligence
            : 2 Pro-gated LLM features
            : Claude Sonnet 4.6
            : Cost tracking per call
    Phase 3 : Standalone Web App
            : Next.js frontend
            : Admin dashboard
            : Consolidated backend
```

## Data Flow — Quiz (Phase 1, Zero-LLM)

```mermaid
sequenceDiagram
    actor Student
    participant GPT as ChatGPT GPT
    participant API as FastAPI Backend
    participant DB as Data (R2/JSON)

    Student->>GPT: "I want to take the ch01 quiz"
    GPT->>API: GET /quizzes/ch01
    API->>DB: read quizzes.json
    DB-->>API: quiz data
    API-->>GPT: questions (answers hidden)
    GPT->>Student: presents Q1
    Student->>GPT: answers all questions
    GPT->>API: POST /quizzes/ch01/submit {answers: {...}}
    API->>API: grade deterministically
    API-->>GPT: score, pass/fail, explanations
    GPT->>API: PUT /progress/user_123
    GPT->>Student: "You scored 4/5 — Passed! ✅"
```

## Data Flow — Adaptive Path (Phase 2, LLM)

```mermaid
sequenceDiagram
    actor Student
    participant GPT as ChatGPT GPT
    participant API as FastAPI Backend
    participant DB as Data (R2/JSON)
    participant LLM as Claude Sonnet 4.6

    Student->>GPT: "What should I study next?"
    GPT->>API: POST /adaptive/learning-path {user_id, tier: "pro"}
    API->>DB: read progress + chapters
    DB-->>API: student data
    API->>LLM: prompt with compact context (~1,400 tokens)
    LLM-->>API: JSON recommendations (~600 tokens)
    API-->>GPT: summary + 3 recommendations + cost ($0.018)
    GPT->>Student: personalised learning plan
```
