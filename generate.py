import json
import os
from pathlib import Path
from eleven_tts import ElevenTTS

def generate_audio_files():
    # Read the JSON file
    json_path = "podcasts/Park Predators/The_Angler-formatted.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Create output directory if it doesn't exist
    output_dir = Path("podcasts/Park Predators/audio")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Get the base filename without extension
    base_filename = Path(json_path).stem
    
    # Initialize the TTS client with API key from environment
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    tts = ElevenTTS(api_key=api_key)
    
    # Process each ID in the JSON
    for key, value in data.items():
        if key in ['original_file']:  # Skip metadata keys
            continue
            
        # Generate English audio (normal speed)
        if 'en' in value:
            output_path_en = output_dir / f"{base_filename}-{key}-en.mp3"
            tts.generate_audio(
                text=value['en'],
                output_path=str(output_path_en),
                speed=1  # Normal speed for English
            )
            print(f"Generated English audio for {key}")
        
        # Generate Spanish audio (slower speed)
        if 'es' in value:
            output_path_es = output_dir / f"{base_filename}-{key}-es.mp3"
            tts.generate_audio(
                text=value['es'],
                output_path=str(output_path_es),
                speed=1  # Slower speed for Spanish
            )
            print(f"Generated Spanish audio for {key}")

if __name__ == "__main__":
    generate_audio_files()
