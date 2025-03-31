import os
from openai import OpenAI
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Translator:
    def __init__(self, text: str, api_key: Optional[str] = None):
        """
        Initialize the Translator with text to translate and an OpenAI API key.
        
        Args:
            text (str): The text to translate to Spanish
            api_key (str, optional): OpenAI API key. If not provided, will use the key from .env file.
        """
        self.text = text
        self.api_key = api_key or os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key is required. Either pass it to the constructor or set it in .env file.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.spanish_text = self.translate_to_spanish()
    
    def translate_to_spanish(self) -> str:
        """
        Translate the text to Spanish using ChatGPT.
        
        Returns:
            str: The translated text in Spanish
            
        Raises:
            Exception: If the translation request fails
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional translator. Translate the following text to Spanish. Only provide the translation, no explanations."},
                    {"role": "user", "content": self.text}
                ],
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            raise Exception(f"Translation failed: {str(e)}")

# Example usage:
if __name__ == "__main__":
    try:
        text = "Hello, how are you today?"
        translator = Translator(text)
        print(f"Original: {translator.text}")
        print(f"Spanish: {translator.spanish_text}")
    except Exception as e:
        print(f"Error: {e}") 