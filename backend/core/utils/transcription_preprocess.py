import re
import spacy
import torch
from rapidfuzz import fuzz
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_path = "./gec-t5-v1_1-small"

tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

class TranscriptionPreProcessing:
    def __init__(self):
        self.nlp = spacy.load('en_core_web_sm', disable=["ner", "lemmatizer", "attribute_ruler"])
        self.FILLER_WORDS = {"um", "uh", "uhm", "ah", "like", "actually", "basically", "you know", "i mean", "right"}
        
    def text_cleaning_handler(self, transcript_text):
        text = re.sub(r'\s+', ' ', transcript_text).strip()
        text = re.sub(r'\b(\w+(?:\s+\w+)*)\s+\1\b', r'\1', text, flags=re.IGNORECASE)
        
        doc = self.nlp(text)
        cleaned_sentences = []
        
        for sent in doc.sents:
            filtered_tokens = [
                t.text for t in sent 
                if t.text.lower() not in self.FILLER_WORDS and t.pos_ != "INTJ" and not t.is_punct
            ]
            
            current_s = " ".join(filtered_tokens).strip()
            if not current_s:
                continue

            if cleaned_sentences:
                if fuzz.ratio(current_s.lower(), cleaned_sentences[-1].lower()) > 85:
                    continue
            
            cleaned_sentences.append(current_s)

        final_text = " ".join(cleaned_sentences)
        return final_text
        
    def grammar_correction_handler(self, text):
        if not text or len(text.strip()) < 10:
            return text
        
        input_text = f"grammar: {text}"
        inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model.generate(
                inputs["input_ids"],
                max_length=512,
                num_beams=4,
                early_stopping=True,
                temperature=0.1
            )
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if result.startswith("grammar: "):
            result = result[9:]
        
        return result.strip()
    
    def process_transcript_list(self, transcript_list):
        results = []
        for transcript in transcript_list:
            cleaned = self.text_cleaning_handler(transcript)
            corrected = self.grammar_correction_handler(cleaned)
            results.append(corrected)
        return results
    
    def process_single_transcript(self, transcript):
        cleaned = self.text_cleaning_handler(transcript)
        corrected = self.grammar_correction_handler(cleaned)
        return corrected