# Business Logic
import re

class ProcessMeeting:
    def __init__(self, meeting_url):
        self.meeting_url = meeting_url
        
    def detect_meeting_platform(self):
        url = self.meeting_url.lower().strip()
        
        patterns = {
            "GMEET": r"(https?://)?meet\.google\.com\/[a-z0-9\-]+",
            "ZOOM": r"(https?://)?zoom\.us\/(j|my|s)\/[a-z0-9]+",
            "MSTEAMS": r"https?://teams\.live\.com/meet/[0-9]+(?:\?p=[a-zA-Z0-9]+)?",
        }

        for platform_name, pattern in patterns.items():
            if re.search(pattern, url, re.IGNORECASE):
                return platform_name 
                
        return "Invalid URL"

        


    
