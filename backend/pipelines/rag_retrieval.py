from config.settings import settings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_cohere import CohereRerank
from pipelines.embedding_model import embeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_mongodb.retrievers.hybrid_search import MongoDBAtlasHybridSearchRetriever
from pymongo import MongoClient

client = MongoClient(settings.mongodb_atlas_uri)
db = client[settings.db_name]
collection = db["embedding"]

groq_api_key = settings.groq_api_key
cohere_api_key = settings.cohere_api_key
mongodb_uri = settings.mongo_uri

def format_chat_history(chat_history: list) -> str:
    """Formats the rolling chat history list and the summary into a text string for the prompt."""
    formatted_history = ""
    # chat_history[2] contains the summary if it exists
    if len(chat_history) == 3 and isinstance(chat_history[2], str):
        formatted_history += f"Conversation Summary so far:\n{chat_history[2]}\n\n"
    
    formatted_history += "Recent Chat History:\n"
    
    # Iterate from index 1 down to 0 (to display chronologically older to newer)
    for i in range(1, -1, -1):
        if i < len(chat_history):
            item = chat_history[i]
            if isinstance(item, tuple) or isinstance(item, list):
                if len(item) == 2:
                    formatted_history += f"User: {item[0]}\nAI: {item[1]}\n\n"
            elif isinstance(item, dict):
                role = item.get("role", "User")
                content = item.get("content", "")
                formatted_history += f"{role.capitalize()}: {content}\n\n"
    return formatted_history

async def update_summary(current_summary: str, popped_exchange) -> str:
    """Updates the chat history summary using the oldest popped exchange."""
    summary_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are responsible for summarizing a conversation.\n"
                   "Update the following 'Current Summary' based on the 'Oldest Exchange' that is being removed from the short-term memory buffer.\n\n"
                   "Current Summary: {current_summary}\n\n"
                   "Oldest Exchange to merge:\n{exchange_text}\n\n"
                   "Constraint Instructions:\n"
                   "- Prioritize technical specs, user preferences, and unresolved questions. Avoid conversational filler.\n"
                   "- Maximum 200 tokens for the generated summary.\n"
                   "- Ensure that the 'summary of the summary' does not lose critical context over long sessions.\n"
                   "- ONLY output the updated summary, nothing else.")
    ])
    
    groq_llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key, temperature=0.0, max_tokens=200)
    summary_chain = summary_prompt | groq_llm | StrOutputParser()
    
    exchange_text = ""
    if isinstance(popped_exchange, tuple) or isinstance(popped_exchange, list):
        if len(popped_exchange) == 2:
            exchange_text = f"User: {popped_exchange[0]}\nAI: {popped_exchange[1]}"
    elif isinstance(popped_exchange, dict):
         role = popped_exchange.get("role", "User")
         content = popped_exchange.get("content", "")
         exchange_text = f"{role}: {content}"

    new_summary = await summary_chain.ainvoke({
        "current_summary": current_summary if current_summary else "No previous summary.",
        "exchange_text": exchange_text
    })
    
    return new_summary.strip()

async def retrieve_answer(query: str, chat_history: list, k: int = 10):
    """
    Retrieves chunks from MongoDB Atlas Hybrid Search for a given query and maintains contextual chat history.
    """
    llm_smart = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=groq_api_key, temperature=0.0, max_retries=2)

    expansion_prompt = ChatPromptTemplate.from_messages([
        ("system", "Given the following chat history and a follow up user question, formulate 3 distinct variations of the user's question to maximize search retrieval over a vector database.\n"
                   "Chat History:\n{chat_history}\n\n"
                   "Return exactly 3 lines tightly packed. Each line must be a standalone query variation representing the user's intent. Do not output anything else."),
        ("user", "{query}")
    ])
    
    groq_llm = ChatGroq(model="llama-3.1-8b-instant", groq_api_key=groq_api_key, temperature=0.0)
    expansion_chain = expansion_prompt | groq_llm | StrOutputParser()
    
    response_text = await expansion_chain.ainvoke({
        "chat_history": format_chat_history(chat_history) if chat_history else "No history yet.",
        "query": query
    })
    
    queries = [q.strip() for q in response_text.split('\n') if q.strip() and len(q.strip()) > 3]
    queries = [q.lstrip("1234567890.- ") for q in queries]
    if not queries:
        queries = [query, query, query]
    elif len(queries) > 3:
        queries = queries[:3]
    elif len(queries) < 3:
        queries += [query] * (3 - len(queries))
        
    
    vector_store = MongoDBAtlasVectorSearch(
       collection=collection,
       embedding=embeddings,
       index_name="vector_index",
       text_key="chunk",
       embedding_key="vector_embedding",
       relevance_score_fn="cosine"
    )
    
    # Initialize the hybrid retriever
    retriever = MongoDBAtlasHybridSearchRetriever(
        vectorstore=vector_store,
        search_index_name="search_index",
        top_k=20,
        fulltext_penalty=50,
        vector_penalty=50,
        post_filter=[
            {
                "$project": {
                    "vector_embedding": 0
                }
            }
        ]
    )

    all_docs = []
    doc_ids = set()
    
    for q in queries:
        docs = await retriever.ainvoke(q)
        for doc in docs:
            if doc.page_content not in doc_ids:
                all_docs.append(doc)
                doc_ids.add(doc.page_content)

    if not all_docs:
        return "I could not find any relevant information in the meeting transcript to answer your query.", queries

    combined_queries = query + " " + " ".join(queries)
    reranker = CohereRerank(model="rerank-v4.0-fast", top_n=k, cohere_api_key=cohere_api_key)
    reranked_docs = reranker.compress_documents(documents=all_docs, query=combined_queries)
    
    context_text = "\n\n".join([doc.page_content for doc in reranked_docs])
    
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant. Use the following retrieved context to answer the user's question explicitly and accurately. If the context does not contain the information needed to answer the question, state that you do not know based on the provided information or context.\n\nContext:\n{context}"),
        ("user", "{query}")
    ])

    rag_chain = qa_prompt | llm_smart
    response = await rag_chain.ainvoke({"context": context_text, "query": combined_queries})
    
    final_answer = response.content
    if isinstance(final_answer, list):
        final_answer = "".join([part.get("text", "") for part in final_answer if isinstance(part, dict)])
    elif not isinstance(final_answer, str):
        final_answer = str(final_answer)

    return final_answer, queries
