import asyncio
import os
import sys
from dotenv import load_dotenv, find_dotenv

# Load env variables before anything else
load_dotenv(find_dotenv())

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))



from database.connection import init_db
from models.models import Meeting, Transcripts
from pipelines.rag_ingestion import ingest_meeting_transcripts
from pipelines.rag_retrieval import retrieve_answer



async def main():
    print("=========================================")
    print("   SumitUp AI - RAG Chatbot CLI Test     ")
    print("=========================================\n")
    
    print("Initializing Database Connection...")
    await init_db()
    
    # 1. Check if we have any transcripts to ingest
    transcripts_count = await Transcripts.count()
    print(f"Total Transcripts in DB: {transcripts_count}")
    
    if transcripts_count == 0:
        print("\n⚠️  There are no transcripts in the database.")
        print("The chatbot cannot be tested until a meeting is completed and transcribed.")
        return

    # 2. Ask user if they want to run ingestion
    print("\n--- Step 1: Ingestion ---")
    run_ingestion = input("Do you want to run the ingestion pipeline to build the vector store now? (y/n): ")
    if run_ingestion.lower() == 'y':
        meetings = await Meeting.find_all().to_list()
        meetings_with_transcripts = 0
        
        for meeting in meetings:
            count = await Transcripts.find(Transcripts.meeting_id.id == meeting.id).count()
            if count > 0:
                print(f"-> Ingesting Meeting: {meeting.name or meeting.id} ({count} transcript chunks)")
                await ingest_meeting_transcripts(str(meeting.id))
                meetings_with_transcripts += 1
                
        if meetings_with_transcripts == 0:
            print("No transcripts found linked to any existing meetings.")
            return
        print("Ingestion complete.")
    else:
        print("Skipping ingestion (assuming data/chroma_db already exists).")

    # 3. Interactive Chat
    print("\n--- Step 2: Chat ---")
    print("Type 'exit' to quit.\n")
    
    chat_history = []
    current_summary = ""
    
    while True:
        query = input("\nYou: ")
        if query.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break
        if not query.strip():
            continue
            
        print("Thinking...")
        try:
            answer, queries, new_summary = await retrieve_answer(query, chat_history, current_summary)
            print(f"\nAI: {answer}")
            print(f"\n[Debug] Search Queries Used: {queries}")
            
            # Update local mock history
            chat_history.append({"role": "user", "content": query})
            chat_history.append({"role": "ai", "content": answer})
            current_summary = new_summary
        except Exception as e:
            print(f"Error during retrieval: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
