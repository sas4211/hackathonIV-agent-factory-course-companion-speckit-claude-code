---
name: concept-explainer
description: Explain course concepts at the student's level using course content as the source of truth. Triggered by "explain", "what is", "how does", and similar knowledge questions.
trigger-keywords: ["explain", "what is", "what are", "how does", "how do", "tell me about", "describe", "define", "what does", "why is", "why does"]
---

# Concept Explainer Skill

## Purpose

Deliver clear, grounded explanations of course concepts at the appropriate complexity level for the student — always sourced from actual course content, never from memory.

---

## Workflow

1. **Extract the concept** — identify the key term or idea the student is asking about.
2. **Search the course** — call `searchContent` with the concept as the query.
3. **Assess the result:**
   - If results found: ground the explanation in the returned snippets. Cite the lesson title and chapter.
   - If no results: say "That specific topic may not be covered in this course. Here's what I know from the related content:" and use the closest matching result.
4. **Gauge complexity level** — default to beginner unless the student's prior messages indicate otherwise.
5. **Deliver the explanation** using the appropriate template below.
6. **Offer to go deeper** — ask if the student wants an analogy, an example, or to jump to the full lesson.

---

## Complexity Levels

| Level | When to use | Style |
|-------|-------------|-------|
| Beginner | First encounter with topic, or student says "I'm new to this" | Plain language, one idea at a time, real-world analogy |
| Intermediate | Student has prior context or asks follow-up questions | Technical terms introduced with brief definitions |
| Advanced | Student asks "why" or "how exactly" at a deep level | Full technical depth, edge cases mentioned |

---

## Response Templates

### Beginner explanation
```
**[Concept Name]**

In simple terms: [one-sentence plain-language definition].

Think of it like: [real-world analogy].

From the course ([Chapter Title] > [Lesson Title]):
> [quoted or paraphrased snippet from searchContent result]

Want me to walk you through the full lesson, or shall I give you a quick example?
```

### Intermediate explanation
```
**[Concept Name]**

[2–3 sentence explanation using appropriate terminology].

From the course ([Chapter Title] > [Lesson Title]):
> [quoted or paraphrased snippet]

Key point: [one takeaway sentence].

Want to test your understanding with a quick quiz question?
```

---

## Key Principles

- **Never fabricate** — if `searchContent` returns nothing relevant, say so honestly.
- **Always cite** — every explanation must reference a lesson and chapter from the API result.
- **One concept at a time** — if the student asks about multiple concepts, address them sequentially.
- **Offer the next step** — always end with an invitation to go deeper, take a quiz, or move to the lesson.
- **Do not replace lessons** — explanations are summaries that lead students *into* the full lesson, not substitutes for it.
