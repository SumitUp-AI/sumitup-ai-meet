from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from auth.auth import decode_access_token
from models.models import User, Tenant

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")

async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    # Decode the access token
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    tenant_id = payload.get("tenant_id")
    if not tenant_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token!"
        )

    user = await User.get(payload["user_id"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if str(user.tenant_id.id) != tenant_id:
        raise HTTPException(status_code=403, detail="Access denied for this tenant")

    
    tenant = await Tenant.get(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    request.state.tenant = tenant

    return user