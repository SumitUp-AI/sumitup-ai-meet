# Helpers.py
import httpx
import asyncio
import os
from datetime import datetime
from models import models

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
        
            if not os.getenv("DEEPGRAM_API_KEY"):
                raise ValueError("DEEPGRAM_API_KEY is required for Deepgram Service")
        
            self.provider = provider
            self._deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
        
        elif provider == "assemblyai":
            
            if not os.getenv("ASSEMBLYAI_API_KEY"):
                raise ValueError("ASSEMBLYAI_API_KEY is required for Assembly.ai Service")
            
            self.provider = provider
            self._assemblyai_api_key = os.getenv("ASSEMBLYAI_API_KEY")
        
        elif provider == "openai":
            
            if not os.getenv("OPENAI_PROVIDER_API_KEY"):
                raise ValueError("API Key for OpenAI is required")
            
            self.provider = provider
            self._openai_api_key = os.getenv("OPENAI_PROVIDER_API_KEY")
        
        
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
                        self.meeting.state = data["state"]
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
                raise RuntimeError(
                    f"Join meeting failed "
                    f"(status={e.response.status_code}): {e.response.text}"
                )

            except httpx.RequestError as e:
            # Network / DNS / connection issues
                raise RuntimeError(
                    f"Could not connect to Bot: {str(e)}"
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
 
 
 