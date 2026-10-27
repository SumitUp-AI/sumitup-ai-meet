from fastapi import FastAPI, status, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from middlewares.limiter import limiter
from middlewares.tenant_middleware import TenantMiddleware
from router.apis.auth import router as auth_router
from router.apis.summarization import router as summarization_and_actionitems_router
from router.apis.meeting import router as meeting_router
from router.apis.teams import router as teams_router
from router.apis.zoom_oauth import router as zoom_oauth_router
from router.apis.chatbot import router as chatbot_router
from router.webhooks.attendee_webhook import router as transcription_webhook
from config.settings import settings
from contextlib import asynccontextmanager
from database.connection import init_db, client, db
from database.create_vector_index import create_vector_index_and_search_index

import sentry_sdk
import logging


logger = logging.getLogger(__name__)

if settings.production:
    logger.info("Enabling Sentry in Production")
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        send_default_pii=True,
        traces_sample_rate=0.1,
        environment="production",
    )
    logger.info("Enabled Sentry in Production")
else:
    logger.info("Sentry Disabled in Development")


# Connect to DB and disconnect when server shutdown from Connection pool
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    create_vector_index_and_search_index()
    yield

app = FastAPI(lifespan=lifespan, title="SumitUp AI Powered Meeting Assistant API Docs", description="RESTful APIs and Webhooks for Sumitup.ai Application")

# Add TenantMiddleware to validate tenant for all requests
app.add_middleware(TenantMiddleware)

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
    allow_origins=["http://localhost:5173", settings.client_url],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
    allow_credentials=True
    )

app.include_router(auth_router)
app.include_router(summarization_and_actionitems_router)
app.include_router(meeting_router)
app.include_router(teams_router)
app.include_router(transcription_webhook)
app.include_router(zoom_oauth_router)
app.include_router(chatbot_router)

@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "Server running!"}

@app.get("/health")
@limiter.limit("10/minute")
async def check_server_health(request: Request):
    health_status = {
        "server": "healthy",
        "services": {
            "api": "ok",
            "database": "unknown"
        }
    }
    try:
        admin_client = client["admin"]
        ping_response = await admin_client.command("ping")

        if ping_response and ping_response.get("ok") == 1.0:
            health_status["services"]["database"] = "ok"
            return health_status
        else:
            raise Exception("MongoDB ping did not return success payload")
            
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        health_status["server"] = "unhealthy"
        health_status["services"]["database"] = "down"
        
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=health_status
        )
    

