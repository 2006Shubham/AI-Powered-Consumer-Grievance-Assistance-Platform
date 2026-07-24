import pytest
import numpy as np
from backend.ai.rag.embeddings import EmbeddingService
from backend.ai.rag.qdrant_store import QdrantVectorStore
from backend.ai.rag.knowledge_base import LEGAL_KNOWLEDGE_BASE
from backend.ai.rag.service import RAGGuidanceResponse

def test_embedding_service():
    encoder = EmbeddingService()
    texts = ["Defective laptop screen", "Unauthorized banking charge"]
    embeddings = encoder.encode(texts)
    assert isinstance(embeddings, np.ndarray)
    assert embeddings.shape[0] == 2
    assert embeddings.shape[1] == 384

def test_qdrant_vector_store():
    store = QdrantVectorStore(dimension=384)
    encoder = EmbeddingService()
    
    sample_docs = [
        {"id": "doc1", "content": "Defective TV screen policy"},
        {"id": "doc2", "content": "Banking refund rules"}
    ]
    texts = [d["content"] for d in sample_docs]
    embeddings = encoder.encode(texts)
    
    store.add_documents(embeddings, sample_docs)
    
    query_vec = encoder.encode(["TV screen defect"])[0]
    results = store.search(query_vec, top_k=1)
    
    assert len(results) >= 1
    matched_doc, score = results[0]
    assert "content" in matched_doc
    assert isinstance(score, float)

def test_knowledge_base_structure():
    assert len(LEGAL_KNOWLEDGE_BASE) >= 5
    for item in LEGAL_KNOWLEDGE_BASE:
        assert "id" in item
        assert "source" in item
        assert "content" in item

def test_rag_guidance_response_schema():
    data = {
        "summary_analysis": "The consumer is protected under Product Liability provisions.",
        "applicable_laws": [
            {
                "title": "Consumer Protection Act 2019",
                "source": "Section 2(34)",
                "summary": "Mandates replacement for defective goods"
            }
        ],
        "recommended_remedies": ["Full refund", "Replacement"],
        "next_steps": ["Send legal notice"]
    }
    res = RAGGuidanceResponse(**data)
    assert len(res.applicable_laws) == 1
    assert len(res.recommended_remedies) == 2
