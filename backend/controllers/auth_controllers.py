from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from models.models import User, Tenant, DEFAULT_SETTINGS
from auth.security import hash_password, verify_user
from auth.auth import create_access_token
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
async def login_user(payload: LoginUser):
    # CHeck if password is correct or user exists
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_user(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials or User not found")
    
    # Else Create Access Token with a time
    token = create_access_token({
        "user_id": str(user.id),
        "tenant_id": str(user.tenant_id.id)
    })

    return JSONResponse({
        "access_token": token,
        "token_type": "bearer"
    }, status_code=200)

@router.get("/me")
async def me(user=Depends(get_current_user)):
    return JSONResponse({
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "tenant_id": str(user.tenant_id.id)
    })
