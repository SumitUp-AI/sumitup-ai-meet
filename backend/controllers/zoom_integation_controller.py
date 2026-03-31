from fastapi import HTTPException, APIRouter, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from models.models import Tenant
import httpx
import base64
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    prefix="/api/v1/zoom",
    tags=["Zoom Integration APIs"]
)

ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")
ZOOM_REDIRECT_URI = os.getenv("ZOOM_REDIRECT_URI")

@router.get('/authorize')
async def zoom_authorize():
    redirect_uri = f"""https://zoom.us//oauth/authorize?response_type=code
    &client_id={ZOOM_CLIENT_ID}
    &redirect_uri={ZOOM_REDIRECT_URI}"""

    return RedirectResponse(redirect_uri)

@router.get('/callback')
async def zoom_callback(code: str, request: Request):
    tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
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

    tenant.zoom_connected = True
    tenant.zoom_access_token = data["access_token"]
    tenant.zoom_refresh_token = data.get("refresh_token")
    await tenant.save()
    
    return RedirectResponse("http://localhost:5173/dashboard?zoom=connected")

@router.get("/status")
async def zoom_status(request: Request):
    tenant = request.state.tenant
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found!")
    
    return JSONResponse({"zoom_connected": tenant.zoom_connected})





