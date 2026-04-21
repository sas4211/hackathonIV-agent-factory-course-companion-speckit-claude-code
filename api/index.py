import sys
import os
import traceback

# Make the backend package importable
_backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
sys.path.insert(0, _backend_path)

try:
    from starlette.applications import Starlette
    from starlette.routing import Mount
    from main import app as backend_app  # noqa: E402

    # Vercel routes /api/* to this function.
    # Starlette Mount strips the /api prefix before forwarding to FastAPI.
    app = Starlette(routes=[Mount("/api", app=backend_app)])
    _import_error = None

except Exception as e:
    _import_error = traceback.format_exc()
    # Fallback to a simple FastAPI app that shows the error
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.get("/{full_path:path}")
    async def show_error(full_path: str):
        return JSONResponse({"import_error": _import_error, "backend_path": _backend_path, "sys_path": sys.path[:5]}, status_code=500)
