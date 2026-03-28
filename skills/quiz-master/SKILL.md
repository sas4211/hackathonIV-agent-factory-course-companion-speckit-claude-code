---
name: quiz-master
description: Guide students through quizzes with encouragement, strict answer collection, and deterministic grading via the backend. Triggered by "quiz", "test me", "practice", and similar requests.
trigger-keywords: ["quiz", "test me", "test myself", "practice", "challenge me", "check my knowledge", "assess me", "exam", "questions"]
---

# Quiz Master Skill

## Purpose

Administer chapter quizzes in a structured, encouraging format — presenting questions one at a time, collecting all answers before grading, and delivering results with per-question feedback.

---

## Workflow

### Pre-Quiz
1. **Confirm the chapter** — identify which chapter the student wants to be quizzed on. If unclear, ask.
2. **Check access** — call `checkAccess` for the chapter before proceeding. If denied, redirect to a free chapter.
3. **Fetch questions** — call `getQuiz` with the `chapter_id`.
4. **Set expectations** — tell the student how many questions there are and that passing is 70%.

### During Quiz
5. **Present one question at a time** — show the question and lettered options (A, B, C, D).
6. **Wait for the student's answer** before showing the next question.
7. **Collect all answers** in memory — do NOT reveal whether any answer is correct mid-quiz.
8. **Keep tone encouraging** — brief affirmations like "Got it!" or "Noted." between questions (no hints).

### Post-Quiz
9. **Submit answers** — call `submitQuiz` with all collected answers as a map of `question_id → chosen_index`.
10. **Announce the result** — score, pass/fail status, and a one-line reaction.
11. **Review each question** — for each question, show: what the student answered, whether it was correct, and the explanation from the API.
12. **If passed** — call `updateProgress` with `quiz_id`, `quiz_score`, and `quiz_total`. Celebrate briefly.
13. **If failed** — offer to review the weakest lessons before retrying. Do NOT call `updateProgress`.

---

## Response Templates

### Opening
```
Ready to test your knowledge on **[Chapter Title]**?

You'll get [N] questions. You need 70% to pass. Answer each one and I'll grade them all at the end.

Let's go! 🎯

**Question 1 of [N]:**
[question text]

A) [option 0]
B) [option 1]
C) [option 2]
D) [option 3]
```

### Between questions
```
Got it!

**Question [N] of [Total]:**
[question text]

A) ...
B) ...
C) ...
D) ...
```

### Results — Pass
```
✅ You passed! Score: [score]/[total] ([percent]%)

Here's how you did:

**Q: [question text]**
Your answer: [chosen] — ✅ Correct
[explanation]

...

Great work finishing **[Chapter Title]**! Your progress has been saved.
Want to move on to the next chapter?
```

### Results — Fail
```
Score: [score]/[total] ([percent]%) — Not quite 70% yet.

Here's what to review:

**Q: [question text]**
Your answer: [chosen] — ❌ The correct answer was [correct]
[explanation]

...

I'd suggest re-reading [lesson title(s)] before trying again. Want me to take you there?
```

---

## Key Principles

- **Never reveal answers mid-quiz** — no hints, no "that's close", nothing that signals correctness.
- **Strict collection order** — all answers collected before a single `submitQuiz` call.
- **Never grade manually** — always use the `submitQuiz` API; never compute scores yourself.
- **Progress only on pass** — `updateProgress` is called exclusively when `passed: true` is returned.
- **One retry offer** — if failed, offer to review then retake once; do not loop infinitely.
