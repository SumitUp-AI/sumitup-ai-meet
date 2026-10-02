from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_TOKEN_SECRET = os.getenv("REFRESH_TOKEN_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    if not SECRET_KEY:
        raise RuntimeError("SECRET KEY is missing or not set!")
    
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    
def create_refresh_token(data: dict, duration: int):
    if not REFRESH_TOKEN_SECRET:
        raise RuntimeError("REFRESH_TOKEN_SECRET is missing or not set!")
    
    to_encode = data.copy()
    # User will set the days based on that
    # If user says Remember Me, We will implement 7 days max for refreshing otherwise 1 day.
    expires = datetime.now(timezone.utc) + timedelta(days=duration)
    to_encode.update({"exp": expires})
    return jwt.encode(to_encode, REFRESH_TOKEN_SECRET, algorithm=ALGORITHM)

def decode_refresh_token(refresh_token: str):
    try:
        return jwt.decode(refresh_token, REFRESH_TOKEN_SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None


