from langchain_core.documents import Document
from langchain_experimental.text_splitter import SemanticChunker
from models.models import Meeting, Transcripts, Embedding
from typing import List
from pipelines.embedding_model import embeddings
from config.settings import settings

mongodb_uri = settings.mongo_uri

async def ingest_meeting_transcripts(meeting_id: str):
    """
    Fetches transcripts for a specific meeting, splits them semantically,
    generates embeddings, and stores them in the Embedding MongoDB collection.
    """
    # print(f"Starting ingestion for meeting: {meeting_id}")
    
    meeting = await Meeting.get(meeting_id)
    if not meeting:
        raise ValueError(f"Meeting not found: {meeting_id}")

    transcripts: List[Transcripts] = await Transcripts.find(
        Transcripts.meeting_id.id == meeting.id
    ).sort(+Transcripts.timestamp_ms).to_list()

    if not transcripts:
        print("No transcripts found for this meeting. Aborting ingestion.")
        return None

    speaker_names = list(set([t.speaker_name for t in transcripts if t.speaker_name]))
    
    # Build metadata header with actual meeting participants
    metadata_header = f"""Meeting: {meeting.name or 'Untitled Meeting'}
    Date: {meeting.created_at.strftime('%Y-%m-%d %I:%M %p')}
    Platform: {meeting.platform.value if meeting.platform else 'Unknown'}
    Speakers: {', '.join(speaker_names) if speaker_names else 'Not recorded'}
    Duration: {(meeting.ended_at - meeting.created_at).total_seconds() // 60 if meeting.ended_at else 'Ongoing'} minutes
    ---
    """
    
    full_meeting_text = " ".join([t.transcript for t in transcripts])
    
    doc = Document(
        page_content=full_meeting_text,
        metadata={
            "meeting_id": str(meeting.id),
        }
    )

    # print("Chunking meeting document using SemanticChunker...")
    text_splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=80,
        min_chunk_size=64
    )

    chunks = text_splitter.split_documents([doc])
    # print(f"Created {len(chunks)} semantic chunks. Generating embeddings...")

    # Enrich each chunk with metadata
    enriched_texts = []
    for chunk in chunks:
        enriched_chunk = metadata_header + chunk.page_content
        enriched_texts.append(enriched_chunk)

    # Generate embeddings for enriched chunks
    embedding_vectors = embeddings.embed_documents(enriched_texts)
    
    # print(f"Storing {len(enriched_texts)} embeddings in MongoDB...")
    # Delete existing embeddings for this meeting to avoid duplicates if re-ingested
    await Embedding.find(Embedding.meeting_id.id == meeting.id).delete()
    
    # Store new embeddings with enriched text
    embedding_docs = []
    for enriched_text, embedding_vector in zip(enriched_texts, embedding_vectors):
        embedding_docs.append(
            Embedding(
                meeting_id=meeting,
                chunk=enriched_text,
                vector_embedding=embedding_vector
            )
        )
    
    if embedding_docs:
        await Embedding.insert_many(embedding_docs)
     
    # print(f"Data ingestion complete for meeting {meeting_id}!")
    return True