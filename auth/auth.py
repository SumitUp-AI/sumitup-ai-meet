from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timezone, timedelta
from pwdlib import PasswordHash
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

import jwt
import os

load_dotenv(find_dotenv())

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(
    prefix="/api/v1/",
    tags=["Authentication and Authorization"]
)
