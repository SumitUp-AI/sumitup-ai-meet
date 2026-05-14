import os
import hmac
import hashlib
import base64
import json
from dotenv import load_dotenv, find_dotenv
from models.models import Meeting, Transcripts, MeetingState, MeetingSummaryStatus
from datetime import datetime, timezone
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Request, Header
from pipelines import summarize_meeting_transcripts

load_dotenv(find_dotenv())

router = APIRouter(
    prefix="/api/v1",
    tags=["Attendee Webhooks"]
)

WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", None)


async def trigger_meeting_summarization(meeting: Meeting):
    """Trigger automatic summarization when meeting ends"""
    try:
        print(f"Starting summarization for meeting {meeting.id}")
        
        # Get all transcripts for the meeting
        transcripts = await Transcripts.find(
            Transcripts.meeting_id.id == meeting.id
        ).sort(+Transcripts.timestamp_ms).to_list()
        
        if not transcripts:
            print(f"No transcripts found for meeting {meeting.id}")
            return
        
        print(f"Found {len(transcripts)} transcripts for meeting {meeting.id}")
        
        # Combine transcripts
        combined_text = "\n".join([f"{t.speaker_name}: {t.transcript}" for t in transcripts])
        
        # Update status to processing
        meeting.summary_status = MeetingSummaryStatus.PROCESSING
        await meeting.save()
        print(f"Updated meeting {meeting.id} status to PROCESSING")
        
        # Generate summary
        summary = await summarize_meeting_transcripts(combined_text)
        final_summary = summary.replace("**", "")
        
        # Save summary
        meeting.summary = final_summary
        meeting.summary_status = MeetingSummaryStatus.READY
        await meeting.save()
        
        print(f"Summary generated successfully for meeting {meeting.id}")
        
    except Exception as e:
        print(f"Error generating summary for meeting {meeting.id}: {str(e)}")
        meeting.summary_status = MeetingSummaryStatus.FAILED
        meeting.summary_error = str(e)
        await meeting.save()


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


async def handle_state_change(meeting: Meeting, data: dict):
    event_created_at_str = data.get("created_at")
    should_update = True

    if event_created_at_str:
        try:
            event_time = datetime.fromisoformat(
                event_created_at_str.replace('Z', '+00:00')
            )
            if meeting.last_state_change_time:
                current = meeting.last_state_change_time
                if current.tzinfo is None:
                    current = current.replace(tzinfo=timezone.utc)
                if event_time < current:
                    print(f"Out-of-order event ignored: {event_time}")
                    should_update = False
                else:
                    meeting.last_state_change_time = event_time
            else:
                meeting.last_state_change_time = event_time
        except ValueError:
            print("Error parsing created_at timestamp")

    if should_update:
        old_state = meeting.state
        meeting.state = data["new_state"]
        
        # If meeting just ended, trigger summarization
        if data["new_state"] == "ended" and old_state != "ended":
            meeting.ended_at = datetime.now(timezone.utc)
            await trigger_meeting_summarization(meeting)
        
        await meeting.save()
        print(f"Meeting {meeting.id} state → {data['new_state']}")


async def handle_transcript(meeting: Meeting, data: dict):
    transcript = Transcripts(
        meeting_id=meeting.id,
        speaker_id=data["speaker_uuid"],
        speaker_name=data["speaker_name"],
        duration_ms=data["duration_ms"],
        timestamp_ms=data["timestamp_ms"],
        transcript=data["transcription"]["transcript"]
    )
    await transcript.save()


@router.post("/webhook")
async def receive_webhook(
    request: Request,
    x_webhook_signature: str = Header(None)
):
    body_bytes = await request.body()
    
    # Add debug logging
    print(f" WEBHOOK RECEIVED: {len(body_bytes)} bytes")
    print(f" Signature present: {bool(x_webhook_signature)}")

    # Signature checks — return 200 always so Attendee doesn't retry
    if not x_webhook_signature:
        print(" Webhook received without signature header")
        return JSONResponse({"message": "OK"}, status_code=200)

    if not WEBHOOK_SECRET:
        print(" WEBHOOK_SECRET not configured")
        return JSONResponse({"message": "OK"}, status_code=200)

    if not verify_signature(body_bytes, WEBHOOK_SECRET, x_webhook_signature):
        print(" Invalid webhook signature")
        return JSONResponse({"message": "OK"}, status_code=200)

    payload = json.loads(body_bytes)
    bot_id = payload.get("bot_id")
    trigger = payload.get("trigger", "")
    data = payload.get("data", {})
    
    print(f"Valid webhook - Bot ID: {bot_id}, Trigger: {trigger}")

    if not bot_id:
        print(f" Webhook with no bot_id — trigger: {trigger}")
        return JSONResponse({"message": "OK"}, status_code=200)

    meeting = await Meeting.find_one(Meeting.bot_id == bot_id)

    if not meeting:
        print(f" No meeting found for bot_id: {bot_id}")
        return JSONResponse({"message": "OK"}, status_code=200)
        
    print(f" Found meeting: {meeting.id} - {meeting.name}")

    if "bot.state_change" in trigger and "new_state" in data:
        print(f" Processing state change: {data.get('old_state')} → {data.get('new_state')}")
        await handle_state_change(meeting, data)

    elif "transcript.update" in trigger:
        print(f" Processing transcript update for meeting {meeting.id}")
        await handle_transcript(meeting, data)

    else:
        print(f" Unhandled trigger: {trigger}")

    return JSONResponse({"message": "OK"}, status_code=200)