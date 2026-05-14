from datetime import datetime, timezone
from .transcription_preprocess import TranscriptionPreProcessing
from models.models import ActionItems, Meeting, Transcripts, MeetingSummaryStatus
from pipelines.summarization import summarize_meeting_transcript
from pipelines.action_items import create_action_items_json
from beanie import PydanticObjectId
import re
import logging

logger = logging.getLogger(__name__)

async def get_meeting_and_transcripts(meeting_id):
    meeting = await Meeting.get(PydanticObjectId(meeting_id))
    if not meeting:
        logger.error(f"Meeting {meeting_id} not found")
        return None, None
    
    transcripts = await Transcripts.find(
        Transcripts.meeting_id.id == meeting.id
    ).sort(+Transcripts.timestamp_ms).to_list()
    
    if not transcripts:
        logger.warning(f"No transcripts found for meeting {meeting_id}")
        return meeting, []
    
    return meeting, transcripts

class MeetingPostProcessing(TranscriptionPreProcessing):
    def __init__(self):
        super().__init__()

    def detect_meeting_platform(self, meeting_url):
        url = meeting_url.lower().strip()
        
        patterns = {
            "GMEET": r"(https?://)?meet\.google\.com\/[a-z0-9\-]+",
            "ZOOM": r"(https?://)?zoom\.us\/(j|my|s)\/[a-z0-9]+",
            "MSTEAMS": r"https?://teams\.live\.com/meet/[0-9]+(?:\?p=[a-zA-Z0-9]+)?",
        }

        for platform_name, pattern in patterns.items():
            if re.search(pattern, url, re.IGNORECASE):
                return platform_name 
                
        return "Invalid URL"


    async def clean_transcripts(self, meeting_id):
        meeting, transcripts = await get_meeting_and_transcripts(meeting_id)
        if not meeting or not transcripts:
            return None
        return self.process_transcript_list(transcripts)

    async def create_summarization_from_transcription(self, meeting_id, results):
        meeting = await Meeting.get(PydanticObjectId(meeting_id))
        if not meeting:
            return None, None
        
        meeting.summary_status = MeetingSummaryStatus.PROCESSING
        await meeting.save() 
        
        try:
            combined_transcript = " ".join(results)
            generated_summary = summarize_meeting_transcript(combined_transcript)
            
            meeting.summary = generated_summary["summary"].replace("**", "")
            meeting.summary_status = MeetingSummaryStatus.READY
            await meeting.save()
            return meeting_id, meeting.summary
        except Exception as e:
            logger.error(f"Summarization failed for {meeting_id}: {e}")
            meeting.summary_status = MeetingSummaryStatus.FAILED
            meeting.summary_error = str(e)
            await meeting.save()
            return None, None

    async def create_action_items_from_generated_summary(self, meeting_id):
        meeting = await Meeting.get(PydanticObjectId(meeting_id))
        if not meeting or not meeting.summary:
            return None
        
        try:
            action_items = create_action_items_json(meeting.summary)
            filtered_items = [item for item in action_items["items"] if item["confidence"] >= 0.7]

            saved_items = []
            for item in filtered_items:
                deadline = None
                if item.get("deadline"):
                    try:
                        deadline = datetime.fromisoformat(item["deadline"].replace("Z", "+00:00"))
                    except (ValueError, AttributeError):
                        deadline = None
            
                action_item_doc = ActionItems(
                    meeting=meeting,
                    title=item["title"],
                    assignee=item.get("assignee"),
                    description=item.get("description"),
                    deadline=deadline or datetime.now(timezone.utc),
                    confidence=int(item["confidence"] * 100)
                )
                await action_item_doc.insert()
                saved_items.append(item)
            return saved_items
        except Exception as e:
            logger.error(f"Action item generation failed: {e}")
            return None

    async def execute_complete_pipeline(self, meeting_id):
        # 1. Cleaning
        cleaned_results = await self.clean_transcripts(meeting_id)
        if not cleaned_results:
            return {"status": "failed", "error": "Cleaning/Transcripts failed"}

        # 2. Summarization
        mid, summary = await self.create_summarization_from_transcription(meeting_id, cleaned_results)
        if not summary:
            return {"status": "failed", "error": "Summarization failed"}

        # 3. Action Items
        action_items = await self.create_action_items_from_generated_summary(mid)
        if action_items is None:
            return {"status": "failed", "error": "Action items generation failed"}
            
        return {
            "meeting_id": mid,
            "summary": summary,
            "action_items": action_items,
            "status": "completed"
        }