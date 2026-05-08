Here is the updated and polished `README.md`. I have corrected the architecture, updated the tech stack to prominently feature **Sarvam AI (TTS)**, **Deepgram (STT)**, and your **Python RAG streaming backend**, and fixed the environment variable instructions.

---

# FD सलाहकार — Vernacular Voice & Chat FD Advisor

> **Making Fixed Deposits accessible for first-time users through Vernacular Voice AI and step-by-step guidance.**

---

## 🎯 Problem Statement

**The Barrier:** 70% of Indian retail investors (especially in tier-2/3 cities) don't invest in Fixed Deposits because of:

* **Financial jargon confusion** — "What is p.a.? What is tenure? DICGC?"
* **Literacy & UI Friction** — Fear of filling out physical forms or complex digital UIs.
* **Calculation anxiety** — "How much will I actually get after 12 months?"
* **Trust issues** — "Is this bank safe?"

A user in Gorakhpur sees: **"Suryoday Small Finance Bank — 8.50% p.a. — 12M tenor"** but can't understand it.

---

## 💡 Solution

**FD सलाहकार** is an **AI-powered vernacular voice advisor** that:

1. **Speaks and Listens** — Users can speak in Hindi/Tamil/Telugu (via **Deepgram STT**) and hear the AI respond in high-quality local voices (via **Sarvam AI TTS**).
2. **Answers Instantly (RAG)** — Uses a local AI model (Gemma 2B) and FAISS vector database to provide accurate, verified answers directly from financial research documents with zero hallucination.
3. **Provides clarity** — Shows exact maturity amounts, bank safety ratings, and DICGC coverage.
4. **Guides step-by-step** — From comparison → calculation → booking in the user's preferred language.

---

## 🚀 Key Features

| Feature | Details |
| --- | --- |
| 🎙️ **Voice AI Chat** | Speak your questions (Deepgram) and listen to replies in natural Indian voices (Sarvam AI). |
| ⚡ **Real-Time Streaming** | AI responses stream instantly to the screen (character-by-character) like ChatGPT. |
| 🏦 **FD Comparison Tool** | Filter by bank, tenor, interest rate; safety ratings included. |
| 🧮 **Interactive Calculator** | Real-time maturity calculation with visual compounding returns. |
| 📝 **Smart Form Copilot** | Visual "Do's and Don'ts" guide for filling physical banking forms (like DA-1). |
| 📱 **Responsive UI** | Works seamlessly on mobile devices (where 90% of vernacular users are). |

---

## 🏗️ System Architecture

The system uses a hybrid architecture: **Node.js** handles API orchestration and Voice AI, while a **Python Flask server** handles the heavy Machine Learning (RAG) and LLM streaming.

```text
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│   Voice Recording (Deepgram) | Streaming Chat | UI Forms    │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST (Chunked Streaming)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                BACKEND (Node.js + Express)                  │
│       /api/chat (Proxy) | /api/speak (Sarvam AI TTS)        │
└────────────────────────┬────────────────────────────────────┘
                         │ 
       ┌─────────────────┴─────────────────┐
       ↓                                   ↓
┌───────────────┐                  ┌────────────────────────────────┐
│  Sarvam AI    │                  │   PYTHON AI SERVER (Flask)     │
│ (TTS Engine)  │                  │  Local LLM (Gemma 2B / LLaMA)  │
└───────────────┘                  │  FAISS Vector Database         │
                                   └────────────────────────────────┘

```

---

## 📁 Project Structure

```text
Vernacular-FD-Advisor/
├── Frontend/                    # React + Vite web application
│   ├── src/
│   │   ├── components/         # ChatUI.jsx, FDList.jsx, Calculator.jsx, etc.
│   │   ├── hooks/              # useChat.js (handles stream decoding)
│   │   ├── api/                # gemini.js (Zero-latency RAG questions)
│   │   └── i18n/               # Hindi/Tamil/Telugu translations
│
├── Backend/                     # Node.js Express API
│   ├── server.js               # Handles Deepgram/Sarvam routing & Python proxy
│   └── .env                    # API Keys (SARVAM_API_KEY, DEEPGRAM_API_KEY)
│
├── Model_training/              # Python RAG Backend
│   ├── src/
│   │   ├── ai_server.py        # Flask server with Yield streaming
│   │   ├── search.py           # Langchain LlamaCpp integration
│   │   └── vectorstore.py      # FAISS operations
│   ├── models/                 # Downloaded .gguf LLM models
│   ├── faiss_store/            # Compiled vector embeddings
│   └── Data/                   # Original FD advisory research docs (.docx)

```

---

## 📊 Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 19 + Vite | Fast, modern UI with Server-Sent Events (SSE) support |
| **Speech-to-Text (STT)** | **Deepgram** | High-accuracy vernacular voice recognition |
| **Text-to-Speech (TTS)** | **Sarvam AI** | Native, ultra-realistic Indian voices (Meera/Bulbul) |
| **Node Backend** | Express.js | API routing, audio buffer streaming, intent detection |
| **Python Backend** | Flask + LangChain | Document retrieval and streaming response generation |
| **LLM Engine** | Llama.cpp (Gemma-2B) | Local, cost-effective inference |
| **Vector DB** | FAISS | Millisecond similarity search over financial documents |

---

## 🛠️ How to Run Locally

### Prerequisites

* **Node.js** 18+
* **Python** 3.9+
* **API Keys**: Get them from [Sarvam AI](https://dashboard.sarvam.ai/) and [Deepgram](https://console.deepgram.com/).

### Step 1️⃣ — Python RAG Backend (AI Server)

```bash
cd Model_training
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the Flask streaming server (runs on port 5000)
python src/ai_server.py

```

### Step 2️⃣ — Node.js Backend (Voice Orchestrator)

```bash
# Open NEW terminal
cd Backend
npm install

# Create .env file
cat > .env << EOF
PORT=3001
SARVAM_API_KEY=your_sarvam_key_here
DEEPGRAM_API_KEY=your_deepgram_key_here
PYTHON_RAG_URL=http://127.0.0.1:5000/ask
EOF

# Start backend server
npm start

```

### Step 3️⃣ — Frontend

```bash
# Open NEW terminal
cd Frontend
npm install

# Start development server
npm run dev
# ✅ Runs on http://localhost:5173

```

---

## 🔌 Core API Endpoints

### 1. Streaming Chat (`Node.js -> Python`)

**POST `/api/chat**`
Accepts user text, forwards it to Python, and pipes the `chunked` stream directly back to React for the typing effect.

### 2. Sarvam Text-to-Speech

**POST `/api/speak**`

```json
{
  "text": "आपका पैसा पूरी तरह सुरक्षित है।",
  "language": "hi"
}

```

*Returns an `audio/wav` buffer generated by Sarvam AI's native language models.*

---

## 🧪 Testing Checklist

* [ ] **Python Engine**: Test `http://127.0.0.1:5000/ask` via Postman to ensure streaming works.
* [ ] **Sarvam TTS**: Click the 🔊 icon in the chat. Ensure your browser doesn't block autoplay.
* [ ] **Deepgram STT**: Click the 🎙️ mic icon. Ensure microphone permissions are granted.
* [ ] **Translations**: Switch between Hindi, Tamil, and Telugu in the top navbar.

---

## 🚀 Deployment

* **Frontend**: Deploy directly to **Vercel** or **Netlify**.
* **Node Backend**: Deploy to **Render** or **Railway** (ensure environment variables are set).
* **Python Backend**: Due to LlamaCpp and FAISS requirements, this is best deployed on a VPS (like **AWS EC2**, **DigitalOcean Droplet**, or **RunPod**) with at least 4GB RAM.

---

## ✨ Credits & Acknowledgments

* **[Sarvam AI](https://www.sarvam.ai/)** — For incredible, natural-sounding Indian language Text-to-Speech models.
* **[Deepgram](https://deepgram.com/)** — For blazing-fast and highly accurate Speech-to-Text APIs.
* **LangChain & FAISS** — For making local RAG implementations robust and efficient.
* **Vite & React** — For the seamless frontend developer experience.