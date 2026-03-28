---
name: llm-assessment
description: Grade a student's free-form written answer with detailed AI feedback, strengths analysis, and gap identification. Premium-only Phase 2 feature. Triggered by "grade my answer", "check my explanation", "assess my understanding", "write an answer", "written test".
trigger-keywords: ["grade my answer", "check my explanation", "assess my understanding", "written test", "write an answer", "evaluate my answer", "mark my answer", "open question", "explain in my own words", "written assessment"]
phase: 2
premium-required: true
llm-calls: true
estimated-cost: "$0.008–0.025 per assessment (claude-haiku-4-5)"
---

# LLM-Graded Assessment Skill

## Purpose

Evaluate a student's written answer to an open-ended question and return detailed, constructive feedback — including what they got right, specific gaps or misconceptions, and a hint toward the ideal answer.

**Why this needs LLM (cannot be zero-LLM):**
Phase 1 quiz grading is deterministic: it compares a chosen index against the correct index. Free-form written answers require reasoning about conceptual accuracy, whether the student's phrasing reflects genuine understanding or a surface-level copy, and how to give partial credit for partially-correct explanations. Keyword matching would fail silently on paraphrased correct answers and flag incorrect but keyword-rich non-answers.

---

## Workflow

1. **Confirm premium status** — if not premium, explain the feature and offer an upgrade prompt.
2. **Identify the chapter** — which chapter's concepts is the student being assessed on?
3. **Pose the question** — present a relevant open-ended question appropriate to the chapter.
   - Ask one question at a time.
   - Questions should require explanation, not just recall (e.g., "Explain in your own words what the agent loop does and why it matters").
4. **Receive the student's written answer** — wait for their response.
5. **Call `submit_written_assessment`** with `chapter_id`, `user_id`, `question`, `student_answer`, `is_premium=true`.
6. **Present results** using the template below.
7. **Offer next step** — retry, review the lesson, or move on.

---

## Question Bank by Chapter

Use these as starting questions (adapt based on conversation context):

| Chapter | Sample Open Question |
|---------|---------------------|
| ch01 — Intro to AI Agents | "In your own words, explain what distinguishes an AI agent from a traditional chatbot. Give a concrete example." |
| ch02 — Claude Agent SDK | "Describe how the `@tool` decorator works and what information the SDK extracts from it automatically." |
| ch03 — MCP | "Explain the role of MCP in agent architecture. What problem does it solve that didn't exist before?" |
| ch04 — Agent Skills | "What is an agent skill, and how does SKILL.md teach an agent to behave consistently?" |
| ch05 — Deploying Agents | "What are the key considerations when packaging an agent for production deployment?" |

---

## Response Template

### Before assessment (posing the question)
```
Let's test your understanding of **[Chapter Title]** with a written question.

Take your time — write your answer in your own words. I'll give you detailed feedback.

**Question:**
[open-ended question from question bank]
```

### After assessment (presenting results)
```
**Assessment Result: [grade] — [score]/100**

[feedback — 2–4 sentences referencing their specific answer]

✅ **What you got right:**
• [strength 1]
• [strength 2]

🔍 **Gaps to address:**
• [gap 1]
• [gap 2]

💡 **Hint toward the ideal answer:**
[hint — not a full answer giveaway]

---

Want to try again, review [Lesson Title], or move on?
```

### Premium gate (if not premium)
```
Written assessments with detailed AI feedback are a **premium feature**.

With Premium, I can grade your open-ended answers and tell you:
- Exactly what you understood correctly
- Which specific concepts need more work
- A personalised hint toward the ideal answer

This goes far beyond multiple-choice — it tests real understanding.

Upgrade at /pricing to unlock written assessments.
```

---

## Key Principles

- **One question at a time** — never stack multiple open-ended questions.
- **No answer-before-grade** — do not explain the correct answer before the student has written their response.
- **Grounded in content** — `submit_written_assessment` injects chapter content so grading is curriculum-aligned, not generic.
- **Constructive tone always** — frame gaps as "areas to strengthen," never as failures.
- **Cost transparency** — each assessment costs ~$0.008–0.025; only use when genuinely beneficial.
- **Premium gate — no workarounds** — if the API returns 402, do not manually grade the answer.
