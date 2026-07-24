import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
from backend.shared.config import get_settings

logger = logging.getLogger("faiss_store")

class FAISSVectorStore:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        settings = get_settings()
        self.index_file = Path(settings.faiss_index_path)
        self.metadata_file = self.index_file.with_suffix(".json")

        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self._init_index()

    def _init_index(self):
        try:
            import faiss
            self.faiss_available = True
            if self.index_file.exists() and self.metadata_file.exists():
                logger.info(f"Loading existing FAISS index from {self.index_file}")
                self.index = faiss.read_index(str(self.index_file))
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
            else:
                self.index = faiss.IndexFlatIP(self.dimension)
                self.metadata = []
        except ImportError:
            logger.warning("FAISS not installed, using fallback in-memory cosine similarity store.")
            self.faiss_available = False
            self.vectors = np.empty((0, self.dimension), dtype=np.float32)
            self.metadata = []

    def add_documents(self, embeddings: np.ndarray, documents: List[Dict[str, Any]]):
        if len(embeddings) != len(documents):
            raise ValueError("Number of embeddings must match number of documents")

        embeddings = np.ascontiguousarray(embeddings, dtype=np.float32)

        if self.faiss_available and self.index is not None:
            self.index.add(embeddings)
            self.metadata.extend(documents)
            self.save()
        else:
            if len(self.vectors) == 0:
                self.vectors = embeddings
            else:
                self.vectors = np.vstack([self.vectors, embeddings])
            self.metadata.extend(documents)

    def search(self, query_vector: np.ndarray, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        if len(self.metadata) == 0:
            return []

        query_vector = np.ascontiguousarray(query_vector.reshape(1, -1), dtype=np.float32)

        if self.faiss_available and self.index is not None:
            scores, indices = self.index.search(query_vector, min(top_k, self.index.ntotal))
            results = []
            for idx, score in zip(indices[0], scores[0]):
                if idx < len(self.metadata) and idx >= 0:
                    results.append((self.metadata[idx], float(score)))
            return results
        else:
            # Fallback cosine similarity using numpy inner product
            scores = np.dot(self.vectors, query_vector.T).flatten()
            top_indices = np.argsort(scores)[::-1][:top_k]
            results = []
            for idx in top_indices:
                results.append((self.metadata[idx], float(scores[idx])))
            return results

    def save(self):
        if not self.faiss_available or self.index is None:
            return

        self.index_file.parent.mkdir(parents=True, exist_ok=True)
        import faiss
        faiss.write_index(self.index, str(self.index_file))
        with open(self.metadata_file, "w", encoding="utf-8") as f:
            json.dump(self.metadata, f, indent=2)
        logger.info(f"FAISS index and metadata saved to {self.index_file}")
