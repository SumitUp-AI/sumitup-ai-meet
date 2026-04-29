import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def view_all_chunks(persist_directory="./chroma_db"):
    """Loads ChromaDB and prints all stored chunks and their metadata."""
    if not os.path.exists(persist_directory):
        print(f"Error: ChromaDB directory '{persist_directory}' does not exist.")
        return

    print(f"Loading ChromaDB from '{persist_directory}'...")
    
    # We need the same embedding model to load the collection properly
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    vectorstore = Chroma(
        persist_directory=persist_directory, 
        embedding_function=embeddings
    )
    
    # Access the underlying chromadb collection to retrieve all data
    collection = vectorstore._collection
    result = collection.get()
    
    ids = result.get('ids', [])
    documents = result.get('documents', [])
    metadatas = result.get('metadatas', [])
    
    if not ids:
        print("The ChromaDB collection is empty.")
        return
        
    print(f"Found {len(ids)} chunks in the database.\n")
    print("=" * 50)
    
    for i in range(len(ids)):
        print(f"--- Chunk {i+1} ---")
        print(f"ID: {ids[i]}")
        if metadatas and len(metadatas) > i and metadatas[i]:
            print(f"Metadata: {metadatas[i]}")
        if documents and len(documents) > i:
            print(f"Content:\n{documents[i]}")
        print("-" * 50 + "\n")

if __name__ == "__main__":
    view_all_chunks()
