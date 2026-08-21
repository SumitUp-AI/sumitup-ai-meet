import asyncio
from enum import Enum
from datetime import datetime, timezone
from core.helpers.helpers import AttendeeClientBot
from core.utils.meeting_postprocessing import MeetingPostProcessing
from models.models import MeetingState, MeetingPlatform, MeetingSTTProvider, Meeting, Transcripts
from fastapi import BackgroundTasks

import logging

logger = logging.getLogger(__name__)

processor = MeetingPostProcessing()

class MeetingService:

    BETA_15_MINS_LIMIT = 15 * 60

    async def launch_bot(self, meeting, attendee_api_key):
        """Spins up a Bot to Join Meeting Platform such as Zoom / Microsoft Teams 
        / Google Meet via Attendee SDK"""

        if not meeting:
            raise AttributeError("MeetingObject is object but expected None Type")

        try:
            bot_client = AttendeeClientBot(
                bot_name="Sumitup Meeting Bot",
                api_key=attendee_api_key,
                meeting_url=meeting.meeting_url,
                provider=MeetingSTTProvider.assemblyai,
                language="en", # English Only
                meeting=meeting
            )

            result = await bot_client.join_meeting()
            logger.info("Attendee Bot is Started in Background")        

            if not result:
                raise AttributeError("No JSON Response Received from Attendee for Bot Data")

            meeting.state = result["state"]
            meeting.bot_id = result["bot_id"]
            meeting.created_at = result["created_at"]

            await meeting.save()

            
        except Exception as e:
            meeting.state = MeetingState.fatal_error
            await meeting.save()
            logger.error(f"Failed to Launch Bot for Meeting, {e}")
            raise RuntimeError("Failed to Launch Attendee Bot")
            

    def add_all_mapped_participants(self):
        pass

    async def create_meeting(self, meeting_title, meeting_url, tenant) -> Meeting:
        """Creates Meeting Instance Before Launching Bot"""
        meeting_processor = MeetingPostProcessing()
        detected_platform = meeting_processor.detect_meeting_platform(self.meeting_url)
        try: 
            detected_platform = MeetingPlatform(detected_platform)
        except (ValueError, TypeError) as e:
            logger.error(f"Meeting Platform conversion failed, {e}")
            raise

        meeting = Meeting(
            name=meeting_title,
            meeting_link=meeting_url,
            platform=detected_platform,
            created_by=tenant,
            started_at=datetime.now(timezone.utc),
            ended_at=None,
            state=MeetingState.launching
        )

        await meeting.save()

        return meeting


    async def transcript_handler(self, meeting: Meeting, data: dict):
        """Listen for Transcript Data Event from Attendee Webhook"""
        transcript = Transcripts(
                meeting_id=meeting,
                speaker_id=data["speaker_uuid"],
                speaker_name=data["speaker_name"],
                duration_ms=data["duration_ms"],
                timestamp_ms=data["timestamp_ms"],
                transcript=data["transcription"]["transcript"]
            )
        await transcript.insert()


    async def meeting_state_handler(self, meeting: Meeting, data: dict, attendee_api_key: str, background_task: BackgroundTasks):
        """Listen for Meeting State Handling Event and other Trigger events from Attendee Webhook"""
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
                        logger.info(f"Out-of-order event ignored: {event_time}")
                        should_update = False
                    else:
                        meeting.last_state_change_time = event_time
                else:
                    meeting.last_state_change_time = event_time
            except ValueError:
                logger.error("Error parsing created_at timestamp")

        if should_update:
            new_state = MeetingState(data["new_state"])
            meeting.state = new_state
            await meeting.save()
            logger.info(f"Meeting State :{new_state}")

        # If state is ended, trigger post processing
        if new_state == MeetingState.leaving:
            background_task.add_task(
                auto_leave_meeting,
                meeting,
                
            )

        if new_state == MeetingState.ended:
            meeting.ended_at = event_time
            await meeting.save()
            background_task.add_task(
                processor.execute_complete_pipeline,
                meeting_id=str(meeting.id),
            )

        async def auto_leave_meeting(self, meeting, attendee_api_key):
            """Auto Leave Meeting After 15 Mins.."""
            if not meeting:
                raise AttributeError("Meeting Object expected but got NoneType")

            await asyncio.sleep(self.BETA_15_MINS_LIMIT)

            if meeting.state == MeetingState.ended:
                logger.info("Meeting Already Ended, Aborting Auto Leave")
                return

            if meeting.state == MeetingState.joined_recording:
                try:
                    bot_client = AttendeeClientBot(
                                    bot_name="Sumitup Meeting Bot",
                                    api_key=attendee_api_key,
                                    meeting_url=meeting.meeting_url,
                                    provider=MeetingSTTProvider.assemblyai,
                                    language="en", # English Only
                                    meeting=meeting
                                )

                    result = await bot_client.leave_meeting()

                    logger.info(f"Prompting Bot to Leave Meeting, Recording State: {result["recording_state"]}, Transcription Status: {result["transcription_state"]}, Meeting State: {result["meeting_state"]}")
                
                except Exception as e:
                    logger.error(f"Error Occured while requesting bot to leave, exception msg {e}")
                    raise RuntimeError("Error Occured while requesting Attendee Client to leave the meeting")
            else:
                logger.info("Can't Leave Meeting if bot state is not in recording mode")




        
    
