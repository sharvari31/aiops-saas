from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
import httpx
import os

app = FastAPI(title="Alert Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "sharvarigajendragadkar@gmail.com")
ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "sharvarigajendragadkar@gmail.com")

alerts_store = [
    {
        "id": str(uuid.uuid4()),
        "title": "High CPU Usage",
        "service": "api-gateway",
        "severity": "high",
        "status": "active",
        "description": "CPU exceeded threshold",
        "created_at": datetime.now().isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Memory Threshold Exceeded",
        "service": "database",
        "severity": "medium",
        "status": "active",
        "description": "Memory usage above 70%",
        "created_at": datetime.now().isoformat()
    },
]

class Alert(BaseModel):
    title: str
    service: str
    severity: str
    description: Optional[str] = ""

async def send_email_alert(alert: dict):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {SENDGRID_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "personalizations": [{
                        "to": [{"email": ALERT_EMAIL}],
                        "subject": f"🚨 AIOps Alert — {alert['severity'].upper()} Severity Detected"
                    }],
                    "from": {"email": SENDER_EMAIL, "name": "AIOps Platform"},
                    "content": [{
                        "type": "text/html",
                        "value": f"""
                        <div style="font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 2rem; border-radius: 10px;">
                            <h2 style="color: #f78166;">🚨 AIOps Anomaly Alert</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px; color: #8b949e;">Title</td>
                                    <td style="padding: 8px; color: #c9d1d9; font-weight: bold;">{alert['title']}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; color: #8b949e;">Severity</td>
                                    <td style="padding: 8px; color: {'#f78166' if alert['severity'] == 'high' else '#e3b341'}; font-weight: bold;">{alert['severity'].upper()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; color: #8b949e;">Service</td>
                                    <td style="padding: 8px; color: #c9d1d9;">{alert['service']}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; color: #8b949e;">Description</td>
                                    <td style="padding: 8px; color: #c9d1d9;">{alert['description']}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px; color: #8b949e;">Time</td>
                                    <td style="padding: 8px; color: #c9d1d9;">{alert['created_at']}</td>
                                </tr>
                            </table>
                            <p style="color: #8b949e; margin-top: 1rem; font-size: 12px;">
                                This alert was generated automatically by the AIOps AI Pipeline.<br>
                                Go to your dashboard to resolve this alert.
                            </p>
                        </div>
                        """
                    }]
                }
            )
            if response.status_code == 202:
                print(f"[EMAIL] Alert email sent successfully for {alert['severity']} alert!")
            else:
                print(f"[EMAIL] Failed to send email: {response.status_code} — {response.text}")
    except Exception as e:
        print(f"[EMAIL] Error sending email: {e}")

@app.get("/health")
def health():
    return {"status": "alert service running", "email_alerts": "enabled"}

@app.get("/alerts/active")
def get_active_alerts():
    return [a for a in alerts_store if a["status"] == "active"]

@app.get("/alerts/all")
def get_all_alerts():
    return alerts_store

@app.post("/alerts/create")
async def create_alert(alert: Alert):
    new_alert = {
        "id": str(uuid.uuid4()),
        **alert.dict(),
        "status": "active",
        "created_at": datetime.now().isoformat()
    }
    alerts_store.append(new_alert)
    print(f"[ALERT] New {alert.severity} alert created: {alert.title}")

    # Send email for high and medium severity alerts
    if alert.severity in ["high", "medium"]:
        await send_email_alert(new_alert)

    return new_alert

@app.put("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    for alert in alerts_store:
        if alert["id"] == alert_id:
            alert["status"] = "resolved"
            return {"message": "Alert resolved"}
    return {"message": "Alert not found"}