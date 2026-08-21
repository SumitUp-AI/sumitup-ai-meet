import hmac
import hashlib
import base64
import json
import logging
from models.models import Meeting
from fastapi.responses import JSONResponse
from fastapi import APIRouter, BackgroundTasks, Request, Header, BackgroundTasks
from services.meeting_service import MeetingService
from config.settings import settings

router = APIRouter(
    prefix="/api/v1",
    tags=["Attendee Webhooks"]
)

WEBHOOK_SECRET = settings.webhook_secret
ATTENDEE_API_KEY = settings.attendee_api_key
logger = logging.getLogger(__name__)


meet_service = MeetingService()

def verify_signature(payload_bytes: bytes, secret: str, received_signature: str) -> bool:
    try:
        secret_decoded = base64.b64decode(secret)
        payload_json = json.loads(payload_bytes)
        canonical_json = json.dumps(
            payload_json,
            sort_keys=True,
            ensure_ascii=False,
            separators=(",", ":")
        )
        signature = hmac.new(
            secret_decoded,
            canonical_json.encode("utf-8"),
            hashlib.sha256
        ).digest()
        expected = base64.b64encode(signature).decode("utf-8")
        return hmac.compare_digest(expected, received_signature)
    except Exception:
        return False


@router.post("/webhook")
async def receive_webhook(
    request: Request,
    background_task: BackgroundTasks,
    x_webhook_signature: str = Header(None),
):
    body_bytes = await request.body()
    # Signature checks — return 200 always so Attendee doesn't retry
    if not x_webhook_signature:
        logger.error("Invalid or Missing Webhook Signature")
        return JSONResponse({"message": "Missing Webhook Signature"}, status_code=404)

    if not verify_signature(body_bytes, WEBHOOK_SECRET, x_webhook_signature):
        logger.error("Webhook Authentication Failed for Bot Service")
        return JSONResponse({"message": "Authentication Failed for Webhook"}, status_code=400)

    payload = json.loads(body_bytes)
    bot_id = payload.get("bot_id")
    trigger = payload.get("trigger", "")
    data = payload.get("data", {})

    meeting = await Meeting.find_one(Meeting.bot_id == bot_id)

    if not meeting:
        logger.error("Current Meeting Not Found")
        return JSONResponse({"message": "Server Error"}, status_code=404)
        
    if "bot.state_change" in trigger and "new_state" in data:
        await meet_service.meeting_state_handler(meeting=meeting, data=data, attendee_api_key=ATTENDEE_API_KEY, background_task=background_task)

    elif "transcript.update" in trigger:
        logger.info(f"Processing transcript update for Current Meeting")
        await meet_service.transcript_handler(meeting, data)

    return JSONResponse({"message": "OK"}, status_code=200)
