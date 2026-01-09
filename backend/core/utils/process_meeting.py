# Business Logic
import re

class ProcessMeeting:
    def __init__(self, meeting_url):
        self.meeting_url = meeting_url
        
    def detect_meeting_platform(self):
        url = self.meeting_url.lower().strip()
        
        patterns = {
            "GMEET": r"meet\.google\.com\/[a-z0-9\-]+",
            "ZOOM": r"zoom\.us\/(j|my|s)\/[a-z0-9]+",
            "MSTEAMS": r"teams\.microsoft\.com\/l\/meetup-join\/",
        }

        for platform_name, pattern in patterns.items():
            if re.search(pattern, url):
                return platform_name 
                
        return "Invalid URL"

        


    
