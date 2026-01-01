from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from limiter.limiter import limiter
from core.pipelines import router as pipeline_router

app = FastAPI()

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
