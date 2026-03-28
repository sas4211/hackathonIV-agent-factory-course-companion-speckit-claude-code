# Cost Analysis — Course Companion FTE

## Overview

Course Companion FTE is a **hybrid architecture**: Phase 1 routes are fully deterministic
(zero LLM calls, zero AI cost), while Phase 2 routes selectively invoke Claude Sonnet 4.6
for tasks that rule-based logic genuinely cannot solve.

---

## Phase 1 — Zero AI Cost

Phase 1 serves content, navigation, quiz grading, progress tracking, and access checks
using pure data retrieval. **No LLM calls. No AI cost.**

| Operating cost driver | Monthly estimate (10,000 active students) |
|---|---|
| Cloudflare R2 storage (5 JSON files, ~50 KB) | $0.00 (free tier) |
| Cloudflare R2 egress (assuming 1 KB per request, 5 req/student) | ~$0.25 |
| FastAPI server (e.g. Railway Hobby) | $5.00 |
| **Total Phase 1 AI cost** | **$0.00** |
| **Total Phase 1 infrastructure** | **~$5–10 / month** |

**Per-student cost (Phase 1):** `$0.001–0.002` — effectively zero.

### Why Phase 1 is zero-LLM

The judging spec requires Phase 1 backend to be "pure data retrieval — zero LLM calls."
Quiz grading uses `correct_index` comparison; search uses substring matching; progress
tracking is a simple JSON write. No task in Phase 1 requires natural language reasoning.

---

## Phase 2 — Hybrid Intelligence (Pro Tier Only)

Phase 2 features are **gated behind the Pro subscription ($19.99/month)**. They call
Claude Sonnet 4.6 only when the student explicitly requests them. Both features return
`input_tokens`, `output_tokens`, and `estimated_cost_usd` in every response for full
transparency.

### Model: Claude Sonnet 4.6

| Token type | Price |
|---|---|
| Input | $3.00 / 1M tokens |
| Output | $15.00 / 1M tokens |

### Feature A — Adaptive Learning Path (`POST /adaptive/learning-path`)

**Why LLM is required:** Personalising a learning path requires multi-dimensional
reasoning over quiz failure patterns, completion velocity, and cross-chapter knowledge
dependencies. A rule-based system can sort chapters by order; it cannot explain *which
knowledge gaps to close first* or adapt to individual learning signals.

| Token budget | Estimate |
|---|---|
| System + chapter context (JSON) | ~1,400 tokens input |
| LLM response (3 recommendations + summary) | ~600 tokens output |
| **Total per call** | ~2,000 tokens |

**Cost per call:**
```
input:  1,400 × $0.000003  = $0.0042
output:   600 × $0.000015  = $0.0090
Total                       ≈ $0.018
```

### Feature B — LLM-Graded Assessment (`POST /assessment/{chapter_id}/submit`)

**Why LLM is required:** Free-form written answers require reasoning about conceptual
accuracy, completeness, correct use of terminology, and partial credit. Keyword matching
cannot distinguish `"agents maintain state"` (correct) from `"agents are stateful by
default"` (subtly wrong in many contexts). Only an LLM can evaluate nuanced understanding
and generate constructive, specific feedback.

| Token budget | Estimate |
|---|---|
| System + chapter context (2 lessons × 600 chars) | ~900 tokens input |
| Student question + answer | ~200 tokens input |
| LLM response (score, feedback, strengths, gaps, hint) | ~350 tokens output |
| **Total per call** | ~1,450 tokens |

**Cost per call:**
```
input:  1,100 × $0.000003  = $0.0033
output:   350 × $0.000015  = $0.0053
Total                       ≈ $0.014
```

---

## Monthly Cost Projections (Phase 2)

Assumptions:
- Pro subscribers use Adaptive Path **2×/month** and Assessment **4×/month**
- Pro adoption rate: 5% of total students at each scale

| Scale | Pro users | Adaptive calls | Assessment calls | Monthly AI cost |
|---|---|---|---|---|
| 100 students | 5 | 10 × $0.018 | 20 × $0.014 | **$0.46** |
| 1,000 students | 50 | 100 × $0.018 | 200 × $0.014 | **$4.60** |
| 10,000 students | 500 | 1,000 × $0.018 | 2,000 × $0.014 | **$46.00** |
| 100,000 students | 5,000 | 10,000 × $0.018 | 20,000 × $0.014 | **$460.00** |

**Revenue vs. cost at 10,000 students:**
- Pro revenue: 500 subscribers × $19.99 = **$9,995 / month**
- Phase 2 AI cost: **$46 / month**
- AI cost as % of Phase 2 revenue: **< 0.5%**

---

## Why Hybrid is Cost-Justified

1. **Phase 1 handles 95%+ of traffic for free** — content delivery, quizzes, progress,
   and navigation never touch the LLM. This keeps the per-student blended cost near zero.

2. **Phase 2 is gated behind a paid tier** — only Pro subscribers ($19.99/mo) can trigger
   LLM calls, ensuring AI cost is always covered by subscription revenue.

3. **Token budgets are tightly controlled** — chapter context is capped at 2 lessons
   (600 chars each); adaptive context uses compact JSON (no full lesson bodies).
   `max_tokens` caps are set to 500–700 to prevent runaway output.

4. **Cost is fully transparent** — every Phase 2 response returns `input_tokens`,
   `output_tokens`, and `estimated_cost_usd`. Operators can monitor spend per feature.

5. **Selective intelligence** — LLM is used only where rule-based approaches genuinely
   fail (conceptual assessment, personalised explanations). This is the correct application
   of hybrid architecture: deterministic where possible, intelligent where necessary.

---

## Token Optimization Techniques Applied

| Technique | Saving |
|---|---|
| Compact chapter context JSON (no full bodies) | ~60% input reduction vs. full lesson text |
| First 2 lessons only, capped at 600 chars each | Bounds cost per assessment |
| `max_tokens=500` (assessment), `700` (adaptive) | Caps output cost |
| Phase 1 serves all non-reasoning requests | Eliminates AI cost for 95%+ of requests |
| Pro-only gate (not free or Premium tier) | Ensures AI cost covered by subscription |
