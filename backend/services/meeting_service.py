from enum import Enum
from datetime import datetime, timezone
from core.helpers.helpers import AttendeeClientBot
from core.utils.meeting_postprocessing import MeetingPostProcessing
from models.models import MeetingState, MeetingPlatform, MeetingSTTProvider, Meeting

import logging

logger = logging.getLogger(__name__)

class MeetingService:

    def __init__(self, meeting_title, tenant, meeting_url, attendee_api_key):
        self.meeting_title = meeting_title
        self.tenant = tenant
        self.meeting_url = meeting_url
        self.attendee_api_key = attendee_api_key

    def check_for_meeting_status_and_duration(self):
        pass

    async def launch_meeting(self, meeting):
        """Spins up a Bot to Join Meeting Platform such as Zoom / Microsoft Teams 
        / Google Meet via Attendee SDK"""

        if not meeting:
            raise AttributeError("MeetingObject is object but expected None Type")

        try:
            bot_client = AttendeeClientBot(
                bot_name="Sumitup Meeting Bot",
                api_key=self.attendee_api_key,
                meeting_url=meeting.meeting_url,
                provider=MeetingSTTProvider.assemblyai,
                language="en", # English Only
                meeting=meeting
            )

            result = await bot_client.join_meeting()
            

            if not result:
                raise AttributeError("No JSON Response Received from Attendee for Bot Data")

            meeting.state = result["state"]
            meeting.bot_id = result["bot_id"]
            meeting.created_at = result["created_at"]

            await meeting.save()
                
            return {"status": "success", "state": meeting.state, "created_at": meeting.created_at}
        
        except Exception as e:
            logger.error(f"Failed to Launch Meeting, {e}")
            raise
            return {"status": "Failed to Launch Bot For Meeting Platform"}

    def add_all_mapped_participants(self):
        pass

    async def create_meeting(self) -> Meeting:
        """Creates Meeting Instance Before Launching Bot"""
        meeting_processor = MeetingPostProcessing()
        detected_platform = meeting_processor.detect_meeting_platform(self.meeting_url)
        try: 
            detected_platform = MeetingPlatform(detected_platform)
        except (ValueError, TypeError) as e:
            logger.error(f"Meeting Platform conversion failed, {e}")
            raise

        meeting = Meeting(
            name=self.meeting_title,
            meeting_link=self.meeting_url,
            platform=detected_platform,
            created_by=self.tenant,
            started_at=datetime.now(timezone.utc),
            ended_at=None,
            state=MeetingState.launching
        )

        await meeting.save()

        return {
            "name": meeting.title,
            "meeting_link": meeting.meeting_link,
            "platform": meeting.platform,
            "state": meeting.state,
            "created_by": meeting.created_by
        }


    def transcript_handler(self):
        pass

    async def meeting_state_handler(self, meeting: Meeting, payload: dict):
        bot_id = payload.get("bot_id")
        trigger = payload.get("trigger", "")
        data = payload.get("data", {})

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
                logger.error("Error parsing created_at timestamp")

        if should_update:
            new_state = data["new_state"]
            meeting.state = new_state
            await meeting.save()
            logger.info(f"Meeting State :{new_state}")
            




        
    
