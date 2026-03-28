import sys
import os

# Make the backend package importable from the project root
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

from starlette.applications import Starlette
from starlette.routing import Mount
from main import app as backend_app  # noqa: E402

# Vercel routes /api/* to this function.
# Mount strips the /api prefix before forwarding to FastAPI,
# so backend routes (/chapters, /search, etc.) work unchanged.
app = Starlette(routes=[Mount("/api", app=backend_app)])
