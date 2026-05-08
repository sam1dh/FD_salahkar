import os
import sys

from pathlib import Path
from dotenv import load_dotenv

current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from vectorstore import FaissVectorStore
from langchain_community.llms.llamacpp import LlamaCpp

load_dotenv()


class RAGSearch:

    def __init__(
        self,
        embedding_model: str = "paraphrase-multilingual-MiniLM-L12-v2"
    ):

        # =====================================================
        # PATHS
        # =====================================================

        self.base_dir = current_dir.parent

        self.persist_dir = self.base_dir / "faiss_store"

        self.md_dir = self.base_dir / "output_md"

        self.model_path = (
            self.base_dir
            / "models"
            / "gemma-2b-it.Q4_K_M.gguf"
        )

        # =====================================================
        # VECTOR STORE
        # =====================================================

        self.vectorstore = FaissVectorStore(
            str(self.persist_dir),
            embedding_model
        )

        # =====================================================
        # LOAD / BUILD INDEX
        # =====================================================

        faiss_index_file = self.persist_dir / "faiss.index"

        if not faiss_index_file.exists():

            print(f"[INFO] Index not found. Building from {self.md_dir}...")

            from data_loader import load_cleaned_md_documents

            docs = load_cleaned_md_documents(str(self.md_dir))

            self.vectorstore.build_from_documents(docs)

        else:

            self.vectorstore.load()

        # =====================================================
        # LOCAL LLM
        # =====================================================

        self.llm = LlamaCpp(

            model_path=str(self.model_path),

            n_gpu_layers=0,

            n_ctx=1024,

            n_threads=4,

            temperature=0.1,

            max_tokens=512,

            repeat_penalty=1.1,
            stop=["<end_of_turn>"],
            f16_kv=True,

            verbose=False
        )

        print(f"[INFO] Gemma-2B loaded from: {self.model_path.name}")

        # =====================================================
        # CHAT MEMORY
        # =====================================================

        self.chat_history = []

    # =========================================================
    # QUERY REWRITER
    # =========================================================

    def rewrite_query(self, query: str):

        # FIRST MESSAGE
        if not self.chat_history:
            return query

        recent_history = "\n".join(
            self.chat_history[-4:]
        )

        rewrite_prompt = f"""
नीचे conversation history दी गई है।

आपका काम:
User के latest प्रश्न को standalone clear question में बदलना।

Conversation:
{recent_history}

Latest Question:
{query}

Standalone Question:
"""
        # rewritten = self.llm.invoke(rewrite_prompt)

        # rewritten = rewritten.strip()

        # print(f"\n[REWRITTEN QUERY]: {rewritten}")

        # return rewritten

    # =========================================================
    # MAIN STREAM FUNCTION
    # =========================================================

    def stream_answer(self, query: str, top_k: int = 2):

        print(f"\n[QUERY]: {query}")

        # =====================================================
        # QUERY REWRITE
        # =====================================================

        # query = self.rewrite_query(query)

        # =====================================================
        # SAVE USER MESSAGE
        # =====================================================

        self.chat_history.append(f"User: {query}")

        if len(self.chat_history) > 10:
            self.chat_history = self.chat_history[-10:]

        # =====================================================
        # RETRIEVAL
        # =====================================================

        results = self.vectorstore.query(
            query,
            top_k=top_k
        )

        # =====================================================
        # DEBUG SCORES
        # =====================================================

        print("\n[RETRIEVAL SCORES]")

        for r in results:

            print(
                f"Distance: {r['distance']} | "
                f"Vector: {r['cross_score']} | "
                f"BM25: {r['bm25_score']} | "
                f"Final: {r['rerank_score']}"
            )

        # =====================================================
        # FORMAT CONTEXT
        # =====================================================

        texts = []

        for r in results:

            meta = r["metadata"]

            if not meta:
                continue

            h1 = meta.get("h1", "")
            h2 = meta.get("h2", "")
            h3 = meta.get("h3", "")

            section = " > ".join(
                filter(None, [h1, h2, h3])
            )

            formatted_text = f"""
    SOURCE: {section}

    {meta.get("text", "")}
"""

            texts.append(formatted_text)

        context = "\n\n".join(texts)

        # =====================================================
        # DEBUG RETRIEVED TEXT
        # =====================================================

        print("\n[RETRIEVED TEXTS]")

        for i, t in enumerate(texts):

            print(f"\n--- Chunk {i+1} ---")

            print(t[:500])

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""<start_of_turn>user

        आप एक हिंदी वित्तीय सहायक हैं।

        महत्वपूर्ण नियम:

        1. उत्तर केवल हिंदी में दें।
        2. English sentence बिल्कुल न लिखें।
        3. केवल context की जानकारी उपयोग करें।
        4. गलत जानकारी बिल्कुल न बनाएं।
        5. Markdown symbols (*, **) का उपयोग न करें।
        6. उत्तर छोटा और स्पष्ट रखें।
        7. यदि उत्तर उपलब्ध नहीं है तो कहें:
        "मुझे इस प्रश्न की जानकारी उपलब्ध दस्तावेज़ों में नहीं मिली।"

        Context:
        {context}

        प्रश्न:
        {query}

        <end_of_turn>

        <start_of_turn>model

        उत्तर:
"""

        # =====================================================
        # STREAM RESPONSE
        # =====================================================

        print("\n[RESPONSE]: ", end="", flush=True)

        full_response = ""

        for chunk in self.llm.stream(prompt):

            # CLI STREAM
            chunk = chunk.replace("*", "")

            chunk = chunk.replace("##", "")

            chunk = chunk.replace("###", "")
            print(chunk, end="", flush=True)

            # SAVE RESPONSE
            full_response += chunk

            # FRONTEND STREAM
            yield chunk

        # =====================================================
        # SAVE ASSISTANT MESSAGE
        # =====================================================

        self.chat_history.append(
            f"Assistant: {full_response}"
        )

        if len(self.chat_history) > 10:
            self.chat_history = self.chat_history[-10:]

        print("\n")