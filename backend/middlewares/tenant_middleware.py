from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from models.models import Tenant
from bson import ObjectId
from bson.errors import InvalidId


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        
        # Debug - remove after fixing
        # print(f"PATH HIT: '{request.url.path}'")
        
        allowed_urls = [
            "/docs",
            "/redoc",
            "/openapi.json",
            "/",
            "/api/v1/zoom/authorize",
            "/api/v1/zoom/callback",
            "/api/v1/signup",
            "/api/v1/login",
            "/api/v1/refresh",
            "/api/v1/logout",
            "/api/v1/me",
            "/api/v1/webhook"
        ]

        # Normalize incoming path by stripping trailing slash
        normalized_path = request.url.path.rstrip("/") or "/"

        # Skip tenant validation for allowed URLs
        if (normalized_path in allowed_urls or 
            normalized_path.startswith("/api/v1/zoom/callback")):
            response = await call_next(request)
            return response

        # Extract tenant_id from request headers
        tenant_id = request.headers.get("X-Tenant-ID")
        if not tenant_id:
            raise HTTPException(
                status_code=400,
                detail="Tenant ID is missing in the request headers. Please include X-Tenant-ID header."
            )

        # Convert string tenant_id to ObjectId
        try:
            tenant_oid = ObjectId(tenant_id)
        except (InvalidId, ValueError):
            raise HTTPException(
                status_code=400,
                detail="Invalid tenant ID format"
            )

        # Fetch tenant from database
        try:
            tenant = await Tenant.get(tenant_oid)
            if not tenant:
                raise HTTPException(
                    status_code=404,
                    detail="Tenant not found"
                )
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=404,
                detail="Tenant not found"
            )

        # Attach tenant to request state
        request.state.tenant = tenant

        # Proceed with request
        response = await call_next(request)
        return response