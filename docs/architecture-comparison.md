# Architecture Comparison — Zero-Backend-LLM vs Hybrid

## 1. Architecture diagrams

### Zero-Backend-LLM (Phase 1)
```
User
 ↓
ChatGPT App (LLM reasoning)
 ↓
Backend (content + rules)
```

### Hybrid (Phase 2)
```
User
 ↓
ChatGPT App
 ↓
Backend
 ├─ Retrieval
 ├─ LLM calls
 ├─ Agents
 └─ Post-processing
```

---

## 2. Side-by-side comparison

| Dimension | Zero-Backend-LLM | Hybrid |
|---|---|---|
| Backend LLM calls | ❌ None | ✅ Yes |
| Your LLM cost | $0 | High / variable |
| Infra complexity | Very low | Medium → High |
| Latency | Low | Higher |
| Hallucination risk | Low (source-grounded) | Medium |
| Personalization depth | Medium | High |
| Advanced analytics | ❌ | ✅ |
| Agent autonomy | ❌ | ✅ |
| Scalability | Excellent | Cost-bound |
| Monetization ease | High | Medium |
| Compliance / auditability | High | Medium |

---

## 3. Cost profile

### Zero-Backend-LLM
- LLM inference: **$0**
- Storage + bandwidth: cents/user/month
- Flat infrastructure cost — no surprises

### Hybrid
- LLM inference: scales with usage
- Embeddings + re-ranking (if used)
- Agent loops compound token cost
- Cost spikes under load

**Hybrid requires pricing discipline. Zero-LLM does not.**

---

## 4. Engineering complexity

### Zero-Backend-LLM

You build:
- Content APIs
- Search
- Entitlement checks
- Progress tracking

You do **not** build:
- Prompt orchestration
- Agent memory
- Token optimisation
- Cost controls

### Hybrid

You must manage:
- Prompt versions
- Token limits
- Model selection
- Latency budgets
- Cost ceilings
- Agent failures

This is real operational burden.

---

## 5. Quality & correctness

### Zero-Backend-LLM
- ChatGPT answers only from provided text
- Easy to enforce: *"If not in content, say 'not covered'"*
- Excellent for education and documentation use cases

### Hybrid
- More flexible and creative
- More hallucination vectors
- Requires guardrails and grounding strategies

---

## 6. Personalisation & intelligence

### Zero-Backend-LLM

Can do:
- Explain content differently
- Simplify for different levels
- Give analogies
- Adjust tone

Cannot do:
- Deep learner modelling
- Long-term adaptive planning
- Cross-content synthesis beyond provided text

### Hybrid

Can do:
- Personalised learning paths
- Skill graphs
- Adaptive curricula
- Automated written assessment
- Spec-driven feedback

---

## 7. Where each architecture wins

### Zero-Backend-LLM is best for
- Books and reference manuals
- Online courses and LMS companions
- Corporate training
- Compliance content
- Any use case where accuracy and cost predictability dominate

### Hybrid is best for
- Coding agents
- Research agents
- Analytics platforms
- Personalised tutors with long-term modelling
- Autonomous workflows

---

## 8. Risk & business impact

### Zero-Backend-LLM
- Predictable costs → easy pricing
- Fewer outages (no external LLM dependency in critical path)
- Faster iteration
- Smaller team

### Hybrid
- Cost overrun risk
- Model regression risk (upstream provider changes)
- Vendor dependency
- Requires MLOps discipline

---

## How Course Companion FTE uses both

**Phase 1** implements Zero-Backend-LLM: the FastAPI backend is a pure data layer
(content delivery, quiz grading, progress tracking, search). All reasoning lives in
ChatGPT via the Custom GPT and OpenAPI actions schema. Backend AI cost = **$0**.

**Phase 2** adds selective Hybrid features gated behind the Pro tier ($19.99/mo):
- **Adaptive Learning Path** — LLM reasons over multi-dimensional student progress data
  that rule-based sorting cannot meaningfully interpret (~$0.018/call)
- **LLM-Graded Assessments** — LLM evaluates free-form written answers that keyword
  matching cannot assess (~$0.014/call)

Phase 1 handles 95%+ of all requests at zero AI cost. Phase 2 is invoked only when the
student explicitly requests it and only for paid subscribers — ensuring AI cost is always
covered by subscription revenue.
