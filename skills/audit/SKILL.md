---
name: audit
description: Run an LLM violation audit on all backend Python files. Use when the user asks to audit, verify zero LLM calls, or check the disqualification guard.
allowed-tools: Bash, Grep, Read
---

Scan every `.py` file under `backend/` for LLM/AI API usage.

## Check for

1. **Imports** — any of: `anthropic`, `openai`, `langchain`, `litellm`, `ollama`, `cohere`, `together`, `huggingface`, `transformers`, `groq`, `mistral`, `gemini`
2. **HTTP calls to AI endpoints** — `requests.post`, `httpx`, `aiohttp` pointing to any AI provider URL
3. **AI SDK patterns** — `.chat.completions`, `.messages.create`, `.complete(`, `ChatCompletion`, `.generate(`, `inference(`
4. **requirements.txt** — any AI/LLM package listed as a dependency

## Output format

Print a table:

| File | Finding | Status |
|------|---------|--------|
| backend/main.py | No violations | ✅ PASS |
| ... | ... | ... |

Then print a summary line:

- **PASS** if zero violations found across all files
- **FAIL** with a list of exact file:line violations if any are found

Update `WORKLOG.md` task 9 status to ✅ on PASS, or flag as ❌ FAIL with details.
