import os
import csv
import pickle
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever

def ingest_dataset(input_file: str, persist_directory: str = "./chroma_db"):
    """
    Reads extracted meetings data, groups utterances by meeting, 
    splits each meeting semantically, and stores the chunks in ChromaDB.
    """
    print(f"Reading data from {input_file}...")
    
    # We will group all utterances by meeting name first. 
    # This gives the SemanticChunker a full block of text to evaluate contextually.
    meeting_texts = {}
    
    with open(input_file, 'r', encoding='utf-8') as f:
        # Using csv.reader natively handles the double quotes format we created
        reader = csv.reader(f, skipinitialspace=True)
        for row in reader:
            if len(row) >= 3:
                meeting_name = row[0]
                speaker = row[1]
                text = row[2]
                
                content = f"{speaker} said: {text}"
                
                if meeting_name not in meeting_texts:
                    meeting_texts[meeting_name] = []
                
                meeting_texts[meeting_name].append(content)

    documents = []
    print(f"Grouped utterances into {len(meeting_texts)} full meetings.")
    
    for meeting_name, utterances in meeting_texts.items():
        # Join all utterances of a single meeting into one large text block
        full_meeting_text = " ".join(utterances)
        
        # Create a single Document per meeting with the metadata 
        doc = Document(
            page_content=full_meeting_text,
            metadata={"meeting_name": meeting_name}
        )
        documents.append(doc)

    print("Initializing embedding model for Semantic Chunker...")
    # The SemanticChunker requires an embedding model to calculate semantic distance between sentences
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Chunking meeting documents using SemanticChunker (This may take a while)...")
    text_splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=80,
        min_chunk_size=64
    )

    # Split the long meeting documents into smaller, semantically cohesive chunks
    chunks = text_splitter.split_documents(documents)
    
    print(f"Created {len(chunks)} semantic chunks. Storing embeddings in ChromaDB...")
    
    # Show chunks on terminal
    for i, chunk in enumerate(chunks):
        print(f"\n--- Chunk {i+1} ({chunk.metadata.get('meeting_name', 'Unknown Meeting')}) ---")
        print(chunk.page_content)
        print("-" * 40)

    # Store in Chroma DB
    vectorstore = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=persist_directory,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    # Retrieve all documents from ChromaDB to build a complete BM25 index
    print("Retrieving all documents from ChromaDB to build complete BM25 index...")
    all_data = vectorstore.get()
    all_texts = all_data['documents']
    all_metadatas = all_data['metadatas']
    
    print(f"Building BM25 index from {len(all_texts)} total documents...")
    all_docs = [Document(page_content=text, metadata=meta or {}) for text, meta in zip(all_texts, all_metadatas)]
    bm25_retriever = BM25Retriever.from_documents(all_docs)
    
    bm25_path = os.path.join(persist_directory, "bm25_retriever.pkl")
    print(f"Saving complete BM25 index to '{bm25_path}'...")
    with open(bm25_path, "wb") as f:
        pickle.dump(bm25_retriever, f)
    
    print(f"Data ingestion complete! Vector store saved at '{persist_directory}'")
    return vectorstore


if __name__ == "__main__":
    input_txt = os.path.join("data", "extracted_meetings.txt")
    if not os.path.exists(input_txt):
        print(f"Error: Could not find {input_txt}")
    else:
        ingest_dataset(input_txt)
