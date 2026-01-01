import requests

class ZoomClient:

    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.base_url = "https://zoom.us"
        self.base_api_url = "https://api.zoom.us/v2/"

    def create_meeting(self):
        pass

    def create_access_token(self):
        pass

    