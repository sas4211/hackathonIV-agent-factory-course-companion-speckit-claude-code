import sys
import os

# Ensure the backend directory is in the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import chapters, search, quizzes, progress, access
# Phase 2 — Hybrid Intelligence (premium-gated, LLM-powered)
from routes import adaptive, assessment

app = FastAPI(
    title="Course Companion API",
    description=(
        "Phase 1: Deterministic content, quiz, and progress APIs (zero LLM). "
        "Phase 2: Hybrid intelligence APIs for premium features (LLM-powered, premium-gated)."
    ),
    version="2.0.0",
    redirect_slashes=False,
)

# Build CORS origin list — always allow localhost in dev; add FRONTEND_URL in prod.
_cors_origins = ["http://localhost:3000", "http://localhost:3001"]
_frontend_url = os.getenv("FRONTEND_URL")
if _frontend_url:
    _cors_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["*"],
)

# ── Phase 1: Zero-LLM deterministic routes ───────────────────────────────────
app.include_router(chapters.router,   prefix="/chapters",   tags=["Phase 1 · Content & Navigation"])
app.include_router(search.router,     prefix="/search",     tags=["Phase 1 · Search"])
app.include_router(quizzes.router,    prefix="/quizzes",    tags=["Phase 1 · Quizzes"])
app.include_router(progress.router,   prefix="/progress",   tags=["Phase 1 · Progress"])
app.include_router(access.router,     prefix="/access",     tags=["Phase 1 · Freemium Gate"])

# ── Phase 2: Hybrid Intelligence (premium-gated, LLM-powered) ────────────────
app.include_router(adaptive.router,   prefix="/adaptive",   tags=["Phase 2 · Adaptive Learning Path"])
app.include_router(assessment.router, prefix="/assessment", tags=["Phase 2 · LLM-Graded Assessments"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "Course Companion API v2"}
