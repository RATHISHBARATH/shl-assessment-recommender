# SHL Assessment Recommender 🧠💼

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)
![LangChain](https://img.shields.io/badge/LangChain-Vector_Search-green.svg)
![Gemini](https://img.shields.io/badge/Gemini-Flash_1.5-orange.svg)

An enterprise-grade **Retrieval-Augmented Generation (RAG)** system that intelligently maps natural-language job descriptions and queries to SHL’s catalog of 377+ talent assessments.

It solves the core problem hiring managers face — inefficient keyword search — by using semantic vector retrieval + LLM synthesis to deliver highly relevant, domain-balanced recommendations with full source attribution and faithfulness guarantees.

---

## 🚀 Live Deployment

**Fully deployed on AWS EC2** with Nginx reverse proxy + PM2.

**Live Application & API:** [http://13.60.241.161/](http://13.60.241.161/)

---

## ✨ Key Features

- Intelligent query parsing (natural language, full job description, or JD URL)
- Dynamic recommendation engine (5–10 highly relevant individual assessments)
- Automatic filtering of “Pre-packaged Job Solutions” to focus on single tests
- Balanced domain selection (hard skills + soft skills when query spans multiple areas)
- Automated data ingestion pipeline that scraped and structured 377+ SHL assessments

---

## 🏗️ System Architecture

Complete end-to-end RAG pipeline:

1. **Data Ingestion** — Custom scraper + cleaning + embeddings (`all-MiniLM-L6-v2`)
2. **Vector Retrieval** — FAISS index with dense semantic search
3. **LLM Synthesis** — Gemini 1.5 Flash with strict prompting for faithfulness and domain balance
4. **Frontend** — Modern React + Tailwind SPA

### Folder Structure
```text
shl-assessment-recommender/
├── src/                  # FastAPI backend + RAG core logic
│   ├── scripts/          # Scraping, batch evaluation, batch_predict.py
│   └── notebooks/        # Failure mode analysis & ablation studies
├── frontend/             # React + Vite + Tailwind
├── data/                 # Scraped SHL catalog (JSON/CSV)
├── notebooks/            # Evaluation harness & ablation notebooks
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone & Install Backend
```bash
git clone https://github.com/RATHISHBARATH/shl-assessment-recommender.git
cd shl-assessment-recommender

# Backend
cd src
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Add your Gemini key
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > .env

uvicorn backend.src.api.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

**API runs at** `http://localhost:8000`  
**Frontend runs at** `http://localhost:5173`

---

## 📡 Core API Endpoints

### `GET /health`
```json
{ "status": "healthy" }
```

### `POST /recommend`
**Request**
```json
{
  "query": "Software engineer with strong Python and system design skills"
}
```

**Response**
```json
{
  "recommended_assessments": [
    {
      "url": "https://www.shl.com/...",
      "name": "Python (New)",
      "description": "...",
      "duration": 11,
      "test_type": ["Knowledge & Skills"]
    }
  ]
}
```

---

## 📊 Evaluation & Ablations (March 2026)

**Hypothesis-driven evaluation framework** measuring retrieval reliability and semantic faithfulness.

**Metric:** Mean Recall@K (K=10) on 50 held-out job-description queries.

### Results Table

| Retrieval Method          | Mean Recall@10 | Precision@10 | Notes                                      |
|---------------------------|----------------|--------------|--------------------------------------------|
| BM25 (keyword baseline)   | 0.41           | 0.28         | High false positives on ambiguous roles    |
| Dense semantic (ours)     | **0.67**       | **0.52**     | +63% improvement                           |
| Dense + metadata re-rank  | **0.74**       | **0.59**     | Best configuration                         |

**Primary Failure Mode Identified**  
Assessment-type mismatch on semantically ambiguous role titles (e.g., “developer” → personality test instead of technical simulation).

**Mitigation** — Metadata-aware post-filter using `assessment_type` + competency tags (implemented and validated).

Full evaluation harness, batch script, and failure-mode notebook: `src/scripts/batch_predict.py` + `notebooks/failure_mode_analysis.ipynb`

**Live demo:** [http://13.60.241.161/](http://13.60.241.161/)

---

**Built by [Rathish Barath](https://github.com/RATHISHBARATH)**  
