from datetime import datetime, timezone

from models.models import (
    User,
    ChatMessage,
    ChatMessageSession,
    ChatMessageRole,
)


RECENT_MESSAGE_LIMIT = 4


async def get_or_create_chat_session(
    current_user: User,
) -> ChatMessageSession:

    session = await ChatMessageSession.find_one(
        ChatMessageSession.user.id == current_user.id
    )
    print(session, "Before Creation")
    if session:
        return session

    session = ChatMessageSession(
        user=current_user,
        summary="",
        messages=[],
        updated_at=datetime.now(timezone.utc),
    )
    print(session, "After creation")
    await session.insert()

    return session

def build_memory_context(
    session: ChatMessageSession,
) -> str:

    parts = []

    if session.summary:
        parts.append(
            f"Conversation Summary:\n{session.summary}"
        )

    if session.messages:
        recent_conversation = "\n".join(
            f"{message.role.value}: {message.content}"
            for message in session.messages
        )

        parts.append(
            f"Recent Conversation:\n{recent_conversation}"
        )

    if not parts:
        return "No previous conversation."

    return "\n\n".join(parts)

async def add_exchange(
    session: ChatMessageSession,
    user_message: str,
    assistant_message: str,
):
    session.messages.append(
        ChatMessage(
            role=ChatMessageRole.user,
            content=user_message,
        )
    )

    session.messages.append(
        ChatMessage(
            role=ChatMessageRole.assistant,
            content=assistant_message,
        )
    )

    session.updated_at = datetime.now(timezone.utc)

    await session.save()

async def trim_recent_messages(
    session: ChatMessageSession,
):
    if len(session.messages) <= RECENT_MESSAGE_LIMIT:
        return

    session.messages = session.messages[-RECENT_MESSAGE_LIMIT:]

    session.updated_at = datetime.now(timezone.utc)

    await session.save()