import os
import sys
from pathlib import Path
import faiss
import numpy as np
import pickle

from typing import List, Any

from sentence_transformers import SentenceTransformer , CrossEncoder
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi

sys.path.insert(0, str(Path(__file__).parent))

from embedding import EmbeddingPipeline


class FaissVectorStore:

    def __init__(
        self,
        persist_dir: str = "faiss_store",
        embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2",
        chunk_size: int = 300,
        chunk_overlap: int = 40
    ):

        self.persist_dir = persist_dir
        os.makedirs(self.persist_dir, exist_ok=True)

        self.index = None
        self.metadata = []

        # BM25
        self.bm25 = None
        self.corpus = []

        # Embedding model
        self.embedding_model = embedding_model
        self.model = SentenceTransformer(embedding_model)
        self.cross_encoder = CrossEncoder(
                "cross-encoder/ms-marco-MiniLM-L-6-v2"
            )

        print("[INFO] Cross Encoder loaded.")
        # Chunk settings
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        print(f"[INFO] Loaded embedding model: {embedding_model}")

    # =========================================================
    # BUILD VECTOR STORE
    # =========================================================

    def build_from_documents(self, documents: List[Any]):

        print(f"[INFO] Building vector store from {len(documents)} raw documents...")

        emb_pipe = EmbeddingPipeline(
            model_name=self.embedding_model,
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap
        )

        chunks = emb_pipe.chunk_documents(documents)

        # -----------------------------------------------------
        # BM25 CORPUS
        # -----------------------------------------------------

        self.corpus = [
            chunk.page_content.lower().split()
            for chunk in chunks
        ]

        self.bm25 = BM25Okapi(self.corpus)

        # -----------------------------------------------------
        # EMBEDDINGS
        # -----------------------------------------------------

        embeddings = emb_pipe.embed_chunks(chunks)

        # -----------------------------------------------------
        # METADATA
        # -----------------------------------------------------

        metadatas = []

        for chunk in chunks:

            metadatas.append({
                "text": chunk.page_content,
                "h1": chunk.metadata.get("Header 1", ""),
                "h2": chunk.metadata.get("Header 2", ""),
                "h3": chunk.metadata.get("Header 3", ""),
            })

        self.add_embeddings(
            np.array(embeddings).astype("float32"),
            metadatas
        )

        self.save()

        print(f"[INFO] Vector store built and saved to {self.persist_dir}")

    # =========================================================
    # ADD EMBEDDINGS
    # =========================================================

    def add_embeddings(self, embeddings: np.ndarray, metadatas: List[Any] = None):

        dim = embeddings.shape[1]

        if self.index is None:
            self.index = faiss.IndexFlatL2(dim)

        self.index.add(embeddings)

        if metadatas:
            self.metadata.extend(metadatas)

        print(f"[INFO] Added {embeddings.shape[0]} vectors to Faiss index.")

    # =========================================================
    # SAVE
    # =========================================================

    def save(self):

        faiss_path = os.path.join(self.persist_dir, "faiss.index")
        meta_path = os.path.join(self.persist_dir, "metadata.pkl")
        bm25_path = os.path.join(self.persist_dir, "bm25.pkl")

        # Save FAISS
        faiss.write_index(self.index, faiss_path)

        # Save metadata
        with open(meta_path, "wb") as f:
            pickle.dump(self.metadata, f)

        # Save BM25 corpus
        with open(bm25_path, "wb") as f:
            pickle.dump(self.corpus, f)

        print(f"[INFO] Saved vector database to {self.persist_dir}")

    # =========================================================
    # LOAD
    # =========================================================

    def load(self):

        faiss_path = os.path.join(self.persist_dir, "faiss.index")
        meta_path = os.path.join(self.persist_dir, "metadata.pkl")
        bm25_path = os.path.join(self.persist_dir, "bm25.pkl")

        # Load FAISS
        self.index = faiss.read_index(faiss_path)

        # Load metadata
        with open(meta_path, "rb") as f:
            self.metadata = pickle.load(f)

        # Load BM25 corpus
        with open(bm25_path, "rb") as f:
            self.corpus = pickle.load(f)

        # Rebuild BM25
        self.bm25 = BM25Okapi(self.corpus)

        print(f"[INFO] Loaded vector database from {self.persist_dir}")

    # =========================================================
    # HYBRID QUERY
    # =========================================================

    def query(self, query_text: str, top_k: int = 3):

        print(f"[INFO] Querying vector store for: '{query_text}'")

        # -----------------------------------------------------
        # QUERY EMBEDDING
        # -----------------------------------------------------

        query_emb = self.model.encode([query_text]).astype("float32")

        # -----------------------------------------------------
        # BM25 QUERY
        # -----------------------------------------------------

        query_tokens = query_text.lower().split()

        bm25_scores = self.bm25.get_scores(query_tokens)

        # -----------------------------------------------------
        # VECTOR SEARCH
        # -----------------------------------------------------

        D, I = self.index.search(query_emb, 20)

        results = []

        seen_texts = set()

        # -----------------------------------------------------
        # RETRIEVAL LOOP
        # -----------------------------------------------------

        for idx, dist in zip(I[0], D[0]):

            if idx >= len(self.metadata):
                continue

            meta = self.metadata[idx]

            text = meta.get("text", "").strip()

            # Skip duplicate chunks
            if text in seen_texts:
                continue

            seen_texts.add(text)

            # -------------------------------------------------
            # VECTOR RERANK
            # -------------------------------------------------

            cross_score = self.cross_encoder.predict([(query_text, text)])[0]
            # -------------------------------------------------
            # BM25 SCORE
            # -------------------------------------------------

            bm25_score = bm25_scores[idx]

            # -------------------------------------------------
            # KEYWORD BOOST
            # -------------------------------------------------

            query_lower = query_text.lower()
            text_lower = text.lower()

            important_keywords = [
                "pan",
                "tds",
                "nomination",
                "dicgc",
                "kyc",
                "tax",
                "पैन",
                "टीडीएस",
                "नामांकन",
                "डीआईसीजीसी",
                "केवाईसी",
                "टैक्स"
            ]

            for keyword in important_keywords:

                if keyword in query_lower and keyword in text_lower:
                    cross_score += 0.15

            # -------------------------------------------------
            # FINAL HYBRID SCORE
            # -------------------------------------------------

            final_score = (
                0.7 * cross_score
                +
                0.3 * bm25_score
            )

            results.append({
                "index": idx,
                "distance": float(dist),
                "cross_score": float(cross_score),
                "bm25_score": float(bm25_score),
                "rerank_score": float(final_score),
                "metadata": meta
            })

        # -----------------------------------------------------
        # SORT BY FINAL SCORE
        # -----------------------------------------------------

        results = sorted(
            results,
            key=lambda x: x["rerank_score"],
            reverse=True
        )

        # Keep best results
        results = results[:top_k]

        return results