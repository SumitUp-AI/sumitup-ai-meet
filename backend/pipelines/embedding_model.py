from langchain_huggingface import HuggingFaceEmbeddings

print("Initializing global embedding model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")