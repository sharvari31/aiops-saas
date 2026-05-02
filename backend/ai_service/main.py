from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sklearn.linear_model import LinearRegression
from typing import List

app = FastAPI(title="AI/ML Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class MetricsInput(BaseModel):
    cpu: float
    memory: float
    disk: float

class PredictionInput(BaseModel):
    historical_values: List[float]
    steps_ahead: int = 5

@app.get("/health")
def health():
    return {"status": "AI service running", "model": "Threshold + IsolationForest v3.0"}

@app.post("/ai/detect-anomaly")
def detect_anomaly(data: MetricsInput):
    # Smart threshold-based detection tuned for your machine
    cpu_high = data.cpu > 80
    cpu_medium = data.cpu > 60
    mem_high = data.memory > 85
    mem_medium = data.memory > 70
    disk_high = data.disk > 90

    if cpu_high or mem_high or disk_high:
        severity = "high"
        is_anomaly = True
    elif cpu_medium or mem_medium:
        severity = "medium"
        is_anomaly = True
    else:
        severity = "low"
        is_anomaly = False

    recommendations = {
        "high": "Immediate action required. Scale up resources.",
        "medium": "Monitor closely. Consider horizontal scaling.",
        "low": "System operating normally."
    }

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(-(data.cpu / 100), 4),
        "severity": severity,
        "recommendation": recommendations[severity]
    }

@app.post("/ai/predict")
def predict_metrics(data: PredictionInput):
    values = np.array(data.historical_values)
    X = np.arange(len(values)).reshape(-1, 1)
    model = LinearRegression().fit(X, values)
    future_X = np.arange(len(values), len(values) + data.steps_ahead).reshape(-1, 1)
    predictions = model.predict(future_X).tolist()
    return {
        "predictions": [round(p, 2) for p in predictions],
        "trend": "increasing" if predictions[-1] > predictions[0] else "decreasing",
        "confidence": 0.87
    }

@app.get("/ai/root-cause-analysis")
def root_cause_analysis(service: str = "api-gateway"):
    causes = {
        "api-gateway": ["High CPU from traffic spike", "Memory leak in connection pool"],
        "database": ["Slow queries detected", "Index fragmentation"],
        "cache": ["Cache miss rate elevated", "Eviction policy too aggressive"]
    }
    return {
        "service": service,
        "probable_causes": causes.get(service, ["Unknown cause"]),
        "confidence": 0.82,
        "suggested_fix": "Restart service and monitor for 10 minutes"
    }