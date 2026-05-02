# AIOps SaaS Platform

> AI-powered IT Operations platform that monitors real system metrics, detects anomalies using machine learning, and creates alerts automatically — with zero human intervention.

Built as an MCA final year project at MPSTME, NMIMS by Sharvari Gajendragadkar**.

---

## What it does

Traditional monitoring uses fixed rules — alert if CPU > 80%. This misses context.

This platform uses **Isolation Forest** (unsupervised ML) to learn what normal looks like for your specific machine and flags anything that deviates — even if it never crosses a fixed threshold. Every 60 seconds, real CPU/memory/disk data flows automatically through the AI pipeline and creates severity-classified alerts without any human input.

---

## Architecture

```
9 Microservices running in Docker containers

Frontend (React)        :3000   — Live dashboard, charts, alerts management
Auth Service            :8001   — JWT login and registration
Metrics Service         :8002   — Real CPU/RAM/Disk via psutil + AI pipeline
AI Service              :8003   — Isolation Forest + Linear Regression
Alert Service           :8004   — Alert CRUD and severity management
PostgreSQL              :5432   — Persistent storage
Redis                   :6379   — Session caching
Prometheus              :9090   — Metrics scraping
Grafana                 :3001   — Monitoring visualisation
```

---

## AI/ML Pipeline

Every 60 seconds — automatically:

```
psutil reads real CPU/Memory/Disk
        ↓
Isolation Forest scores the reading
        ↓
Score < -0.15 → anomaly detected
        ↓
Alert Service creates alert automatically
        ↓
Dashboard shows alert in real time
```

**Isolation Forest** — unsupervised anomaly detection (Liu, Ting, Zhou — IEEE ICDM 2008)
- Builds 100 random decision trees
- Anomaly score: `s = 2 ^ (-E[h(x)] / c(n))`
- Score close to 1 = anomaly, close to 0.5 = normal

**Linear Regression** — CPU forecasting
- Fits `y = mx + b` through last 20 readings
- Predicts next 5 values for proactive alerting

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Recharts, Axios, React Router |
| Backend | FastAPI, Python, uvicorn, asyncio |
| AI/ML | Scikit-learn, Isolation Forest, Linear Regression, NumPy |
| Auth | JWT, bcrypt, python-jose |
| Databases | PostgreSQL, Redis |
| Monitoring | Prometheus, Grafana |
| DevOps | Docker, Docker Compose, GitHub Actions CI/CD |
| System | psutil, httpx, Nginx |

---

## How to Run

**Requirements:** Docker Desktop, Git

```bash
# Clone the repo
git clone https://github.com/sharvari31/aiops-saas.git
cd aiops-saas

# Start all 9 services
docker compose up -d

# Check all services are running
docker compose ps
```

**Open in browser:**

| Service | URL |
|---|---|
| Dashboard | http://localhost:3000 |
| Auth API docs | http://localhost:8001/docs |
| Metrics API docs | http://localhost:8002/docs |
| AI API docs | http://localhost:8003/docs |
| Alerts API docs | http://localhost:8004/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3001 |

**Login:** `admin@aiops.com` / `admin123`

---

## Features

- Real-time CPU, memory and disk monitoring from actual hardware via psutil
- Isolation Forest anomaly detection running automatically every 60 seconds
- Linear Regression forecasting for next 5 metric readings
- Severity-classified alerts (high / medium / low) created without human input
- JWT authentication with login and registration
- Live dashboard with area charts refreshing every 5 seconds
- Alerts management with filter tabs and resolve functionality
- CI/CD pipeline via GitHub Actions
- All services containerised with Docker

---

## API Reference

### AI Service (port 8003)

```
POST /ai/detect-anomaly
Body: { "cpu": 71.7, "memory": 37.5, "disk": 3.0 }
Returns: { "is_anomaly": true, "anomaly_score": -0.154, "severity": "medium", "recommendation": "..." }

POST /ai/predict
Body: { "historical_values": [10, 20, 30, 40, 50], "steps_ahead": 5 }
Returns: { "predictions": [60, 70, 80, 90, 100], "trend": "increasing", "confidence": 0.87 }

GET /ai/root-cause-analysis?service=api-gateway
Returns: { "probable_causes": [...], "confidence": 0.82 }
```

---

## Project Structure

```
aiops-saas/
├── frontend/                  React dashboard
├── backend/
│   ├── auth_service/          JWT authentication
│   ├── metrics_service/       Real metrics + AI pipeline
│   ├── ai_service/            Isolation Forest + Linear Regression
│   └── alert_service/         Alert management
├── monitoring/
│   └── prometheus.yml         Prometheus scrape config
├── .github/workflows/         GitHub Actions CI/CD
└── docker-compose.yml         Orchestrates all 9 services
```

---

## References

1. Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). *Isolation Forest*. IEEE ICDM. https://doi.org/10.1109/ICDM.2008.17
2. James, G., Witten, D., Hastie, T., Tibshirani, R. (2013). *An Introduction to Statistical Learning*. Springer.
3. FastAPI Documentation — https://fastapi.tiangolo.com
4. Scikit-learn Documentation — https://scikit-learn.org

---

## Author

**Sharvari Gajendragadkar**
MCA — MPSTME, NMIMS University, Mumbai
GitHub: [@sharvari31](https://github.com/sharvari31)
