import os
import hmac
import hashlib
import base64
import json
from dotenv import load_dotenv, find_dotenv
from models.models import Meeting, Transcripts, MeetingState
from datetime import datetime, timezone

from fastapi.responses import JSONResponse
from fastapi import HTTPException, APIRouter, Request, Header
load_dotenv(find_dotenv())


router = APIRouter(
    prefix="",
    tags=["Attendee Webhooks for Transcription and Meeting State"]
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


@router.post("/webhook")
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
    print(f"Verified Webhook Received: {payload}")
    
    # Process Database Update
    bot_id = payload.get("bot_id")
    
    if bot_id:
        meeting = await Meeting.find_one(Meeting.bot_id == bot_id)

        if meeting:
            # Update State
            # Check for nested data structure (e.g. from state_change trigger)
            if "bot.state_change" in payload["trigger"] and "new_state" in payload["data"]:
                
                # Check for timestamp to handle out-of-order delivery
                event_created_at_str = payload["data"].get("created_at")
                should_update = True
                
                if event_created_at_str:
                    try:
                         # normalize event_time to UTC
                        event_time = datetime.fromisoformat(event_created_at_str.replace('Z', '+00:00'))
                        
                        if meeting.last_state_change_time:
                            # Standardize timezone to UTC for comparison
                            current_last_change = meeting.last_state_change_time
                            if current_last_change.tzinfo is None:
                                current_last_change = current_last_change.replace(tzinfo=timezone.utc)
                            
                            # If event is older than our last update, ignore it
                            if event_time < current_last_change:
                                print(f"Ignoring out-of-order event. Current: {current_last_change}, Received: {event_time}")
                                should_update = False
                            else:
                                meeting.last_state_change_time = event_time
                        else:
                             meeting.last_state_change_time = event_time
                    except ValueError:
                        print("Error parsing created_at timestamp")
                
                if should_update:
                    meeting.state = payload["data"]["new_state"]
                    await meeting.save()
                
            # Save Transcript
            elif "transcript.update" in payload["trigger"]:
                # This assumes payload["transcript"] is the text content
                # If it's a structure with speaker/time, parse accordingly.
                # For now, implementing basic storage as requested.
                new_transcript = Transcripts(
                    meeting_id=meeting.id,
                    speaker_id=payload["data"]["speaker_uuid"],
                    speaker_name=payload["data"]["speaker_name"],
                    duration_ms=payload["data"]["duration_ms"],
                    timestamp_ms=payload["data"]["timestamp_ms"],
                    transcript=payload["data"]["transcription"]["transcript"]
                )
                await new_transcript.save()

            else:
                raise HTTPException(status_code=200, detail="Trigger not found")
                
        else:
            raise HTTPException(status_code=200, detail="Meeting not found for bot_id")

    else:
        raise HTTPException(status_code=200, detail="Invalid bot_id")

    return JSONResponse(content={"message": "Transcription Received and Verified"}, status_code=200)