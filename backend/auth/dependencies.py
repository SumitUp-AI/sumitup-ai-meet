from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth.auth import decode_access_token
from models.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = await User.get(payload["user_id"])
    if not user:
        raise HTTPException(401, "User not found")

    return user

