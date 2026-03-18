from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_user(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

