from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
# This library is used for Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from core.pipelines import router as pipeline_router

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply a global default rate limit
@app.middleware("http")
async def global_rate_limit(request: Request, call_next):
    # You can set global rate limit here
    key = limiter._key_func(request)
    try:
        # Check limit (default 10 req/min)
        limiter.hit(key, limit_value="10/minute")
    except RateLimitExceeded:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    response = await call_next(request)
    return response

app.add_middleware(CORSMiddleware(
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "PUT", "POST", "DELETE"],
    allow_headers=["*"],
    allow_credentials=True
    ))

app.include_router(pipeline_router)

@app.get("/")
async def root():
    return {"message": "Server running on port 8000!"}
