from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ai.rag_retrieval import retrieve_answer, update_summary
from models.models import (
    User,
    MeetingInvitedParticipant,
    ChatMessage,
    ChatMessageSession
)
from langchain.messages import AIMessage, HumanMessage
from langchain_classic.memory import ConversationSummaryBufferMemory
from middlewares.limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["AI Chatbot Endpoint API"]
)

class ChatPayload(BaseModel):
    user_id: str
    query: str

async def get_meeting_scoped_ids(user_id: str):
    # Get Meeting Ids related to Participant Ids and The owner who owns it
    # current_user = await User.get(PydanticObjectId(user_id))
    pass

# Replace Global Chat with other ChatMemory by summarizing only last N messages
# Save Session in DB
@router.post("/chat")
@limiter.limit("6/minute")
async def chat_with_meeting(request: Request, payload: ChatPayload):
    """
    Chat with the global meeting transcripts using RAG.
    """
    global chat_history
    if 'chat_history' not in globals():
        chat_history = []
    
    try:
        answer, used_queries = await retrieve_answer(
            query=payload.query.strip(),
            chat_history=chat_history
        )

        combined_queries = payload.query + " " + " ".join(used_queries) if used_queries else payload.query
        
        if answer and combined_queries:
            new_exchange = (combined_queries, answer)
            
            if len(chat_history) < 2:
                # 0 items -> [new]
                # 1 item -> [new, old]
                chat_history.insert(0, new_exchange)
            else:
                # We have at least 2 exchanges
                oldest_exchange = chat_history[1]
                current_summary = chat_history[2] if len(chat_history) == 3 else ""
                
                # Update the summary with the oldest exchange
                new_summary = await update_summary(current_summary, oldest_exchange)
                
                # Pop index 1 (oldest exchange)
                chat_history.pop(1)
                
                # Insert new exchange at index 0
                chat_history.insert(0, new_exchange)
                
                # Store the summary at index 2
                if len(chat_history) == 2:
                    chat_history.append(new_summary)
                else:
                    chat_history[2] = new_summary
            
        return JSONResponse(content={
            "answer": answer.strip()
        })
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve answer: {str(e)}")
