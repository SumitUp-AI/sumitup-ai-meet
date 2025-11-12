import os
import base64
import httpx
import time

from fastapi import APIRouter, Requests, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse


router = APIRouter(prefix="api/v1/zoom_client/")

@router.get("/auth/zoom/login")
async def zoom_login():
    pass

@router.get("/auth/zoom/callback")
async def zoom_callback():
    pass



