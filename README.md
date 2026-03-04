# SHL Assessment Recommender 🧠💼

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg)
![LangChain](https://img.shields.io/badge/LangChain-Vector_Search-green.svg)
![Gemini](https://img.shields.io/badge/Gemini-Flash_1.5-orange.svg)

An enterprise-grade **Retrieval-Augmented Generation (RAG)** system built to intelligently map natural language queries and job descriptions to SHL's catalog of talent assessments. 

Hiring managers and recruiters often struggle to find the right assessments for the roles that they are hiring for due to inefficient keyword searches. This engine solves that inefficiency by leveraging semantic vector search and LLMs to deliver highly relevant, dynamically balanced test recommendations.

---

## 🚀 Live Deployment

The application is fully deployed and hosted on **AWS EC2** using a robust reverse-proxy architecture (Nginx + PM2).

* **Live Web Application & API:** [http://13.60.241.161/](http://13.60.241.161/)

---

## ✨ Features

* **Intelligent Query Parsing:** Accepts a natural language query, a job description (JD) text, or a URL containing a JD.
* **Dynamic Recommendation Engine:** Recommends a minimum of 5 and a maximum of 10 highly relevant individual test solutions.
* **Pre-packaged Filter:** Automatically ignores the "Pre-packaged Job Solutions" category to focus purely on individual assessments.
* **Balanced Domain Selection:** Intelligently balances recommendations when a query spans multiple domains, ensuring a mix of hard skills (e.g., "Knowledge & Skills") and soft skills (e.g., "Personality & Behavior").
* **Automated Data Ingestion:** Includes a custom web crawler that scraped and structured over 377 individual test solutions directly from the SHL catalog.

---

## 🏗️ System Architecture



This project implements a complete end-to-end RAG pipeline:

1. **Data Ingestion & Processing:** The SHL Catalog data is crawled, cleaned, and embedded using HuggingFace `all-MiniLM-L6-v2` embeddings. The data includes various test types such as Ability & Aptitude [A], Competencies [C], and Knowledge & Skills [K].
2. **Vector Retrieval (FAISS):** User queries undergo semantic similarity search against the FAISS vector database to retrieve the top relevant assessments.
3. **LLM Synthesis (Gemini 1.5 Flash):** The retrieved context is passed to the LLM with strict prompting constraints to ensure a balanced recommendation of both Technical/Hard Skills and Personality/Behavioral traits.
4. **Client Interface:** A modern React frontend communicates securely with the FastAPI backend.

### 🗂️ Folder Structure
```text
shl-assessment-recommender/
│── src/                 # FastAPI routes, services, and core logic
│   ├── scripts/             # Data scraping and evaluation scripts
│   └── requirements.txt     # Python dependencies
├── frontend/                # React SPA (Vite, Tailwind)
├── data/                    # Scraped SHL catalog (JSON/CSV)
└── README.md

```

---

## ⚙️ Local Installation & Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/RATHISHBARATH/shl-assessment-recommender.git](https://github.com/RATHISHBARATH/shl-assessment-recommender.git)
cd shl-assessment-recommender

```

### 2. Backend Setup (FastAPI + RAG Engine)

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/Scripts/activate  # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file and add your Gemini API Key
echo "GOOGLE_API_KEY=your_gemini_api_key_here" > backend/.env

# Start the API Server
uvicorn backend.src.api.main:app --host 0.0.0.0 --port 8000

```

*The API will be available at `http://localhost:8000`.*

### 3. Frontend Setup (React + Vite)

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev

```

*The web app will be available at `http://localhost:5173`.*

---

## 📡 API Endpoints

The system strictly adheres to the required data contracts for automated evaluation. All data exchanges are in JSON format.

### `GET /health`

Provides a simple status check to verify the API is running.

**Response:**

```json
{
  "status": "healthy"
}

```

**

### `POST /recommend`

Accepts a job description or Natural language query and returns recommended relevant assessments.

**Request:**

```json
{
  "query": "JD/query in string"
}

```

**

**Response (200 OK):**

```json
{
  "recommended_assessments": [
    {
      "url": "[https://www.shl.com/solutions/products/product-catalog/view/python-new/](https://www.shl.com/solutions/products/product-catalog/view/python-new/)",
      "name": "Python (New)",
      "adaptive_support": "No",
      "description": "Multi-choice test that measures the knowledge of Python programming...",
      "duration": 11,
      "remote_support": "Yes",
      "test_type": ["Knowledge & Skills"]
    }
  ]
}

```

**

---

## 📊 Evaluation & Testing

The performance of the assessment recommendation is measured by the **Mean Recall@10** against the provided test set.

$$Recall@K = \frac{\text{Number of relevant assessments in top K}}{\text{Total relevant assessments for the query}}$$

$$MeanRecall@K = \frac{1}{N} \sum_{i=1}^{N} Recall@K_i$$

To generate the required CSV predictions over the unlabeled test set:

```bash
python src/scripts/batch_predict.py

```

This script executes the RAG pipeline over the provided queries and outputs a CSV file strictly formatted with `Query` and `Assessment_url` columns.

*Designed and developed by Rathish Barath for the SHL GenAI Assessment.*



