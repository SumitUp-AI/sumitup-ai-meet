import json
import os

def extract_meeting_data(json_file_path, output_txt_path):
    """
    Reads the MeetingBank JSON file and extracts meeting name, speaker name, and text
    into a plain string format, saving it to a plain text file.
    """
    print(f"Processing '{json_file_path}'...")
    
    # Check if file exists
    if not os.path.exists(json_file_path):
        print(f"Error: Could not find {json_file_path}")
        return

    try:
        # Load the large JSON file
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        print(f"Successfully loaded JSON. Found {len(data)} meetings. Extracting transcripts...")

        # Open the output text file
        with open(output_txt_path, 'w', encoding='utf-8') as out_f:
            # The schema has meeting names as the top-level keys
            for meeting_name, meeting_data in data.items():
                
                # Inside each meeting, we look into 'itemInfo'
                item_info = meeting_data.get('itemInfo', {})
                for item_id, item_data in item_info.items():
                    
                    # Inside 'itemInfo', there is a 'transcripts' list
                    transcripts = item_data.get('transcripts', [])
                    for entry in transcripts:
                        speaker = entry.get('speaker', 'Unknown')
                        text = entry.get('text', '').strip()
                        
                        if text:
                            # Formatting into a single line with double quotes
                            clean_text = text.replace('"', '\\"').replace('\n', ' ')
                            out_f.write(f'"{meeting_name}", "speaker:{speaker}", "{clean_text}"\n')
                            
        print(f"Extraction complete! Data saved to '{output_txt_path}'")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Define file paths
    dataset_path = os.path.join("meeting_dataset", "MeetingBank.json")
    output_path = os.path.join("data", "extracted_meetings.txt")
    
    # Make sure 'data' folder exists for output
    os.makedirs("data", exist_ok=True)
    
    # Run the extraction
    extract_meeting_data(dataset_path, output_path)
