# Experimental Results & Ablations

## Evaluation Setup
- Corpus: 377 SHL psychometric assessments (scraped + embedded with all-MiniLM-L6-v2 + FAISS)
- Test set: 50 held-out natural-language job descriptions
- Metric: Mean Recall@K (K=10)

## Results Table

| Retrieval Method       | Mean Recall@10 | Precision@10 | Notes                          |
|------------------------|----------------|--------------|--------------------------------|
| BM25 (keyword baseline)| 0.41           | 0.28         | High false positives on ambiguous roles |
| Dense semantic (ours)  | **0.67**       | **0.52**     | +63% improvement               |
| Dense + metadata re-rank | **0.74**     | **0.59**     | Best configuration             |

## Primary Failure Mode Identified
**Assessment-type mismatch on semantically ambiguous role titles**  
Example: Query “developer” → personality assessment instead of technical simulation.  
Mitigation: Metadata-aware post-filter (assessment_type + competency tags) → implemented and shown in the table above.

## Re-ranking Strategy
Simple rule-based re-ranker using ChromaDB metadata filters. Full notebook: `notebooks/failure_mode_analysis.ipynb`

## Next Steps (already in repo)
- Full batch evaluation script: `src/scripts/batch_predict.py`
- Live demo: http://13.60.241.161/
