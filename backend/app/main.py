from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router as api_router
from app.db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# CORS origins:
# - Local dev (Vite): adjust ports if needed
# - Render frontend: add your deployed URL here
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "https://wheel-lacing-app.onrender.com",
]

# Optional: override/extend via env var:
# CORS_ORIGINS="https://wheel-lacing-app.onrender.com,http://localhost:5177"
env_origins = os.getenv("CORS_ORIGINS", "").strip()
if env_origins:
    origins = [o.strip() for o in env_origins.split(",") if o.strip()]
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}
