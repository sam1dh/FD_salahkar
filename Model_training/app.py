from src import process_docs
from src.data_loader import load_cleaned_md_documents
import src.process_docs as process_docs
from src.vectorstore import FaissVectorStore
from src.search import RAGSearch


# Example usage
if __name__ == "__main__":
    process_docs.main()  # Run the document processing to convert .docx and .pdf to .md
    docs = load_cleaned_md_documents("./output_md")
    store = FaissVectorStore("faiss_store")
    store.load()
    rag = RAGSearch()
    # Test queries
    test_queries = [
    "Fixed Deposit (FD) की बुनियादी परिभाषा क्या है?",
    "DICGC बीमा क्या है और इसमें कितनी राशि सुरक्षित रहती है?",
    "KYC के विभिन्न स्तर (Levels) क्या हैं और वे कब लागू होते हैं?",
    "NBFC में निवेश करते समय किन बातों का ध्यान रखना चाहिए?",
    "FD खोलने के लिए किन-किन Documents की आवश्यकता होती है?",
    "Nominee दर्ज करना क्यों महत्वपूर्ण है?",
    "TDS से बचने के लिए क्या करना चाहिए?",
    "Suryoday Small Finance Bank और SBI की ब्याज दरों में क्या अंतर है?",
    "FD निवेश के लिए '10 मूलभूत नियम' कौन से हैं?",
    "शेयर बाजार (Stock Market) में निवेश कैसे करें?"
   
]
    try:
        rag = RAGSearch()
        for i, q in enumerate(test_queries, 1):
            print(f"\n--- Test Query #{i} ---")
            rag.search_and_summarize(q)
            print("\n" + "="*50)
    except Exception as e:
        print(f"Loop interrupted: {e}")
    finally:
        # This prevents the NoneType error from crashing the script mid-loop
        print("Testing complete. Cleaning up...")