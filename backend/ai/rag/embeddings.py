import numpy as np
import logging
from typing import List

logger = logging.getLogger("embedding_service")

class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
                cls._model = SentenceTransformer('all-MiniLM-L6-v2')
            except Exception as e:
                logger.warning(f"SentenceTransformer load failed ({e}). Using fallback numpy vector encoder.")
                cls._model = False
        return cls._model

    def encode(self, texts: List[str]) -> np.ndarray:
        model = self.get_model()
        if model:
            embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return embeddings.astype(np.float32)
        
        # Fallback 384-d deterministic vector encoding for testing or offline mode
        logger.info("Generating fallback 384-d embeddings...")
        embeddings = []
        for text in texts:
            vec = np.zeros(384, dtype=np.float32)
            words = text.lower().split()
            for i, word in enumerate(words):
                idx = abs(hash(word)) % 384
                vec[idx] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            embeddings.append(vec)
        return np.array(embeddings, dtype=np.float32)
