import psutil
import httpx
import asyncio
import time
from datetime import datetime

AWS_URL = "http://3.110.131.22:8002"

async def send_metrics():
    print("Agent started! Sending your laptop metrics to AWS...")
    while True:
        try:
            cpu = psutil.cpu_percent(interval=0.5)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            net = psutil.net_io_counters()

            data = {
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
                "timestamp": int(time.time()),
                "device": "Sharvari-Laptop"
            }

            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(f"{AWS_URL}/metrics/ingest", json=data)
                print(f"[{data['time']}] Sent → CPU:{cpu}% MEM:{memory.percent}% Status:{response.status_code}")

        except Exception as e:
            print(f"Error: {e}")

        await asyncio.sleep(5)

asyncio.run(send_metrics())