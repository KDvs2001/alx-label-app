---
title: CAL-Log Simulation Service
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# CAL-Log ML Service

This is the backend simulation service for the CAL-Log Research Tool.
It runs a Flask app serving:
- Adaptive Cost Model (Alpha/Beta calculation)
- Task Ranking (Entropy / Cost)
- Spy Window Data (Selection Logic, History, Metrics)

## API Endpoints
- POST `/annotate`: Submit user interaction
- POST `/predict`: Rank tasks
- POST `/reset`: Reset session
- GET `/spy/selection`: Last selection logic
- GET `/spy/history`: Adaptation history
- GET `/spy/metrics`: Accuracy metrics
- GET `/spy/task_log`: Persistent task logs
