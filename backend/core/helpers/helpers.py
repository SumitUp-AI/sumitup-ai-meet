# Helpers.py
import httpx

class AttendeeBot:
 __model_name: str
 __language: str
 
 def __init__(self, bot_id, bot, api_key, meeting_url):
  self.bot = bot
  self.__bot_id = bot_id
  self.__api_key = api_key
  self.__model_name = "nova-2" # Nova 2
  self.meeting_url = meeting_url
 
 def set_model(self, model_name):
  self.__model_name = model_name
 
 def get_model(self):
  return self.__model_name
  
 def set_language(self, language):
  self.language = language
  
 def _get_language(self): 
  return self.__language
 
 def join_meeting(self):
  pass
 
 def leave_meeting(self, bot_id):
  pass
 
 
 