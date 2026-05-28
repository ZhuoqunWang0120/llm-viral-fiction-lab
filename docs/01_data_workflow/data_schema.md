# Data Schema

## Index Mode JSONL

```json
{
  "index": 7,
  "query": "string",
  "title": "string",
  "author": "string",
  "url": "string",
  "content": "string",
  "publish_date": "string or null",
  "collected_at": "ISO timestamp"
}
```

## Sample Mode JSONL

```json
{
  "sample_id": "string",
  "inferred_index": 56,
  "sample_query": "string",
  "title": "string",
  "author": "string",
  "url": "string",
  "content": "string",
  "publish_date": "string or null",
  "collected_at": "ISO timestamp",
  "collection_mode": "sample"
}
```

## Dry-Run Candidate JSONL

```json
{
  "sample_query": "string",
  "candidate_rank": 1,
  "candidate_title_or_text": "string",
  "candidate_author": "string or null",
  "candidate_url": "string or null",
  "series_confidence": "high | medium | low",
  "author_confidence": "matched | unknown | mismatch",
  "decision": "selected | rejected",
  "decision_reason": "string",
  "observed_at": "ISO timestamp"
}
```
