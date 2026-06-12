import os
import subprocess
import sys

def download_spacy_model():
    print("Downloading spaCy model (11MB)...")
    try:
        import spacy
        try:
            spacy.load("en_core_web_sm")
            print("spaCy model already exists")
        except:
            subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
            print("spaCy model downloaded")
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "spacy"])
        subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        print("spaCy installed and model downloaded")

def download_grammar_model():
    print("Downloading grammar correction model")
    
    model_path = "core/utils/model_for_grammar_correction"
    
    if os.path.exists(model_path):
        print(f"Grammar model already exists at {model_path}")
        return
    
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    
    model_name = "Buntan/gec-t5-v1_1-small"
    
    print("Downloading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    print("Downloading model...")
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    
    print(f"Saving to {model_path}...")
    tokenizer.save_pretrained(model_path)
    model.save_pretrained(model_path)
    
    print("Grammar model downloaded and saved")

def install_dependencies():
    print("Installing required packages...")
    
    packages = ["transformers", "torch", "spacy", "rapidfuzz", "sentencepiece"]
    
    for package in packages:
        print(f"   Installing {package}...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", package])
    
    print("All dependencies installed")

def test_models():
    print("\n" + "=" * 50)
    print("TESTING MODELS")
    print("=" * 50)
    
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        doc = nlp("Hello world")
        print("spaCy model works")
    except Exception as e:
        print(f"spaCy test failed: {e}")
    
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        import torch
        
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "core", "utils", "model_for_grammar_correction")

        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
        
        test_text = "grammar: Are you listening my voice today"
        inputs = tokenizer(test_text, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model.generate(inputs["input_ids"], max_length=50)
        
        result = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        if result.startswith("grammar: "):
            result = result[9:]
        
        print(f"Grammar model works")
        print(f"Test: 'Are you listening my voice today'")
        print(f"Result: '{result}'")
        
    except Exception as e:
        print(f"Grammar model test failed: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("MODEL DOWNLOAD SCRIPT")
    print("=" * 50)
    
    install_dependencies()
    download_spacy_model()
    download_grammar_model()
    test_models()
    
    print("\n" + "=" * 50)
    print("ALL MODELS READY")
    print("=" * 50)
