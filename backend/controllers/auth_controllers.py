from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import JSONResponse
from models.models import User, Tenant, DEFAULT_SETTINGS
from auth.security import hash_password, verify_user
from auth.auth import create_access_token, create_refresh_token, decode_refresh_token
from auth.dependencies import get_current_user
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/v1",
    tags=["Authentication and Authorization"]
)

class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str
    remember_me: bool

# This is for only simulating organization and normal user, later to be replaced by another robust logic
# For now we would keep it as it should be

ORGANIZATION_SETTINGS = {
   "max_meetings": 100,
   "recording_enabled" : False,
   "realtime_transcription": True,
   "summarization_and_action_items": True,
   "max_team_members": 10,
   "billing_mode": True
}

CLOUD_DOMAINS = ['outlook.com', 'gmail.com', 'hotmail.com']

@router.post("/signup")
async def create_user_account(payload: CreateUserRequest):
    # Check if user already exists (by email)
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=400, detail="This User Already Exists!")
    
    tenant_domain = payload.email.split("@")[-1]
    tenant = await Tenant.find_one(Tenant.domain == tenant_domain)
    
    # Create tenant if it doesn't exist - allow multiple users per tenant
    if not tenant:
        if tenant_domain not in CLOUD_DOMAINS:
            tenant = Tenant(
                domain=tenant_domain,
                settings=ORGANIZATION_SETTINGS.copy()
            )
        else:
            tenant = Tenant(
                domain=tenant_domain,
                settings=DEFAULT_SETTINGS.copy()
            )            
        await tenant.insert()
    
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        tenant_id=tenant
    )

    await user.insert()

    return JSONResponse({"message": "User created successfully! Login to continue"}, status_code=201)

@router.post("/login")
async def login_user(payload: LoginUser, response: Response):
    # Check if password is correct or user exists
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_user(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials or User not found")
    
    # Validate that tenant exists and is active
    tenant = await Tenant.find_one(Tenant.id == user.tenant_id.id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    token = create_access_token({
        "user_id": str(user.id),
        "tenant_id": str(user.tenant_id.id)
    })

    duration = 7 if payload.remember_me else 1

    refresh_token = create_refresh_token({
        "user_id": str(user.id),
        "tenant_id": str(user.tenant_id.id)
    }, duration=duration)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=(7*24*60*60) if payload.remember_me else (1*24*60*60),
        secure=False,
        samesite='lax' 
    )
    
    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.post("/refresh")
async def refresh_access_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    # Validate that tenant exists
    tenant = await Tenant.get(payload["tenant_id"])
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Create new access token
    new_access_token = create_access_token({
        "user_id": payload["user_id"],
        "tenant_id": payload["tenant_id"]
    })

    return JSONResponse({
        "access_token": new_access_token,
        "token_type": "bearer"
    }, status_code=200)

@router.post("/logout")
async def logout_user(request: Request, response: Response):
    response.delete_cookie(
        "refresh_token",
        path="/",
        secure=False,
        httponly=True,
        samesite='lax'
    )
    return {"message": "Logged out successfully"}

@router.get("/me")
async def me(user=Depends(get_current_user), request: Request = None):
    tenant = request.state.tenant if request else await Tenant.get(user.tenant_id.id)
    return JSONResponse({
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "tenant_id": str(tenant.id),
        "tenant_domain": tenant.domain,
        "tenant_settings": tenant.settings
    })
