import logging
from backend.ai.rag.embeddings import EmbeddingService
from backend.ai.rag.qdrant_store import QdrantVectorStore
from backend.ai.rag.knowledge_base import LEGAL_KNOWLEDGE_BASE

logger = logging.getLogger("rag_ingestion")

def initialize_vector_database() -> QdrantVectorStore:
    vector_store = QdrantVectorStore(dimension=384)
    
    # Ingest legal knowledge base into Qdrant
    logger.info("Syncing legal knowledge base corpus with Qdrant vector database...")
    encoder = EmbeddingService()
    texts = [doc["content"] for doc in LEGAL_KNOWLEDGE_BASE]
    embeddings = encoder.encode(texts)
    vector_store.add_documents(embeddings, LEGAL_KNOWLEDGE_BASE)
    logger.info(f"Successfully synced {len(LEGAL_KNOWLEDGE_BASE)} legal provisions with Qdrant Cloud.")
    
    return vector_store

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_vector_database()
