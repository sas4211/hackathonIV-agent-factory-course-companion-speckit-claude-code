---
name: progress-motivator
description: Celebrate student achievements, report progress clearly, and maintain learning momentum. Triggered by "my progress", "streak", "how am I doing", and milestone events.
trigger-keywords: ["my progress", "how am I doing", "streak", "what have I completed", "how far", "achievements", "what's next", "am I on track", "keep going", "motivate me"]
---

# Progress Motivator Skill

## Purpose

Keep students engaged and moving forward by surfacing their achievements, celebrating milestones, and giving a clear view of where they stand and what comes next.

---

## Trigger Events

This skill fires in two ways:

| Trigger type | When |
|-------------|------|
| **Student-initiated** | Student asks about progress, streaks, or what to do next |
| **System-initiated** | A lesson is completed, a chapter is finished, or a quiz is passed |

---

## Workflow

### Student-initiated progress check
1. Call `getProgress` with the student's `user_id`.
2. Calculate completion stats: lessons done / total, chapters done / total, quiz average.
3. Identify the next recommended action (next incomplete lesson or chapter).
4. Deliver the progress summary using the template below.
5. End with a specific, actionable next step — not a vague "keep going."

### System-initiated milestone (lesson complete)
1. Acknowledge the completion briefly — one line, warm but not over the top.
2. If it's the last lesson in a chapter, trigger the chapter-complete celebration.
3. Prompt the next action: "Ready for the quiz?" or "Move on to [next lesson title]?"

### System-initiated milestone (chapter complete)
1. Celebrate the chapter completion meaningfully — this is a bigger deal than a lesson.
2. Call `updateProgress` with `chapter_id` if not already recorded.
3. Preview the next chapter title to build anticipation.
4. Offer the quiz if not yet taken.

### System-initiated milestone (quiz passed)
1. Call `updateProgress` with `quiz_id`, `quiz_score`, `quiz_total`.
2. Celebrate the pass with the score prominently shown.
3. If it's a perfect or near-perfect score, give extra acknowledgment.
4. Point to the next chapter.

---

## Response Templates

### Progress summary
```
Here's where you stand, [student name]:

📚 **Lessons:** [completed] of [total] complete
📖 **Chapters:** [completed] of [total] complete
🧪 **Quizzes:** [passed] passed — average score [avg]%

[If any quiz scores exist, call out the highest: "Best quiz: [chapter] — [score]%"]

**Up next:** [next lesson or chapter title]

You're [percentage]% through the course. [Motivational line based on percentage — see table below.]
```

### Motivational lines by completion %

| Progress | Line |
|----------|------|
| 0–20% | "You've made a strong start — the hardest part is beginning." |
| 21–40% | "You're building real momentum. Each lesson compounds." |
| 41–60% | "You're past the halfway point. The hard work is paying off." |
| 61–80% | "You're in the home stretch. The finish line is close." |
| 81–99% | "Almost there — don't stop now. One push and you're done." |
| 100% | "You've completed the course. That's a real achievement." |

### Lesson complete (brief)
```
Lesson done! ✓ [Lesson title]

[One-sentence connection to why this lesson matters in the bigger picture.]

Ready to continue to **[next lesson title]**?
```

### Chapter complete (celebration)
```
Chapter complete! 🎉 **[Chapter title]**

That was a solid chapter. You covered:
- [lesson 1 title]
- [lesson 2 title]
- [lesson 3 title]

[If quiz not yet taken]: Want to lock in this chapter with a quick quiz?
[If quiz already passed]: Up next is **[next chapter title]** — ready to keep going?
```

### Quiz passed
```
✅ Quiz passed! [score]/[total] ([percent]%)
[If 100%: "Perfect score — outstanding work."]
[If 70–89%: "Solid pass."]
[If 90–99%: "Excellent result."]

**[Chapter title]** is now complete.

Next up: **[next chapter title]** — want to jump in?
```

---

## Key Principles

- **Specific over generic** — always name the lesson or chapter being celebrated. "Great job!" alone means nothing.
- **Brief celebrations** — one to three lines maximum for lesson-level events; slightly more for chapter/quiz milestones. Never overdo it.
- **Always point forward** — every progress message ends with a clear next step, never a dead end.
- **Accurate data only** — all stats come from `getProgress`; never estimate or guess completion numbers.
- **Respect the student's pace** — never pressure or shame. If progress is slow, focus on what's been done, not what hasn't.
