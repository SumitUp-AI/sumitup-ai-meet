from fastapi import APIRouter, HTTPException, Depends, Response
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

@router.post("/signup")
async def create_user_account(payload: CreateUserRequest):
    # Check if user exists
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=400, detail="This User Already Exists!")
    # Create a Tenant for User
    tenant_key = payload.email.split("@")[-1]
    tenant = await Tenant.find_one(Tenant.domain == tenant_key)
    if not tenant:
        tenant = Tenant(
            domain=tenant_key,
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
    # CHeck if password is correct or user exists
    user = await User.find_one(User.email == payload.email)
    if not user and not verify_user(payload.password, user.hashed_password):
        raise HTTPException(stauts_code=401, detail="Invalid Credentials or User not found")
    
    # Else Create Access Token with a time
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
        key="REFRESH_TOKEN",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite='lax',
        max_age=(7 * 24 * 60 * 60) if payload.remember_me else (1 * 24 * 60 * 60)
    )

    return JSONResponse({
        "access_token": token,
        "token_type": "bearer"
    }, status_code=200)


@router.post("/refresh")
async def refresh_access_token(request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    
    payload = decode_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
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
async def logout_user(response: Response):
    response.delete_cookie("refresh_token")
    return JSONResponse({"message": "Logged out successfully"}, status_code=200)

@router.get("/me")
async def me(user=Depends(get_current_user)):
    return JSONResponse({
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "tenant_id": str(user.tenant_id.id)
    })
