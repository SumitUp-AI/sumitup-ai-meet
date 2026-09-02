from fastapi import HTTPException, APIRouter, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from backend.models.models import TenantSettings
from middlewares.limiter import limiter
from pydantic import BaseModel
import httpx
import base64
from config.settings import settings


router = APIRouter(
    prefix="/api/v1/zoom",
    tags=["Zoom Integration APIs (In Development)"]
)

ZOOM_CLIENT_ID = settings.zoom_client_id
ZOOM_CLIENT_SECRET = settings.zoom_client_secret
ZOOM_REDIRECT_URI = settings.zoom_redirect_uri

class ZoomTokenPayload(BaseModel):
    access_token: str
    refresh_token: str

@router.post("/save-token")
@limiter.limit(
    "60/minute"
)
async def save_zoom_token(request: Request, payload: ZoomTokenPayload):
    tenant = request.state.tenant
    tenant_settings = await TenantSettings.find_one(TenantSettings.tenant == tenant)

    if not tenant_settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant Settings for this Tenant Not Found")
    
    tenant_settings.zoom_connected = True
    tenant_settings.zoom_access_token = payload.access_token
    tenant_settings.zoom_refresh_token = payload.refresh_token
    await tenant_settings.save()
    return JSONResponse({"message": "Zoom token saved"})

@router.get('/authorize')
async def zoom_authorize():
    url = (
        f"https://zoom.us/oauth/authorize"
        f"?response_type=code"
        f"&client_id={ZOOM_CLIENT_ID}"
        f"&redirect_uri={ZOOM_REDIRECT_URI}"
    )
    return RedirectResponse(url)

@router.get('/callback')
async def zoom_callback(code: str, request: Request):    
    encoded = base64.b64encode(f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()).decode()

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://zoom.us/oauth/token",
            params={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": ZOOM_REDIRECT_URI,
            },
            headers={
                "Authorization": f"Basic {encoded}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        )

    data = res.json()
    if "access_token" not in data:
        raise HTTPException(status_code=400, detail=f"Zoom OAuth failed: {data}")

    access_token = data["access_token"]
    refresh_token = data.get("refresh_token", "")
    return RedirectResponse(
        f"http://localhost:5173/dashboard/settings?zoom=connected&access_token={access_token}&refresh_token={refresh_token}"
    )

@router.delete("/disconnect")
@limiter.limit("60/minute")
async def zoom_disconnect(request: Request):
    tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    tenant_settings = await TenantSettings.find_one(TenantSettings.tenant == tenant)
    
    if not tenant_settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant Settings for this Tenant Not Found")
        
    
    # Revoke token from Zoom
    if tenant_settings.zoom_access_token:
        encoded = base64.b64encode(f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()).decode()
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://zoom.us/oauth/revoke",
                params={"token": tenant.zoom_access_token},
                headers={"Authorization": f"Basic {encoded}"}
            )

    # Clear from DB
    tenant_settings.zoom_connected = False
    tenant_settings.zoom_access_token = None
    tenant_settings.zoom_refresh_token = None
    await tenant_settings.save()

    return JSONResponse({"message": "Zoom disconnected"})

@router.get("/status")
@limiter.limit("60/minute")
async def zoom_status(request: Request):
    tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found!")
    
    tenant_settings = await TenantSettings.find_one(TenantSettings.tenant == tenant)
    
    if not tenant_settings:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant Settings for this Tenant Not Found")
        
    
    return JSONResponse({"zoom_connected": tenant_settings.zoom_connected})





