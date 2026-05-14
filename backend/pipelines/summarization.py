# Summarization Pipeline for Sumitup
from langchain_groq.chat_models import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.documents import Document
from langchain_classic.chains.summarize import load_summarize_chain
from enum import Enum
from pydantic import BaseModel
import os
import time
import logging
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────
# Meeting Length Detection
# ─────────────────────────────────────────
class MeetingLength(str, Enum):
    SHORT  = "short"   # < 30 mins  (~3000 words)
    MEDIUM = "medium"  # 30-60 mins (~8000 words)
    LONG   = "long"    # 60+ mins   (8000+ words)

def detect_meeting_length(transcript: str) -> MeetingLength:
    word_count = len(transcript.split())
    if word_count < 3000:
        return MeetingLength.SHORT
    elif word_count < 8000:
        return MeetingLength.MEDIUM
    else:
        return MeetingLength.LONG

# ─────────────────────────────────────────
# LLM Setup — Two models for rate control
# ─────────────────────────────────────────
# Fast model for chunk summarization
llm_fast = ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2
)

# Smarter model for final synthesis (optional — uses less tokens)
llm_smart = ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama3-70b-8192",
    temperature=0.0,
    max_retries=2
)

# ─────────────────────────────────────────
# Text Splitter — Larger chunks = fewer API calls = less rate limiting
# ─────────────────────────────────────────
text_splitter_long = RecursiveCharacterTextSplitter(
    chunk_size=6000,    # Bigger chunks for long meetings
    chunk_overlap=200,
    separators=["\n\n", "\n", ".", ","]
)

text_splitter_short = RecursiveCharacterTextSplitter(
    chunk_size=3000,    # Smaller chunks for short meetings
    chunk_overlap=100,
    separators=["\n\n", "\n", ".", ","]
)

# ─────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────
initial_template = """You are an expert meeting analyst for Sumitup.
Summarize the following meeting content concisely:

{text}

Instructions:
- Generate overall summary of what was discussed professionally
- Capture every necessary information
- Be concise — avoid repetition

Summary:"""

initial_prompt = PromptTemplate(
    template=initial_template,
    input_variables=["text"]
)

refine_template = """You are an expert meeting analyst for Sumitup.
Your task is to create a comprehensive meeting summary.

Existing summary:
{existing_answer}

New information from the meeting:
{text}

Instructions:
- Integrate new information into existing summary
- Preserve original context — don't rewrite everything
- Final summary should reflect whole meeting agenda
- Don't mention date, time or action items here

Refined Summary:"""

refine_prompt = PromptTemplate(
    template=refine_template,
    input_variables=["existing_answer", "text"]
)

map_template = """Summarize this portion of a meeting transcript:

{text}

Be concise. Capture key points only.

Partial Summary:"""

map_prompt = PromptTemplate(
    template=map_template,
    input_variables=["text"]
)

combine_template = """You are combining multiple partial meeting summaries into one final summary.

Partial Summaries:
{text}

Instructions:
- Combine into one cohesive professional summary
- Remove repetition
- Preserve all unique information
- Reflect whole meeting agenda

Final Summary:"""

combine_prompt = PromptTemplate(
    template=combine_template,
    input_variables=["text"]
)


def safe_invoke_with_retry(chain, docs: list, max_retries: int = 3) -> str:
    """Handles Groq rate limiting with exponential backoff"""
    for attempt in range(max_retries):
        try:
            result = chain.invoke({"input_documents": docs})
            return result["output_text"]
        
        except Exception as e:
            error_msg = str(e).lower()
            
            if "rate_limit" in error_msg or "rate limit" in error_msg:
                # Extract wait time from error or use exponential backoff
                wait_time = (2 ** attempt) * 15  # 15s, 30s, 60s
                logger.warning(f"Rate limit hit. Waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                time.sleep(wait_time)
            else:
                logger.error(f"Unexpected error: {e}")
                raise e
    
    raise Exception("Max retries exceeded — Groq rate limit persistent")

def summarize_meeting_transcript(transcript: str) -> dict:
    """
    Summarizes meeting transcripts of any length.
    Automatically selects strategy based on meeting length.
    
    transcript: str — cleaned transcript from your pipeline
    returns: dict with summary + metadata
    """
    
    if not transcript or not transcript.strip():
        return {"summary": "", "strategy": "none", "chunks": 0}
    
    meeting_length = detect_meeting_length(transcript)
    logger.info(f"Meeting length detected: {meeting_length.value}")
    
    start_time = time.time()
    
    # ── SHORT MEETING → Stuff (single prompt, no chunking needed)
    if meeting_length == MeetingLength.SHORT:
        logger.info("Strategy: STUFF (short meeting)")
        
        docs = [Document(page_content=transcript)]
        chain = load_summarize_chain(
            llm=llm_fast,
            chain_type="stuff",
            prompt=initial_prompt
        )
        result =  chain.invoke({"input_documents": docs})
        summary = result["output_text"]
        strategy = "stuff"
        chunks_used = 1
    
    # ── MEDIUM MEETING → Refine (quality over speed)
    elif meeting_length == MeetingLength.MEDIUM:
        logger.info("Strategy: REFINE (medium meeting)")
        
        chunks = text_splitter_short.split_text(transcript)
        docs = [Document(page_content=chunk) for chunk in chunks]
        logger.info(f"Split into {len(docs)} chunks")
        
        chain = load_summarize_chain(
            llm=llm_fast,
            chain_type="refine",
            question_prompt=initial_prompt,
            refine_prompt=refine_prompt,
            return_intermediate_steps=False,
            verbose=False
        )
        
        # Rate limit safe invocation
        summary =  safe_invoke_with_retry(chain, docs)
        strategy = "refine"
        chunks_used = len(docs)
    
    # ── LONG MEETING → Batched Map Reduce (handles 1-2 hour meetings)
    else:
        logger.info("Strategy: BATCHED MAP-REDUCE (long meeting)")
        
        chunks = text_splitter_long.split_text(transcript)
        docs = [Document(page_content=chunk) for chunk in chunks]
        logger.info(f"Split into {len(docs)} chunks")
        
        # Process in batches to avoid TPM rate limit
        batch_size = 3  # 3 chunks per batch — safe for 6000 TPM
        batch_summaries = []
        
        for i in range(0, len(docs), batch_size):
            batch = docs[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(len(docs) + batch_size - 1)//batch_size}")
            
            batch_chain = load_summarize_chain(
                llm=llm_fast,
                chain_type="map_reduce",
                map_prompt=map_prompt,
                combine_prompt=combine_prompt,
                return_intermediate_steps=False,
                verbose=False
            )
            
            batch_summary =  safe_invoke_with_retry(batch_chain, batch)
            batch_summaries.append(batch_summary)
            
            # Rate limit buffer between batches
            if i + batch_size < len(docs):
                logger.info("Waiting 12s between batches for rate limit...")
                time.sleep(12)
        
        # Final synthesis — combine all batch summaries
        logger.info("Synthesizing all batch summaries...")
        combined_text = "\n\n".join(batch_summaries)
        final_docs = [Document(page_content=combined_text)]
        
        final_chain = load_summarize_chain(
            llm=llm_smart,  # Use smarter model for final synthesis
            chain_type="stuff",
            prompt=combine_prompt
        )
        final_result =  final_chain.invoke({"input_documents": final_docs})
        summary = final_result["output_text"]
    
    elapsed = time.time() - start_time
    
    return {
        "summary": summary,
        "meeting_length": meeting_length.value,
        "processing_time_seconds": round(elapsed, 2)
    }