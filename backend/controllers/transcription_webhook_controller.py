import os
import hmac
import hashlib
import base64
import json
from dotenv import load_dotenv, find_dotenv

from fastapi.responses import JSONResponse
from fastapi import HTTPException, APIRouter, Request, Header
load_dotenv(find_dotenv())


router = APIRouter(
    prefix="/api/v1/webhooks",
    tags=["Attendee Webhooks for Transcription"]
)

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", None)


def verify_signature(payload_bytes: bytes, secret: str, received_signature: str) -> bool:
    try:
        secret_decoded = base64.b64decode(secret)
        # Canonicalize the JSON to match the sender's hashing format
        payload_json = json.loads(payload_bytes)
        canonical_json = json.dumps(payload_json, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
        
        signature = hmac.new(
            secret_decoded,
            canonical_json.encode("utf-8"), 
            hashlib.sha256
        ).digest()
        
        expected_signature = base64.b64encode(signature).decode("utf-8")
        return hmac.compare_digest(expected_signature, received_signature)
    except Exception:
        return False


@router.post("/get_transcription")
async def get_transcription(request: Request, x_webhook_signature: str = Header(None)):
    # Get raw body for signature verification
    body_bytes = await request.body()

    # Verify Header Presence
    if not x_webhook_signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    # This code should not be included in Production, It is for testing purpose
    if WEBHOOK_SECRET is None:
        raise HTTPException(status_code=400, detail="Error Webhook Secret Not Found! Kindly update your environment variables")

    # Verify Signature Integrity
    if not verify_signature(body_bytes, WEBHOOK_SECRET, x_webhook_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # 3. Process validated data
    payload = json.loads(body_bytes)
    # print(f"Verified Webhook Received: {payload}")
    
    return JSONResponse(content={"message": "Transcription Received and Verified"}, status_code=200)