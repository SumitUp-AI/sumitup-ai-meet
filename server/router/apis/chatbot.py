from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ai.rag_retrieval import retrieve_answer, update_summary
from ai.conversational_summary import get_or_create_chat_session, trim_recent_messages, add_exchange, build_memory_context
from auth.dependencies import get_current_user
from models.models import (
    User,
    Meeting,
    MeetingInvitedParticipant,
)
from middlewares.limiter import limiter

router = APIRouter(
    prefix="/api/v1",
    tags=["AI Chatbot Endpoint API"]
)

class ChatPayload(BaseModel):
    query: str

async def get_meeting_scoped_ids(current_user: User):
    # Get Meeting Ids related to Participant Ids and The owner who owns it
    if not current_user:
        raise AttributeError('User not Found or User Object is NoneType')
    
    owned_meetings = await Meeting.find(Meeting.created_by.id == current_user.id).to_list()
    participant_records = await MeetingInvitedParticipant.find(
        MeetingInvitedParticipant.user.id == current_user.id
    ).to_list()

    meeting_ids = {
        meeting.id
        for meeting in owned_meetings
    }

    meeting_ids.update(
        participant.meeting.id
        for participant in participant_records
    )

    return list(meeting_ids)
    


@router.post("/chat")
@limiter.limit("6/minute")
async def chat_with_meeting(
    request: Request,
    payload: ChatPayload,
    current_user: User = Depends(get_current_user),
):
    """
    Chat with the global meeting transcripts using RAG.
    """
    try:
        
        meeting_ids = await get_meeting_scoped_ids(current_user)
        
        # Get this user's persistent chat session
        session = await get_or_create_chat_session(current_user)
        
        # Build conversation memory for this request
        memory_context = build_memory_context(session)
        
        answer, used_queries = await retrieve_answer(
            query=payload.query.strip(),
            chat_history=memory_context,
            meeting_ids=meeting_ids,
        )
    
        # Persist this exchange
        if answer:
            await add_exchange(
                session=session,
                user_message=payload.query.strip(),
                assistant_message=answer.strip(),
            )

        return JSONResponse(
            content={
                "answer": answer.strip()
            }
        )

    except ValueError as ve:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve answer: {str(e)}",
        )