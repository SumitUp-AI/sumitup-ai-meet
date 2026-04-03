from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from models.models import Tenant
from bson import ObjectId
from bson.errors import InvalidId

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip tenant validation for public endpoints (signup, login, refresh, logout, me)
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
            "/api/v1/me"
        ]
        if request.url.path.startswith("/api/v1/zoom/callback") or request.url.path in allowed_urls:
            response = await call_next(request)
            return response
        
        # Extract tenant_id from the request headers
        tenant_id = request.headers.get("X-Tenant-ID")
        if not tenant_id:
            raise HTTPException(status_code=400, detail="Tenant ID is missing in the request headers. Please include X-Tenant-ID header.")

        # Convert string tenant_id to ObjectId
        try:
            tenant_oid = ObjectId(tenant_id)
        except (InvalidId, ValueError):
            raise HTTPException(status_code=400, detail="Invalid tenant ID format")

        # Fetch the tenant from the database
        try:
            tenant = await Tenant.get(tenant_oid)
            if not tenant:
                raise HTTPException(status_code=404, detail="Tenant not found")
        except Exception:
            raise HTTPException(status_code=404, detail="Tenant not found")

        # Attach the tenant to the request state
        request.state.tenant = tenant

        # Proceed with the request
        response = await call_next(request)
        return response
