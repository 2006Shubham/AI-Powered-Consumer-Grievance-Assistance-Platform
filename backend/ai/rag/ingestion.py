import logging
from backend.ai.rag.embeddings import EmbeddingService
from backend.ai.rag.faiss_store import FAISSVectorStore
from backend.ai.rag.knowledge_base import LEGAL_KNOWLEDGE_BASE

logger = logging.getLogger("rag_ingestion")

def initialize_vector_database():
    try:
        from backend.ai.rag.qdrant_store import QdrantVectorStore
        vector_store = QdrantVectorStore(dimension=384)
        info = vector_store.client.get_collection("consumer_legal_knowledge")
        if info and info.points_count > 0:
            return vector_store
        encoder = EmbeddingService()
        texts = [doc["content"] for doc in LEGAL_KNOWLEDGE_BASE]
        embeddings = encoder.encode(texts)
        vector_store.add_documents(embeddings, LEGAL_KNOWLEDGE_BASE)
        return vector_store
    except Exception as e:
        logger.info(f"Qdrant store initialization notice ({e}). Using FAISS / In-Memory vector store...")
        vector_store = FAISSVectorStore(dimension=384)
        if len(vector_store.metadata) == 0:
            encoder = EmbeddingService()
            texts = [doc["content"] for doc in LEGAL_KNOWLEDGE_BASE]
            embeddings = encoder.encode(texts)
            vector_store.add_documents(embeddings, LEGAL_KNOWLEDGE_BASE)
        return vector_store

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_vector_database()
