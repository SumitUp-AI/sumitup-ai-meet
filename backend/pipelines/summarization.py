# Summarization Pipeline for summarzing transcription
from langchain_groq.chat_models import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains.summarize import load_summarize_chain
from langchain_core.documents import Document
import asyncio

import os
import time
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model="llama-3.1-8b-instant",
    temperature=0.0,
    max_retries=2
)

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,
    separators=["\n", ".", ","]
)


# Initial Template and Refine Template using Refine Chain Method

initial_template = """You are an expert meeting analyst. Summarize the following meeting content:

{text}

Here are the instructions following:
- Generate the overall summary of a meeting, what's discussed only in a professional manner.
- Capture every information necessary required to do.


Summary:"""

initial_prompt = PromptTemplate(
    template=initial_template,
    input_variables=["text"]
)


refine_template = PromptTemplate(template="""You are an expert meeting analyst. Your task is to create a comprehensive meeting summary.

Existing summary (if any):
{existing_answer}

New information from the meeting:
{text}

Instructions:
- Add this new information to the current one.
- Preserve the information and don't change the whole context of meeting information.
- Final summary should reflect whole meeting, which the agenda, what was discussed and followup.
- Don't need to mention date, time and action items here.
Refined Summary""")


async def summarize_meeting_transcripts(transcript: str):
    """This Method breaks the transcripts into chunks and summarizes them using LLM provided through Groq API Inference
       and then combines the summary and then again summarizes the collected summary using refine method.
       
       transcript: str -  The raw transcript to be passed here
       """
    chunks = text_splitter.split_text(transcript)
    docs = [Document(page_content=chunk) for chunk in chunks]
    refine_chain = load_summarize_chain(
        llm=llm,
        chain_type="refine",
        question_prompt=initial_prompt,
        refine_prompt=refine_template,
        return_intermediate_steps=False,
        verbose=False # Set to True if you want to see logs what's going on
    )
    
    result = await refine_chain.ainvoke({"input_documents": docs})
    final_summary = result["output_text"]
    
    await asyncio.sleep(0.6) # Used for Rate Limiting
    return final_summary
