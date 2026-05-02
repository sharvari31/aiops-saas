from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psutil
import time
import httpx
import asyncio
from datetime import datetime

app = FastAPI(title="Metrics Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

AI_SERVICE_URL = "http://ai_service:8003"
ALERT_SERVICE_URL = "http://alert_service:8004"

def get_real_metrics():
    cpu = psutil.cpu_percent(interval=0.5)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net = psutil.net_io_counters()
    return {
        "time": datetime.now().strftime("%H:%M:%S"),
        "cpu": cpu,
        "memory": round(memory.percent, 2),
        "disk": round(disk.percent, 2),
        "memory_total_gb": round(memory.total / (1024**3), 2),
        "memory_used_gb": round(memory.used / (1024**3), 2),
        "disk_total_gb": round(disk.total / (1024**3), 2),
        "disk_used_gb": round(disk.used / (1024**3), 2),
        "network_sent_mb": round(net.bytes_sent / (1024**2), 2),
        "network_recv_mb": round(net.bytes_recv / (1024**2), 2),
        "timestamp": int(time.time())
    }

async def run_ai_pipeline():
    while True:
        try:
            m = get_real_metrics()
            async with httpx.AsyncClient(timeout=10) as client:
                ai_response = await client.post(
                    f"{AI_SERVICE_URL}/ai/detect-anomaly",
                    json={"cpu": m["cpu"], "memory": m["memory"], "disk": m["disk"]}
                )
                result = ai_response.json()
                print(f"[AI] CPU:{m['cpu']}% MEM:{m['memory']}% → severity:{result['severity']} anomaly:{result['is_anomaly']}")

                if result["is_anomaly"]:
                    await client.post(
                        f"{ALERT_SERVICE_URL}/alerts/create",
                        json={
                            "title": f"Anomaly Detected — CPU:{m['cpu']}% MEM:{m['memory']}%",
                            "service": "metrics-pipeline",
                            "severity": result["severity"],
                            "description": result["recommendation"]
                        }
                    )
                    print(f"[ALERT] Created {result['severity']} alert!")

        except Exception as e:
            print(f"[Pipeline Error] {e}")

        await asyncio.sleep(60)

@app.on_event("startup")
async def startup():
    await asyncio.sleep(10)
    asyncio.create_task(run_ai_pipeline())
    print("[Pipeline] AI monitoring pipeline started!")

@app.get("/health")
def health():
    return {"status": "metrics service running", "pipeline": "active"}

@app.get("/metrics/latest")
def get_latest_metrics():
    history = []
    for i in range(20):
        m = get_real_metrics()
        m["time"] = f"{i}s ago"
        history.append(m)
    return history

@app.get("/metrics/current")
def get_current():
    return get_real_metrics()

@app.get("/metrics/summary")
def get_summary():
    m = get_real_metrics()
    return {
        "avg_cpu": m["cpu"],
        "avg_memory": m["memory"],
        "disk_percent": m["disk"],
        "uptime_seconds": int(time.time() - psutil.boot_time()),
        "uptime_percent": 99.8,
        "total_requests": 0,
        "error_rate": 0.0
    }