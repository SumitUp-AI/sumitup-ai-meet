import os
import sys
from dotenv import load_dotenv
import argparse
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from huggingface_hub import login
import pickle
from datetime import datetime
from langchain_cohere import CohereRerank

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")
hf_token = os.getenv("HF_TOKEN")
login(hf_token)

# Initialize the same embedding model used during ingestion
print("Initializing embedding model...")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def format_chat_history(chat_history):
    """Formats the chat history list into a text string for the prompt."""
    formatted_history = ""
    for q, a in chat_history:
        formatted_history += f"User: {q}\nAI: {a}\n\n"
    return formatted_history

def retrieve_data(query: str, chat_history: list, persist_directory: str = "./chroma_db", k: int = 10):
    """
    Retrieves chunks from ChromaDB for a given query and maintains contextual chat history.
    """
    if not os.path.exists(persist_directory):
        print(f"Error: ChromaDB directory '{persist_directory}' does not exist.")
        print("Please run data_ingestion.py first.")
        return None, None

    # Initialize the Gemini Models with specified Fallbacks sequence 
    # Initialize the Gemini Models with specified Fallbacks sequence and minimal thinking level (temperature=0)
    primary_llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview", google_api_key=api_key, temperature=0.0, thinking_level="minimal")
    fallback_1 = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite", google_api_key=api_key, temperature=0.0, thinking_budget="0")
    fallback_2 = ChatGoogleGenerativeAI(model="gemini-3.0-flash", google_api_key=api_key, temperature=0.0, thinking_level="minimal")
    fallback_3 = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0.0, thinking_budget="0")

    # Wrap the primary llm with its sequential fallbacks. 
    # Langchain will automatically traverse this list if it encounters rate limits or service unavailability.
    llm = primary_llm.with_fallbacks([fallback_1, fallback_2, fallback_3])

    # 1. Reformulate the user query into 3 variations using chat history and datetime
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n{'='*50}")
    print("Generating query variations based on Context...")
    
    expansion_prompt = ChatPromptTemplate.from_messages([
        ("system", "Given the following chat history and a follow up user question, formulate 3 distinct variations of the user's question to maximize search retrieval over a vector database.\n"
                   "If the user query is about datetime related topics, use the current datetime: {current_time}. Otherwise, ignore the datetime.\n\n"
                   "Chat History:\n{chat_history}\n\n"
                   "Return exactly 3 lines tightly packed. Each line must be a standalone query variation representing the user's intent. Do not output anything else."),
        ("user", "{query}")
    ])
    
    expansion_chain = expansion_prompt | llm | StrOutputParser()
    
    response_text = expansion_chain.invoke({
        "chat_history": format_chat_history(chat_history) if chat_history else "No history yet.",
        "current_time": current_time,
        "query": query
    })
    
    queries = [q.strip() for q in response_text.split('\n') if q.strip() and len(q.strip()) > 3]
    # Clean up numbering if model included them
    queries = [q.lstrip("1234567890.- ") for q in queries]
    if not queries:
        queries = [query, query, query]
    elif len(queries) > 3:
        queries = queries[:3]
    elif len(queries) < 3:
        queries += [query] * (3 - len(queries))
        
    print("Generated Queries:")
    for i, q in enumerate(queries, 1):
        print(f"{i}. {q}")
        
    standalone_query = queries[0] # primary query
    print(f"{'='*50}")

    # 2. Ensemble Retrieval, RRF and Cohere Reranking

    print(f"Loading ChromaDB from '{persist_directory}'...\n")
    vectorstore = Chroma(
        persist_directory=persist_directory, 
        embedding_function=embeddings,
        collection_metadata={"hnsw:space": "cosine"}
    )
    chroma_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

    print(f"Loading BM25 index from '{persist_directory}'...\n")
    bm25_path = os.path.join(persist_directory, "bm25_retriever.pkl")
    try:
        with open(bm25_path, "rb") as f:
            bm25_retriever = pickle.load(f)
        bm25_retriever.k = 5
    except FileNotFoundError:
        bm25_retriever = None
        print("Warning: bm25_retriever.pkl not found. Falling back to vector search only.")

    print(f"Executing Retrieve for all 3 queries...")
    print("Applying Reciprocal Rank Fusion (RRF) with weights (BM25: 0.4, Chroma: 0.6)...")
    rrf_score = {}
    doc_map = {}
    
    def apply_rrf(docs, weight=1.0):
        for rank, doc in enumerate(docs):
            doc_id = doc.page_content
            if doc_id not in rrf_score:
                rrf_score[doc_id] = 0.0
                doc_map[doc_id] = doc
            rrf_score[doc_id] += weight / (rank + 61)

    for q in queries:
        chroma_res = chroma_retriever.invoke(q)
        apply_rrf(chroma_res, weight=0.6)
        
        if bm25_retriever:
            bm25_res = bm25_retriever.invoke(q)
            apply_rrf(bm25_res, weight=0.4)

    sorted_docs = sorted(rrf_score.items(), key=lambda x: x[1], reverse=True)
    top_rrf_docs = [doc_map[doc_id] for doc_id, score in sorted_docs]

    if not top_rrf_docs:
        print("No results found.")
        return None, standalone_query

    print(f"Applying Cohere Reranking for top {len(top_rrf_docs)} chunks...")
    combined_rerank_query = query + " " + " ".join(queries)
    reranker = CohereRerank(model="rerank-v4.0-fast", top_n=k)  # target top 'k'
    reranked_docs = reranker.compress_documents(documents=top_rrf_docs, query=combined_rerank_query)
    
    print(f"\n{'='*50}")
    print(f"Top {len(reranked_docs)} Reranked Retrieved Chunks")
    print(f"{'='*50}")
    
    for i, doc in enumerate(reranked_docs, 1):
        print(f"\nResult {i} (Cohere Score: {doc.metadata.get('relevance_score', 0):.4f}):")
        print("-" * 50)
        # Safe print for Windows terminal
        safe_text = doc.page_content.encode(sys.stdout.encoding, errors='replace').decode(sys.stdout.encoding)
        print(safe_text)
        print("-" * 50)

        print(f"Source: {doc.metadata.get('source', 'Unknown')}\n")

    # 3. Final Answer Generation
    # Construct context from chunks
    context_text = "\n\n".join([doc.page_content for doc in reranked_docs])
    
    print(f"{'='*50}")
    print("Synthesizing Final Answer with Gemini LLM...")
    print(f"{'='*50}")
        
    # Standard QA prompt using the standalone query
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant. Use the following retrieved context to answer the user's question explicitly and accurately. If the context does not contain the information needed to answer the question, state that you do not know based on the provided documents.\n\nContext:\n{context}"),
        ("user", "{query}")
    ])

    rag_chain = qa_prompt | llm
    
    # We feed the standalone reformulated query and our context
    response = rag_chain.invoke({"context": context_text, "query": standalone_query})
    
    final_answer = response.content
    if isinstance(final_answer, list):
        final_answer = "".join([part.get("text", "") for part in final_answer if isinstance(part, dict)])
    elif not isinstance(final_answer, str):
        final_answer = str(final_answer)

    final_model_used = response.response_metadata.get('model_name', 'Unknown')
        
    print(f"\n[Generated via model: {final_model_used}]")
    print(f"Final Generated Answer:\n{final_answer}\n")
        
    return final_answer, standalone_query


if __name__ == "__main__":
    print("\n" + "="*50)
    print("Welcome to your RAG Chatbot! (Type 'exit' or 'quit' to stop)")
    print("="*50)
    
    # Initialize the empty chat history
    chat_history = []
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.strip().lower() in ['exit', 'quit']:
            print("Session ended. Goodbye!")
            break
            
        if not user_input.strip():
            continue
            
        # Execute retrieve_data and get both the final generated answer and the standalone query
        answer, standalone_q = retrieve_data(user_input, chat_history)
        
        if answer and standalone_q:
            # Append the explicitly requested tuple (standalone_query, final_answer) to Chat History!
            chat_history.append((standalone_q, answer))
