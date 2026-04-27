import chromadb

# Ensure the path matches where your local database is stored
client = chromadb.PersistentClient(path="./chroma_db")
client.delete_collection(name="langchain")
