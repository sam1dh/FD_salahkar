from flask import Flask, request,Response,jsonify
from search import RAGSearch
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

print("[INFO] Loading RAG System and Gemma-2B...")
rag = RAGSearch()
print("[SUCCESS] AI Server is Ready!")

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get('query')
    language = data.get('language', 'hi') # Default to Hindi
    
    if not query:
        return jsonify({"error": "No query provided"}), 400
        
    
    try:
        # We use your existing search function!
        # answer = rag.stream_answer(query)
        # return jsonify({"answer": answer})
        def generate():
            for chunk in rag.stream_answer(query):
                yield chunk

        return Response(
            generate(),
            mimetype='text/plain',
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )
    
    except Exception as e:
        print(f"[ERROR]: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run offline on port 5000
    app.run(
    host='127.0.0.1',
    port=5000,
    threaded=True
)