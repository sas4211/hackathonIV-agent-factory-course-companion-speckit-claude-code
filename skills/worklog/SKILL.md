---
name: worklog
description: Display the current project phase status, completed tasks, and next pending task. Use when the user asks about progress, status, what's done, or what's next.
allowed-tools: Read
---

Read `WORKLOG.md` and produce a clean status summary.

## Output format

### Current Phase
State which phase is active and its overall status.

### Completed ✅
List all checked-off tasks with their task number and name.

### In Progress 🔄
List any tasks currently in progress.

### Up Next ⬜
List the next pending task(s) with a one-line description of what they involve.

### Blockers
If any blockers are listed in WORKLOG.md, surface them. Otherwise omit this section.

Keep the output concise — one line per task. Do not reprint the raw markdown table.
