from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(title="Alert Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

alerts_store = [
    {"id": str(uuid.uuid4()), "title": "High CPU Usage", "service": "api-gateway",
     "severity": "high", "status": "active", "created_at": datetime.now().isoformat()},
    {"id": str(uuid.uuid4()), "title": "Memory Threshold Exceeded", "service": "database",
     "severity": "medium", "status": "active", "created_at": datetime.now().isoformat()},
]

class Alert(BaseModel):
    title: str
    service: str
    severity: str
    description: Optional[str] = ""

@app.get("/health")
def health():
    return {"status": "alert service running"}

@app.get("/alerts/active")
def get_active_alerts():
    return [a for a in alerts_store if a["status"] == "active"]

@app.get("/alerts/all")
def get_all_alerts():
    return alerts_store

@app.post("/alerts/create")
def create_alert(alert: Alert):
    new_alert = {
        "id": str(uuid.uuid4()),
        **alert.dict(),
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    alerts_store.append(new_alert)
    return new_alert

@app.put("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for alert in alerts_store:
        if alert["id"] == alert_id:
            alert["status"] = "resolved"
            return {"message": "Alert resolved"}
    return {"message": "Alert not found"}