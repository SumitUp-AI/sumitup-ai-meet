from langchain_mongodb.index import create_fulltext_search_index
from langchain_mongodb import MongoDBAtlasVectorSearch
from pipelines.embedding_model import embeddings
from pymongo import MongoClient
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

client = MongoClient(settings.mongodb_atlas_uri)
db = client[settings.db_name]
collection = db["embedding"]

def create_vector_index_and_search_index():
    try:
        vector_store = MongoDBAtlasVectorSearch(
            collection=collection,
            embedding=embeddings,
            index_name="vector_index",
            text_key="chunk",
            embedding_key="vector_embedding",
            relevance_score_fn="cosine"
        )
        vector_store.create_vector_search_index(dimensions=384)

        create_fulltext_search_index(
            collection=collection,
            field="chunk",
            index_name="search_index"
        )
        
    except Exception as e:
        logger.info(f"INFO: Intialization Error for Vector Indexes, Msg: {e}")
