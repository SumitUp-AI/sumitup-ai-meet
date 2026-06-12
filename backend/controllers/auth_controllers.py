from fastapi import APIRouter, HTTPException, Depends, Response, Request, status
from fastapi.responses import JSONResponse
from middlewares.limiter import limiter
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
   "billing_mode": True
}

CLOUD_DOMAINS = ['outlook.com', 'gmail.com', 'hotmail.com']

@router.post("/signup")
@limiter.limit("60/minute")
async def create_user_account(request: Request, payload: CreateUserRequest):
    
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=400, detail="This User Already Exists!")
    
    tenant_domain = payload.email.split("@")[-1]
    is_cloud = tenant_domain in CLOUD_DOMAINS

    if is_cloud:
        # Personal email — always create a new tenant per user
        tenant = Tenant(
            domain=payload.email,  # use full email as domain, not just gmail.com
            settings=DEFAULT_SETTINGS.copy()
        )
        await tenant.insert()
    else:
        # Corporate email — share tenant per domain
        tenant = await Tenant.find_one(Tenant.domain == tenant_domain)
        if not tenant:
            tenant = Tenant(
                domain=tenant_domain,
                settings=ORGANIZATION_SETTINGS.copy()
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
@limiter.limit("60/minute")
async def login_user(request: Request, payload: LoginUser, response: Response):
    # Check if password is correct or user exists
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_user(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials or User not found")
    
    # Validate that tenant exists and is active
    try:
        tenant_id = user.tenant_id.id if user.tenant_id else None
        if not tenant_id:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        tenant = await Tenant.get(tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
    except HTTPException:
        raise
    except Exception:
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
@limiter.limit("60/minute")
async def refresh_access_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    # Validate that tenant exists
    try:
        tenant_id = payload.get("tenant_id")
        if not tenant_id:
            raise HTTPException(status_code=401, detail="Invalid token: tenant_id missing")
        
        tenant = await Tenant.get(tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
    except HTTPException:
        raise
    except Exception:
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
@limiter.limit("60/minute")
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
    try:
        if request and hasattr(request.state, 'tenant'):
            tenant = request.state.tenant
        else:
            tenant_id = user.tenant_id.id if user.tenant_id else None
            if not tenant_id:
                raise HTTPException(status_code=404, detail="Tenant not found")
            tenant = await Tenant.get(tenant_id)
            if not tenant:
                raise HTTPException(status_code=404, detail="Tenant not found")
        
        return JSONResponse({
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "tenant_id": str(tenant.id),
            "tenant_domain": tenant.domain,
            "tenant_settings": tenant.settings
        })
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Error retrieving user information")
