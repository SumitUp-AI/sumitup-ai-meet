# Helpers.py
import httpx
import asyncio
import os

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
            self._assemblyai_api_key = os.getenv("ASSEBLYAI_API_KEY")
        
        elif provider == "whisper":
            
            if not os.getenv("WHISPER_PROVIDER_API_KEY"):
                raise ValueError("API Key for Whisper is required, You can provide the API key for Whisper or any other Cloud GPU instance that uses Whisper")
            
            self.provider = provider
            self._openai_api_key = os.getenv("WHISPER_PROVIDER_API_KEY")
        
        
class AttendeeBot(STTServiceProvider):
    _model_name: str
    _language: str
    _bot_id: str
    _api_key: str
 
    def __init__(self, bot_id, bot, api_key, meeting_url, provider):
        super().__init__(provider=provider)
        self.bot = bot
        self._bot_id = bot_id
        self._api_key = api_key
        self._model_name = "nova-2" # By Default
        self.meeting_url = meeting_url
 
    def set_model(self, model_name):
        self._model_name = model_name
 
    def define_service(self):
        pass

    def get_model(self):
        return self._model_name
  
    def set_language(self, language):
        self._language = language
  
    def _get_language(self): 
        return self._language
 
    async def join_meeting(self): 
        # From here Danish you should add the logic to join the meeting using the bot.
        # This is a placeholder implementation.
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                response = await client.post(
                    "https://localhost:8000/api/v1/bots",
                    headers={
                        "Authorization": f"Token {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "meeting_url": self.meeting_url,
                        "bot_name": self.bot,  # or whatever is correct
                    }
                )

                response.raise_for_status()

                return response.json()

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
 
    async def leave_meeting(self, bot_id):
        # Leave it as it is for now, we will implement this later
        pass
 
 
 