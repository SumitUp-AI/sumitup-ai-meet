# Helpers.py
import httpx
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv, find_dotenv
from models.models import MeetingState

load_dotenv(find_dotenv())

class STTServiceProvider:
    #  We are supporting these inferences for the cloud providers and for the self hosted
    _deepgram_api_key: str
    _assemblyai_api_key: str
    _openai_api_key: str
 
    supported_providers = ["deepgram", "assemblyai", "whisper"]
 
    def __init__(self, provider):
        if provider not in self.supported_providers:
            raise ValueError("ERROR! Provider not supported")
    
        if provider == "deepgram":
        
            deepgram_key = os.getenv("DEEPGRAM_API_KEY")
            if not deepgram_key:
                raise ValueError("DEEPGRAM_API_KEY is required for Deepgram Service but not found in environment variables")
        
            self.provider = provider
            self._deepgram_api_key = deepgram_key
        
        elif provider == "assemblyai":
            
            assemblyai_key = os.getenv("ASSEMBLYAI_API_KEY")
            if not assemblyai_key:
                raise ValueError("ASSEMBLYAI_API_KEY is required for Assembly.ai Service but not found in environment variables")
            
            self.provider = provider
            self._assemblyai_api_key = assemblyai_key
        
        elif provider == "openai":
            
            openai_key = os.getenv("OPENAI_PROVIDER_API_KEY")
            if not openai_key:
                raise ValueError("API Key for OpenAI is required but not found in environment variables")
            
            self.provider = provider
            self._openai_api_key = openai_key
        
        
class AttendeeBot(STTServiceProvider):
    _language: str
    _api_key: str
    
    # Adding Multiple Settings for ASR Providers
    def __init__(self, bot, api_key, meeting_url, provider, language, meeting=None):
        super().__init__(provider=provider)
        self._bot = bot
        self._api_key = api_key
        self._language = language           
        self._meeting_url = meeting_url
        self.meeting = meeting

        self.openai_transcription_settings = {
            "openai": {
                "model": "gpt-4o-transcribe-diarize",
                "language": self._language
            }
        }
        self.deepgram_transcription_settings = {
            "deepgram": {
                "detect_language": True,
                "language": self._language,
                "model": "nova-2"
            }
        }
        self.assemblyai_transcription_settings = {
            "assembly_ai": {
                    "language_detection": True,
                    "language_detection_options": {
                    "expected_languages": ["en", "ur"],
                    "fallback_language": self._language
                }
            }
        }

 
    async def join_meeting(self):
        if self.provider == 'deepgram':
            settings = self.deepgram_transcription_settings
        elif self.provider == 'assemblyai':
            settings = self.assemblyai_transcription_settings
        else:
            settings = self.openai_transcription_settings

        # Validate that we have the necessary API key
        if not self._api_key:
            raise ValueError("ATTENDEE_API_KEY is missing. Please set ATTENDEE_API_KEY in environment variables")

        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.post(
                    "http://localhost:8000/api/v1/bots",
                    headers={
                        "Authorization": f"Token {self._api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "meeting_url": self._meeting_url,
                        "bot_name": self._bot,
                        "transcription_settings": settings,
                        "recording_settings":{
                            "format":"none"
                        }
                    }
                )

                response.raise_for_status()
                data = response.json()

                if self.meeting:
                    if "id" in data:
                        self.meeting.bot_id = data["id"]
                    if "meeting_url" in data:
                        self.meeting.meeting_link = data["meeting_url"]
                    if "state" in data:
                        try:
                            # Convert string state to MeetingState enum
                            state_value = data["state"]
                            # Try to match the state value to MeetingState enum
                            self.meeting.state = MeetingState(state_value)
                        except (ValueError, KeyError):
                            # If conversion fails, try with lowercase
                            try:
                                self.meeting.state = MeetingState(state_value.lower())
                            except (ValueError, AttributeError):
                                print(f"Warning: Could not convert state '{state_value}' to MeetingState enum")
                    if "created_at" in data:
                        try:
                            # handling simple iso format
                            dt = datetime.fromisoformat(data["created_at"].replace('Z', '+00:00'))
                            self.meeting.created_at = dt
                        except ValueError:
                            pass # Fallback if format is unexpected
                    await self.meeting.save()
                return data

            except httpx.HTTPStatusError as e:
                error_detail = e.response.text
                if "credentials_not_found" in error_detail.lower():
                    raise RuntimeError(
                        f"Credentials not found on bot service. "
                        f"Ensure {self.provider.upper()}_API_KEY is set on the bot service. "
                        f"Error: {error_detail}"
                    )
                raise RuntimeError(
                    f"Join meeting failed "
                    f"(status={e.response.status_code}): {error_detail}"
                )

            except httpx.RequestError as e:
            # Network / DNS / connection issues
                raise RuntimeError(
                    f"Could not connect to Bot at localhost:8000: {str(e)}. "
                    f"Make sure the bot service is running."
                )
 
    async def leave_meeting(self):
        if not self.meeting or not self.meeting.bot_id:
            raise ValueError("No meeting object with bot_id found.")
        
        effective_bot_id = self.meeting.bot_id

        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.post(
                    f"http://localhost:8000/api/v1/bots/{effective_bot_id}/leave",
                    headers={
                        "Authorization": f"Token {self._api_key}",
                        "Content-Type": "application/json",
                    }
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                raise RuntimeError(
                    f"Failed to leave the meeting "
                    f"(status={e.response.status_code}): {e.response.text}"
                )

            except httpx.RequestError as e:
            # Network / DNS / connection issues
                raise RuntimeError(
                    f"Could not connect to Bot: {str(e)}"
                )
 
 
 