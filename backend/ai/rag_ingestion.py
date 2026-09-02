from langchain_core.documents import Document
from langchain_experimental.text_splitter import SemanticChunker
from models.models import Meeting, Transcripts, Embedding
from typing import List
from ai.embedding_model import embeddings
from config.settings import settings
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

mongodb_uri = settings.mongo_uri

async def ingest_meeting_transcripts(meeting_id: str):
    
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
    transcript_info_list = []
    for t in transcripts:
        duration = t.timestamp_ms / 1000
        extracted_date = datetime.fromtimestamp(duration, tz=timezone.utc())
        each_chunk = f"[{extracted_date}] {t.speaker_name}: {t.transcript}"
        transcript_info_list.append(each_chunk)

    full_meeting_text = " ".join([chunk for chunk in transcript_info_list])
    
    doc = Document(
        page_content=full_meeting_text,
        metadata={
            "meeting_id": str(meeting.id),
        }
    )

    logger.info("Chunking Content using Semantic Chunking")
    text_splitter = SemanticChunker(
        embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=80,
        min_chunk_size=64
    )

    chunks = text_splitter.split_documents([doc])
    logger.info("Generating Embeddings for each document chunk")

    # Enrich each chunk with metadata
    enriched_texts = []
    for chunk in chunks:
        enriched_chunk = metadata_header + chunk.page_content
        enriched_texts.append(enriched_chunk)

    # Generate embeddings for enriched chunks
    embedding_vectors = embeddings.embed_documents(enriched_texts)
    
    
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