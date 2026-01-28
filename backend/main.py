from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from middlewares.limiter import limiter
from controllers.auth_controllers import router as auth_router
from controllers.pipeline_controllers import router as pipeline_router
from controllers.meeting_controllers import router as meeting_router
from controllers.transcription_webhook_controller import router as transcription_webhook
from contextlib import asynccontextmanager
from database.connection import init_db

# Connect to DB and disconnect when server shutdown from Connection pool
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan, title="SumitUp AI Powered Meeting Assistant API Docs", description="RESTful APIs and Webhooks for Sumitup.ai Application")

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exception: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
        "message": "Too many requests, Retry again after sometime"
        },
        headers={
            "Retry-After" : str(exception.detail)
    })


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "PUT", "POST", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True
    )

app.include_router(auth_router)
app.include_router(pipeline_router)
app.include_router(meeting_router)
app.include_router(transcription_webhook)

@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "Server running on port 8000!"}

