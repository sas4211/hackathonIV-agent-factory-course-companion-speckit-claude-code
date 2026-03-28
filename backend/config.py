import os
from dotenv import load_dotenv

load_dotenv()

R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "course-companion-content")
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL", "")

APP_ENV = os.getenv("APP_ENV", "development")
FREE_CHAPTER_LIMIT = int(os.getenv("FREE_CHAPTER_LIMIT", "3"))

# Phase 2 — Hybrid Intelligence
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
