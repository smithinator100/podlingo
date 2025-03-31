import requests
import os

class ElevenTTS:
    def __init__(self, api_key=None):
        """Initialize the ElevenLabs client with API key"""
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            raise ValueError("API key is required. Set it as an environment variable ELEVENLABS_API_KEY or pass it to the constructor.")
        
    def generate_audio(self, text, output_path, voice_id="wgHvco1wiREKN0BdyVx5", model_id="eleven_multilingual_v2", speed=0.8):
        """Generate audio from text and save it to the specified path"""
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        data = {
            "text": text,
            "model_id": model_id,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5,
                "speaking_rate": speed
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            with open(output_path, "wb") as f:
                f.write(response.content)
            return output_path
        else:
            raise Exception(f"Error generating audio: {response.text}")

