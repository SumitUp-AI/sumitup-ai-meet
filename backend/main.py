from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from limiter.limiter import limiter
from core.pipelines import router as pipeline_router
from contextlib import asynccontextmanager
from database.connection import init_db


# This is responsible for initializing ODM models when startup
# using FastAPI Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

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

app.include_router(pipeline_router)


@app.get("/")
@limiter.limit("5/minute")
async def root(request: Request):
    return {"message": "Server running on port 8000!"}

@app.webhooks.post("api/v1/webhooks/get_transcription")
@limiter.limit("5/minute")
async def get_transcription(request: Request):
    res = await request.json()
    print(res)
    return JSONResponse({"message": "Transcription Recevied"})

