from fastapi import HTTPException, APIRouter, Request
from fastapi.responses import JSONResponse, RedirectResponse


router = APIRouter(
    prefix="/api/v1",
    tags=["Zoom Integration APIs"]
)

@router.post('/zoom/callback')
async def zoom_callback(request: Request):
    pass

