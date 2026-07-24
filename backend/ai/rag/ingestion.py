import logging
from backend.ai.rag.embeddings import EmbeddingService
from backend.ai.rag.faiss_store import FAISSVectorStore
from backend.ai.rag.knowledge_base import LEGAL_KNOWLEDGE_BASE

logger = logging.getLogger("rag_ingestion")

def initialize_vector_database() -> FAISSVectorStore:
    vector_store = FAISSVectorStore(dimension=384)
    
    # Ingest knowledge base if index is empty
    if len(vector_store.metadata) == 0:
        logger.info("Initializing vector database with legal knowledge base corpus...")
        encoder = EmbeddingService()
        texts = [doc["content"] for doc in LEGAL_KNOWLEDGE_BASE]
        embeddings = encoder.encode(texts)
        vector_store.add_documents(embeddings, LEGAL_KNOWLEDGE_BASE)
        logger.info(f"Successfully ingested {len(LEGAL_KNOWLEDGE_BASE)} legal provisions into FAISS vector store.")
    
    return vector_store

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_vector_database()
