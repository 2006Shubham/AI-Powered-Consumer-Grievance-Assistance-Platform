from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.shared.database import get_database, close_database
from backend.auth.router import router as auth_router
from backend.cases.router import router as cases_router
from backend.ai.router import router as ai_router
from backend.evidence.router import router as evidence_router
from backend.timeline.router import router as timeline_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    get_database()
    yield
    # Shutdown logic
    await close_database()

app = FastAPI(
    title="AI Consumer Grievance Platform API",
    version="1.0.0",
    description="Backend API for AI-Powered Consumer Grievance Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registrations
app.include_router(auth_router, prefix="/api/v1")
app.include_router(cases_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")
app.include_router(evidence_router, prefix="/api/v1")
app.include_router(timeline_router, prefix="/api/v1")

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "consumer-grievance-api"}
