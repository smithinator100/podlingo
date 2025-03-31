import requests
import json

url = "https://api.v8.unrealspeech.com/speech"

payload = {
    "Text": "Había tan poca información sobre este asesinato en los periódicos antiguos o en línea, así que decidí solicitar los documentos del tribunal y revisar alrededor de 200 páginas de registros, transcripciones judiciales y declaraciones juradas para entender exactamente qué sucedió.",
    "VoiceId": "ef_dora",
    "Bitrate": "192k",
    "AudioFormat": "mp3",
    "OutputFormat": "uri",
    "TimestampType": "word",
    "sync": False
}

headers = {
    'Authorization': 'Bearer oJ3RWUWz1QftS6yNjU70KnrMOyDaGD2rLFnI8JGs2M5OVMUe4GbODo',
    'Content-Type': 'application/json'
}

try:
    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status()  # Raise an exception for bad status codes
    print(response.text)
except requests.exceptions.RequestException as e:
    print(f"Error occurred: {e}")
    if hasattr(e.response, 'text'):
        print(f"Response text: {e.response.text}")
