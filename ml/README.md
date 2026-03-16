---
title: Health Buddy AI
emoji: 🏥
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Health Buddy AI Backend

FastAPI service for health risk prediction and PDF report generation.

## Local Development
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```
