import json
import os
import re
from translation import Translator

def format_json_file(input_file):
    """
    Format a JSON file by combining all 'text' fields and breaking into paragraphs.
    Each sentence (ending with a period) becomes its own paragraph with both English and Spanish versions.
    
    Args:
        input_file (str): Path to the input JSON file
        
    Returns:
        str: Path to the formatted output file
    """
    print(f"Processing file: {input_file}")
    
    # Read the input JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Combine all text fields
    combined_text = ""
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict) and 'text' in item:
                combined_text += item['text'] + " "
    elif isinstance(data, dict) and 'text' in data:
        combined_text = data['text']
    
    # Clean up the text
    text = combined_text.replace('\n', ' ')
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Split into sentences using regex
    # This pattern looks for: 
    # 1. Capital letter at start or after period
    # 2. Everything until a period followed by space or end of string
    # 3. Must contain at least a few words
    sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$'
    sentences = [s.strip() for s in re.split(sentence_pattern, text) if s.strip()]
    
    # Filter out incomplete sentences and duplicates
    valid_sentences = []
    for sentence in sentences:
        # Basic checks for valid sentences
        if (len(sentence.split()) > 3 and  # Has multiple words
            sentence[0].isupper() and  # Starts with capital letter
            sentence.endswith(('.', '!', '?')) and  # Ends with proper punctuation
            sentence not in valid_sentences):  # Not a duplicate
            valid_sentences.append(sentence)
    
    print(f"Found {len(valid_sentences)} valid sentences to translate")
    
    # Create output data structure with numbered paragraphs
    output_data = {
        'original_file': os.path.basename(input_file)
    }
    
    # Add each sentence as a separate paragraph with translations
    for i, sentence in enumerate(valid_sentences, 1):
        try:
            print(f"\nTranslating sentence {i}/{len(valid_sentences)}")
            print(f"English: {sentence}")
            translator = Translator(sentence)
            print(f"Spanish: {translator.spanish_text}")
            output_data[f'id{i}'] = {
                'en': sentence,
                'es': translator.spanish_text
            }
        except Exception as e:
            print(f"Error translating sentence {i}: {str(e)}")
            # If translation fails, still include the English version
            output_data[f'id{i}'] = {
                'en': sentence,
                'es': None
            }
    
    # Generate output filename
    output_file = os.path.splitext(input_file)[0] + '-formatted.json'
    
    # Write the formatted data to a new JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nFormatted JSON saved to: {output_file}")
    return output_file

if __name__ == "__main__":
    # Example usage
    input_file = "podcasts/park predators/The_Angler.json"  # Updated path to the target file
    output_file = format_json_file(input_file)
