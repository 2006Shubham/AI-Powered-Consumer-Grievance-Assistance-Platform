import logging
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from backend.shared.config import get_settings

logger = logging.getLogger("qdrant_store")

COLLECTION_NAME = "consumer_legal_knowledge"

class QdrantVectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        settings = get_settings()
        self.qdrant_url = settings.qdrant_url
        self.qdrant_api_key = settings.qdrant_api_key
        
        self.client: Optional[QdrantClient] = None
        self._init_qdrant()

    def _init_qdrant(self):
        if self.qdrant_url and self.qdrant_api_key:
            try:
                logger.info(f"Connecting to Qdrant Cloud cluster at {self.qdrant_url}...")
                self.client = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_api_key)
                
                # Check or create collection
                collections = [c.name for c in self.client.get_collections().collections]
                if COLLECTION_NAME not in collections:
                    self.client.create_collection(
                        collection_name=COLLECTION_NAME,
                        vectors_config=VectorParams(size=self.dimension, distance=Distance.COSINE)
                    )
                    logger.info(f"Created Qdrant collection '{COLLECTION_NAME}' with size={self.dimension}")
            except Exception as e:
                logger.error(f"Failed to initialize Qdrant Cloud connection ({e}). Falling back to local store.")
                self.client = None
        else:
            logger.info("Qdrant credentials not configured. Using local vector store fallback.")
            self.client = None

        if not self.client:
            self.fallback_vectors: List[np.ndarray] = []
            self.fallback_metadata: List[Dict[str, Any]] = []

    def add_documents(self, embeddings: np.ndarray, documents: List[Dict[str, Any]]):
        if len(embeddings) != len(documents):
            raise ValueError("Number of embeddings must match number of documents")

        if self.client:
            points = []
            for idx, (emb, doc) in enumerate(zip(embeddings, documents), 1):
                # Use doc['id'] hash or integer id for Qdrant PointStruct
                point_id = abs(hash(doc.get("id", str(idx)))) % (10**9)
                points.append(
                    PointStruct(
                        id=point_id,
                        vector=emb.tolist(),
                        payload=doc
                    )
                )
            self.client.upsert(collection_name=COLLECTION_NAME, points=points)
            logger.info(f"Successfully upserted {len(points)} documents to Qdrant Cloud collection '{COLLECTION_NAME}'.")
        else:
            for emb, doc in zip(embeddings, documents):
                self.fallback_vectors.append(emb)
                self.fallback_metadata.append(doc)

    def search(self, query_vector: np.ndarray, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        if self.client:
            try:
                res = self.client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_vector.tolist(),
                    limit=top_k
                )
                results = []
                for point in res.points:
                    results.append((point.payload, float(point.score)))
                return results
            except Exception as e:
                logger.error(f"Qdrant query failed ({e}). Falling back to local search.")

        # Fallback search if Qdrant offline or unconfigured
        if not hasattr(self, 'fallback_metadata') or len(self.fallback_metadata) == 0:
            return []
        
        matrix = np.array(self.fallback_vectors, dtype=np.float32)
        scores = np.dot(matrix, query_vector.reshape(-1, 1)).flatten()
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [(self.fallback_metadata[i], float(scores[i])) for i in top_indices]
