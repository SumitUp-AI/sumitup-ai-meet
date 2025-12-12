# Summarization Pipeline for summarzing transcription
from langchain_groq.chat_models import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains.summarize import load_summarize_chain
from langchain_core.documents import Document
from huggingface_hub import InferenceClient
from typing import List

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
    chunk_overlap=100
)


# Initial Template and Refine Template using Refine Chain Method

initial_template = """You are an expert meeting analyst. Summarize the following meeting content:

{text}

Create a concise, detailed summary focusing on:
- Key discussion points
- Decisions made
- Action items
- Important insights

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
- Combine the existing summary with the new information
- Create a concise yet comprehensive summary
- Focus on key decisions, action items, and important discussion points
- Maintain a professional, clear tone
- Organize information logically

Refined Summary""")


def summarize_meeting_transcripts(transcript: str):
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
        verbose=True
    )
    
    result = refine_chain.invoke({"input_documents": docs})
    final_summary = result["output_text"]
    
    time.sleep(0.6) # Used for Rate Limiting
    return final_summary
    
    
    
transcript = """Meeting Transcript: Business Analysis Discussion
Date: 2025-12-12
Time: 10:00 AM - 10:45 AM
Participants:

Sarah (PM) - Project Manager

Ravi (BA) - Business Analyst

10:00 AM - Sarah: Good morning, Ravi. Thanks for joining. Let's jump straight in. I want to review the initial findings from your analysis on the new feature rollout. How's the data looking?

10:02 AM - Ravi: Morning, Sarah. I've been going through the usage metrics from the past quarter, and there are a few key points. Firstly, our engagement on the current dashboard feature peaks around 11 AM and 3 PM daily. That aligns with our earlier hypothesis about prime usage windows.

10:05 AM - Sarah: Okay, so we know when users are most active. Any insights on feature adoption?

10:07 AM - Ravi: Yes. The adoption rate for the new recommendation engine is around 22% among active users. Interestingly, it's higher among premium subscribers—about 35%. So there's a clear correlation between subscription tier and engagement.

10:10 AM - Sarah: That's helpful. Does the data suggest any friction points?

10:13 AM - Ravi: A few. Users tend to drop off when navigating from the home page to the recommendations tab. Our heatmaps show hesitation around the filtering options—they might not be intuitive enough. Also, load times spike slightly when multiple filters are applied.

10:18 AM - Sarah: Makes sense. So, UX and performance optimizations are critical before a broader rollout. Anything else that stands out?

10:20 AM - Ravi: One more thing—our cohort analysis indicates users who engage with at least three personalized recommendations per week have a retention rate 18% higher than those who don't. So, encouraging interaction early could be a growth lever.

10:25 AM - Sarah: That's a solid insight. What's your recommendation for next steps?

10:28 AM - Ravi: I'd suggest three things: first, redesign the filtering UI to reduce friction. Second, optimize backend queries to improve load time. Third, consider an onboarding prompt highlighting the top three recommendations for new users—this could boost early engagement.

10:33 AM - Sarah: Sounds good. Let's prioritize the UI redesign and backend optimization for the next sprint. Can you draft a more detailed plan including estimated effort and dependencies?

10:37 AM - Ravi: Absolutely. I'll have a draft ready by tomorrow afternoon.

10:40 AM - Sarah: Perfect. That's all for now. Thanks, Ravi.

10:42 AM - Ravi: Thanks, Sarah. Talk soon."""

summary = summarize_meeting_transcripts(transcript=transcript)

print(summary)