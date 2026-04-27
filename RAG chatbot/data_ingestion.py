import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
import pickle

def read_txt_data(path: str):
    """
    Reads .txt files for data ingestion. 
    If a directory is provided, it reads all .txt files inside it.
    If a single file is provided, it reads just that file.
    """
    if not os.path.exists(path):
        print(f"Error: Path '{path}' does not exist.")
        return []

    if os.path.isdir(path):
        print(f"Loading all .txt files from directory: {path}...")
        loader = DirectoryLoader(path, glob="**/*.txt", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
        documents = loader.load()
    else:
        print(f"Loading data from single file: {path}...")
        loader = TextLoader(path, encoding='utf-8')
        documents = loader.load()
        
    print(f"Successfully loaded {len(documents)} document(s).")
    return documents

def ingest_data(data_path: str, persist_directory: str = "./chroma_db"):
    """
    Ingests text data from a file or directory, chunks it, creates embeddings, and stores them in ChromaDB.
    
    Args:
        data_path (str): The path to the text file or directory of text files to be ingested.
        persist_directory (str): The directory where the ChromaDB will be stored.
    """
    # 1. Load the text data using our new dedicated function
    documents = read_txt_data(data_path)
    
    if not documents:
        print("No documents were loaded. Exiting...")
        return

    # 2. Chunk the text
    print("Chunking data...")
    # RecursiveCharacterTextSplitter is generally recommended for generic text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks.")

    # 3. Create embeddings
    print("Initializing embedding model...")
    # Using a lightweight local HuggingFace embedding model as a sensible default.
    # You can change this to OpenAIEmbeddings or other providers if you have API keys.
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # 4. Store in Chroma DB
    print(f"Storing embeddings in ChromaDB at '{persist_directory}'...")
    vectorstore = Chroma.from_documents(
        documents=chunks, 
        embedding=embeddings, 
        persist_directory=persist_directory,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    # 5. Create and store BM25 index
    print("Creating BM25 index...")
    bm25_retriever = BM25Retriever.from_documents(chunks)
    bm25_path = os.path.join(persist_directory, "bm25_retriever.pkl")
    print(f"Saving BM25 index to '{bm25_path}'...")
    with open(bm25_path, "wb") as f:
        pickle.dump(bm25_retriever, f)
    
    print("Data ingestion complete!")
    return vectorstore

if __name__ == "__main__":
    # --- Example Usage ---
    # Optional: Create a dummy text file if it doesn't exist just for testing
    # sample_txt = "sample.txt"
    # if not os.path.exists(sample_txt):
    #     print(f"Creating a sample file named {sample_txt} for testing...")
    #     with open(sample_txt, "w", encoding='utf-8') as f:
    #         f.write("Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to intelligence displayed by animals and humans.\n" * 10)
    #         f.write("Retrieval-augmented generation (RAG) is an AI framework for improving the quality of LLM-generated responses by grounding the model on external sources of knowledge." * 10)
            
    # Run the ingestion function
    ingest_data("C:\\Users\\PMLS\\Documents\\RAG chatbot\\data")
