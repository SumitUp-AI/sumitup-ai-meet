import os
from langchain_core.documents import Document
from langchain_experimental.text_splitter import SemanticChunker
from models.models import Meeting, Transcripts, Embedding
from typing import List
from pipelines.embedding_model import embeddings
from langchain_mongodb.index import create_fulltext_search_index
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo import MongoClient
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

mongodb_uri = os.getenv("MONGO_URI")

async def ingest_meeting_transcripts(meeting_id: str):
    """
    Fetches transcripts for a specific meeting, splits them semantically,
    generates embeddings, and stores them in the Embedding MongoDB collection.
    """
    print(f"Starting ingestion for meeting: {meeting_id}")
    
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise ValueError(f"Meeting not found: {meeting_id}")

    transcripts: List[Transcripts] = await Transcripts.find(
        Transcripts.meeting_id.id == meeting.id
    ).sort(+Transcripts.timestamp_ms).to_list()

    if not transcripts:
        print("No transcripts found for this meeting. Aborting ingestion.")
        return None

    # Join the transcript segments directly since they already contain speaker names
    full_meeting_text = " ".join([t.transcript for t in transcripts])
    
    doc = Document(
        page_content=full_meeting_text,
        metadata={
            "meeting_id": str(meeting.id),
        }
    )

    print("Chunking meeting document using SemanticChunker...")
    text_splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=80,
        min_chunk_size=64
    )

    chunks = text_splitter.split_documents([doc])
    print(f"Created {len(chunks)} semantic chunks. Generating embeddings...")

    # Generate embeddings for each chunk
    texts = [chunk.page_content for chunk in chunks]
    embedding_vectors = embeddings.embed_documents(texts)
    
    print(f"Storing {len(chunks)} embeddings in MongoDB...")
    # Delete existing embeddings for this meeting to avoid duplicates if re-ingested
    await Embedding.find(Embedding.meeting_id.id == meeting.id).delete()
    
    # Store new embeddings
    embedding_docs = []
    for text, embedding_vector in zip(texts, embedding_vectors):
        embedding_docs.append(
            Embedding(
                meeting_id=meeting,
                chunk=text,
                vector_embedding=embedding_vector
            )
        )
    
    if embedding_docs:
        await Embedding.insert_many(embedding_docs)

    # Create search indexes using LangChain MongoDB helpers
    client = MongoClient(mongodb_uri)
    db_name = os.getenv("DB_NAME", "test")
    collection = client[db_name]["embedding"]
    
    vector_store = MongoDBAtlasVectorSearch(
       collection=collection,
       embedding=embeddings,
       index_name="vector_index",
       text_key="chunk",
       embedding_key="vector_embedding",
       relevance_score_fn="cosine"
    )
    vector_store.create_vector_search_index(dimensions=384)

    create_fulltext_search_index(
       collection=collection,
       field="chunk",
       index_name="search_index"
    )
    client.close()
        
    print(f"Data ingestion complete for meeting {meeting_id}!")
    return True
