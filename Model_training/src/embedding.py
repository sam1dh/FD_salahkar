import os
from typing import List, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_text_splitters import MarkdownHeaderTextSplitter
from sentence_transformers import SentenceTransformer
import numpy as np
from dotenv import load_dotenv
# from data_loader import load_cleaned_md_documents

# Load environment variables from .env file
load_dotenv()

# Set HuggingFace token from environment variable
hf_token = os.getenv('HF_TOKEN')
if hf_token:
    os.environ['HF_TOKEN'] = hf_token
else:
    print("[WARNING] HF_TOKEN not found in environment variables. Set it in .env or export HF_TOKEN")

class EmbeddingPipeline:
    def __init__(self, model_name: str = "paraphrase-multilingual-MiniLM-L12-v2", chunk_size: int = 220, chunk_overlap: int = 40):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.model = SentenceTransformer(model_name)
        print(f"[INFO] Loaded embedding model: {model_name}")

    # def chunk_documents(self, documents: List[Any]) -> List[Any]:
    #     splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=self.chunk_size,
    #         chunk_overlap=self.chunk_overlap,
    #         length_function=len,
    #         separators=["\n\n", "\n", " ", ""]
    #     )
    #     chunks = splitter.split_documents(documents)
    #     print(f"[INFO] Split {len(documents)} documents into {len(chunks)} chunks.")
    #     return chunks
    def chunk_documents(self, documents: List[Any]) -> List[Any]:
        print("[INFO] Performing semantic markdown chunking...")
        headers_to_split_on = [
            ("#", "Header 1"),
            ("##", "Header 2"),
            ("###", "Header 3"),
        ]
        markdown_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=headers_to_split_on
        )
        final_chunks = []
        recursive_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        for doc in documents:
            md_chunks = markdown_splitter.split_text(doc.page_content)
            for chunk in md_chunks:
                split_chunks = recursive_splitter.split_documents([chunk])
                final_chunks.extend(split_chunks)
        print(f"[INFO] Created {len(final_chunks)} semantic chunks.")
        return final_chunks
    def embed_chunks(self, chunks: List[Any]) -> np.ndarray:
        texts = [chunk.page_content for chunk in chunks]
        print(f"[INFO] Generating embeddings for {len(texts)} chunks...")
        embeddings = self.model.encode(texts, show_progress_bar=True)
        print(f"[INFO] Embeddings shape: {embeddings.shape}")
        return embeddings

