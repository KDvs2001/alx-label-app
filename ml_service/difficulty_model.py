import json
import os
import re
from typing import Dict, Iterable, List, Optional

import joblib
import numpy as np
from scipy.sparse import hstack
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, "artifacts")
DIFFICULTY_MODEL_PATH = os.path.join(ARTIFACT_DIR, "session_difficulty_model.joblib")
OBSERVATIONS_PATH = os.path.join(ARTIFACT_DIR, "session_cost_observations.jsonl")
PRIORS_PATH = os.path.join(ARTIFACT_DIR, "session_cost_priors.json")


def normalize_text_record(record: Dict, fallback_id: int) -> Dict:
    text = record.get("text") or record.get("data", {}).get("text") or record.get("textSnippet") or ""
    label = record.get("true_label") or record.get("label")
    return {"id": record.get("id", record.get("taskId", fallback_id)), "text": text, "label": label}


def load_dataset_sample(dataset_path: Optional[str] = None, limit: int = 500) -> List[Dict]:
    path = dataset_path or os.path.join(BASE_DIR, "dataset.json")
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)
    records = [normalize_text_record(row, idx) for idx, row in enumerate(raw)]
    return [row for row in records if row["text"]][:limit]


def lexical_difficulty_score(text: str) -> float:
    """Transparent zero-cost bootstrap score used before session observations exist."""
    words = re.findall(r"[A-Za-z']+", text.lower())
    if not words:
        return 0.0

    negators = {"not", "no", "never", "hardly", "barely", "without", "isn't", "wasn't", "don't", "didn't"}
    contrast = {"but", "however", "although", "though", "despite", "yet"}
    jargonish = sum(1 for w in words if len(w) >= 10) / len(words)
    negation = min(1.0, sum(1 for w in words if w in negators) / 4.0)
    ambiguity = min(1.0, sum(1 for w in words if w in contrast) / 3.0)
    punctuation = min(1.0, (text.count("?") + text.count("!") + text.count(";")) / 8.0)
    length_pressure = min(1.0, np.log1p(len(words)) / np.log1p(500))

    score = 0.28 * jargonish + 0.22 * negation + 0.22 * ambiguity + 0.14 * punctuation + 0.14 * length_pressure
    return float(max(0.0, min(1.0, score)))


def bootstrap_cost_labels(records: Iterable[Dict]) -> List[Dict]:
    labels = []
    for row in records:
        text = row["text"]
        difficulty = lexical_difficulty_score(text)
        word_count = len(text.split())
        expected_seconds = 4.0 + 2.6 * np.log1p(word_count) + 7.0 * difficulty
        labels.append({
            "id": row["id"],
            "text": text,
            "semantic_difficulty": round(float(difficulty), 4),
            "expected_seconds": round(float(expected_seconds), 3),
            "source": "transparent_bootstrap_features",
        })
    return labels


def write_jsonl(path: str, rows: Iterable[Dict]) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")


def append_jsonl(path: str, row: Dict) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def read_jsonl(path: str) -> List[Dict]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def record_annotation_observation(text: str, time_seconds: float, label: str = None, task_id=None, session_id: str = None) -> Dict:
    word_count = len(text.split())
    row = {
        "task_id": task_id,
        "session_id": session_id,
        "text": text,
        "label": label,
        "time_seconds": float(max(0.1, min(300.0, time_seconds))),
        "word_count": word_count,
        "log_word_count": float(np.log1p(word_count)),
        "bootstrap_difficulty": lexical_difficulty_score(text),
    }
    append_jsonl(OBSERVATIONS_PATH, row)
    return row


def observations_from_session_export(session_payload: Dict) -> List[Dict]:
    annotations = session_payload.get("annotations") or session_payload.get("session", {}).get("annotations") or []
    rows = []
    for idx, ann in enumerate(annotations):
        text = ann.get("text") or ann.get("textSnippet") or ""
        if not text or not ann.get("timeSeconds"):
            continue
        rows.append({
            "task_id": ann.get("taskId", idx),
            "session_id": session_payload.get("contestantId") or session_payload.get("sessionId"),
            "text": text,
            "label": ann.get("label"),
            "time_seconds": float(ann["timeSeconds"]),
            "word_count": int(ann.get("wordCount") or len(text.split())),
            "log_word_count": float(np.log1p(int(ann.get("wordCount") or len(text.split())))),
            "bootstrap_difficulty": lexical_difficulty_score(text),
        })
    return rows


def load_observations(path: str = OBSERVATIONS_PATH) -> List[Dict]:
    rows = read_jsonl(path)
    clean = []
    for row in rows:
        text = row.get("text", "")
        time_seconds = row.get("time_seconds")
        if text and time_seconds and 0.1 <= float(time_seconds) <= 300:
            clean.append(row)
    return clean


def estimate_priors_from_observations(observations: List[Dict]) -> Dict:
    if len(observations) < 5:
        raise ValueError("Need at least 5 annotation observations to estimate session priors")
    log_lengths = np.array([float(row.get("log_word_count", np.log1p(len(row["text"].split())))) for row in observations])
    times = np.array([float(row["time_seconds"]) for row in observations])
    A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
    alpha, beta = np.linalg.lstsq(A, times, rcond=None)[0]
    residuals = times - A @ np.array([alpha, beta])
    alpha = float(max(1.0, min(15.0, alpha)))
    beta = float(max(0.1, min(15.0, beta)))
    return {
        "alpha_prior": round(alpha, 3),
        "beta_prior": round(beta, 3),
        "sample_size": len(observations),
        "mean_observed_seconds": round(float(np.mean(times)), 3),
        "mean_abs_residual": round(float(np.mean(np.abs(residuals))), 3),
        "source": "self_trained_session_observations",
        "justification": "Priors are fit from actual annotation times recorded by CAL-Log sessions, not external LLM labels.",
    }


def make_feature_matrix(vectorizer: HashingVectorizer, texts: List[str]):
    text_features = vectorizer.transform(texts)
    numeric = np.array([
        [
            np.log1p(len(text.split())),
            len(text),
            text.count("!"),
            text.count("?"),
            lexical_difficulty_score(text),
        ]
        for text in texts
    ], dtype=float)
    if len(numeric):
        numeric[:, 1:] = numeric[:, 1:] / np.maximum(numeric[:, 1:].max(axis=0), 1.0)
    return hstack([text_features, numeric])


def residual_difficulty_targets(observations: List[Dict]) -> np.ndarray:
    log_lengths = np.array([float(row.get("log_word_count", np.log1p(len(row["text"].split())))) for row in observations])
    times = np.array([float(row["time_seconds"]) for row in observations])
    A = np.column_stack([np.ones(len(log_lengths)), log_lengths])
    alpha, beta = np.linalg.lstsq(A, times, rcond=None)[0]
    residuals = times - A @ np.array([alpha, beta])
    lo, hi = np.percentile(residuals, [10, 90])
    if hi <= lo:
        return np.zeros(len(residuals), dtype=float)
    return np.clip((residuals - lo) / (hi - lo), 0.0, 1.0)


def train_self_trained_model(observations: List[Dict], artifact_path: str = DIFFICULTY_MODEL_PATH) -> Dict:
    if len(observations) < 20:
        raise ValueError("Need at least 20 annotation observations to train the self-trained difficulty model")

    texts = [row["text"] for row in observations]
    y = residual_difficulty_targets(observations)
    vectorizer = HashingVectorizer(n_features=2**14, alternate_sign=False, ngram_range=(1, 2))

    x_train, x_test, y_train, y_test = train_test_split(texts, y, test_size=0.25, random_state=42)
    model = Ridge(alpha=1.0)
    model.fit(make_feature_matrix(vectorizer, x_train), y_train)
    preds = np.clip(model.predict(make_feature_matrix(vectorizer, x_test)), 0.0, 1.0)
    corr = float(np.corrcoef(preds, y_test)[0, 1]) if len(y_test) > 1 else 0.0
    if np.isnan(corr):
        corr = 0.0
    mae = float(mean_absolute_error(y_test, preds))

    os.makedirs(os.path.dirname(artifact_path), exist_ok=True)
    joblib.dump({
        "vectorizer": vectorizer,
        "model": model,
        "metrics": {
            "heldout_correlation": corr,
            "heldout_mae": mae,
            "n_train": len(x_train),
            "n_test": len(x_test),
            "source": "self_trained_session_observations",
        },
    }, artifact_path)
    return {"artifact_path": artifact_path, "heldout_correlation": corr, "heldout_mae": mae, "n_observations": len(observations)}


class SemanticDifficultyRegressor:
    def __init__(self, artifact_path: str = DIFFICULTY_MODEL_PATH):
        self.artifact_path = artifact_path
        self.bundle = None
        if os.path.exists(artifact_path):
            self.bundle = joblib.load(artifact_path)

    @property
    def available(self) -> bool:
        return self.bundle is not None

    def predict(self, texts: List[str]) -> np.ndarray:
        if not self.available:
            return np.zeros(len(texts), dtype=float)
        X = make_feature_matrix(self.bundle["vectorizer"], texts)
        return np.clip(self.bundle["model"].predict(X), 0.0, 1.0)

    def metadata(self) -> Dict:
        if not self.available:
            return {"available": False, "artifact_path": self.artifact_path}
        return {"available": True, "artifact_path": self.artifact_path, **self.bundle.get("metrics", {})}
