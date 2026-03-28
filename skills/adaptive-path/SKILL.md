---
name: adaptive-path
description: Generate a personalised learning path by analysing student quiz scores, completion patterns, and knowledge gaps. Premium-only Phase 2 feature. Triggered by "what should I study", "learning plan", "what's next for me", "personalise my path", "where should I focus".
trigger-keywords: ["what should I study", "learning plan", "my learning path", "personalise", "personalize", "what's next for me", "where should I focus", "study plan", "recommend chapters", "what should I do next"]
phase: 2
premium-required: true
llm-calls: true
estimated-cost: "$0.003–0.008 per request (claude-haiku-4-5)"
---

# Adaptive Learning Path Skill

## Purpose

Analyse the student's actual progress data and generate a prioritised, personalised learning path — telling them exactly which chapters to focus on and why, based on their quiz performance, completion gaps, and learning velocity.

**Why this needs LLM (cannot be zero-LLM):**
Rule-based systems can list incomplete chapters. Only an LLM can reason about *which* gaps to close first based on cross-chapter dependencies, identify misconceptions from quiz failure patterns, and explain *why* a specific chapter is the student's priority in plain language they'll find motivating.

---

## Workflow

1. **Confirm premium status** — if not premium, skip this skill and offer to explain the upgrade benefit.
2. **Acknowledge the request** — tell the student you're analysing their progress (sets expectation that this takes a moment).
3. **Call `get_adaptive_learning_path`** with `user_id` and `is_premium=true`.
4. **If 402 error** — tell the student this is a premium feature and explain the value.
5. **Present the summary** — 2–3 sentences on their current state.
6. **Present recommendations** — for each recommendation, show:
   - Priority badge (🔴 Urgent / 🟡 Recommended / 🟢 Optional)
   - Chapter name
   - Specific reason (from API, referencing their data)
   - Concrete action to take
7. **Present next action** — emphasise this as the single most important step.
8. **Present estimated completion** — frame positively.
9. **Offer to navigate** — ask if they want to jump to the highest-priority chapter now.

---

## Response Template

```
I've analysed your progress across all chapters. Here's your personalised learning path:

---

📊 **Your Current State**
[summary from API — 2–3 sentences on strengths and gaps]

---

🎯 **Recommended Focus**

🔴 **Urgent — [Chapter Title]**
Why: [reason from API based on their actual data]
Action: [specific step from API]

🟡 **Recommended — [Chapter Title]**
Why: [reason]
Action: [specific step]

---

⚡ **Your #1 Next Step**
[next_action from API — single sentence]

📅 **Estimated Completion:** [estimated_completion from API]

---

Want me to take you straight to [highest-priority chapter]?
```

---

## Key Principles

- **Never fabricate progress data** — all analysis comes from `get_adaptive_learning_path`; never estimate or guess.
- **Data-driven, not generic** — the recommendation must reference something specific from their record (e.g., "your ch02 quiz score of 58% suggests...").
- **Premium gate — no workarounds** — if the API returns 402, do not attempt to generate a learning path manually.
- **Cost transparency** — if the student asks, the cost per request is ~$0.003–0.008 (Haiku model).
- **One call only** — do not call `get_adaptive_learning_path` multiple times in one session; cache the result.
