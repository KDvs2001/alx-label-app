---
title: CAL-Log ML Service
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# CAL-Log Research Tool

**Cost-Aware Active Learning with Logarithmic Cost Model**

A research prototype implementing CAL-Log — an active learning framework that adapts task selection to individual annotator behaviour, optimizing *information gained per second* rather than per sample.

## Architecture

```
┌─────────────┐    /api/*     ┌──────────────┐     /predict      ┌──────────────────┐
│   Client     │ ──────────── │   Server     │  ───────────────  │   ML Service     │
│  (React +    │    proxy     │  (Express +  │                   │  (Flask +        │
│   Vite)      │              │   MongoDB)   │                   │   scikit-learn)  │
│  Port 5173   │    /ml/*     │  Port 5001   │                   │  Port 9090       │
└─────────────┘ ──────────── └──────────────┘                   └──────────────────┘
       │            proxy                                               │
       │                                            writes spy_*.json   │
       └────────── reads spy_*.json from /public ◄──────────────────────┘
```

### Core Algorithm

```
Score(x) = Entropy(x) / Cost(x)
Cost(x)  = α + β · log(1 + Length(x))
```

| Parameter | Meaning | Adaptation |
|-----------|---------|------------|
| **α** (alpha) | Task-switching overhead (seconds) | Adaptive via OLS regression every 5 annotations |
| **β** (beta)  | Reading effort per log-unit of text | Adaptive via OLS regression every 5 annotations |

**β < 1.5** → Fast Skimmer → Cost formula naturally favours longer, high-entropy tasks  
**β > 3.0** → Careful Reader → Cost formula naturally favours shorter, high-entropy tasks

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **MongoDB** Atlas account (or local instance)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd ResearchTool

# Install server dependencies
cd server
npm install
cp .env.example .env   # Edit with your MongoDB URI
cd ..

# Install client dependencies
cd client
npm install
cd ..

# Install ML dependencies
cd ml_service
pip install -r requirements.txt
cd ..
```

### 2. Start All Services

**Terminal 1 — ML Service:**
```bash
cd ml_service
python simulation_server.py
# Runs on http://localhost:9090
```

**Terminal 2 — Server:**
```bash
cd server
npm start
# Runs on http://localhost:5001
```

**Terminal 3 — Client:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

### 3. Open the App

Navigate to `http://localhost:5173/spy` to start the annotation interface.

## Project Structure

```
ResearchTool/
├── client/           # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResearchWorkspace.jsx    # Main annotation interface
│   │   │   └── workspace/
│   │   │       ├── EvaluatorBriefingModal.jsx  # Evaluator onboarding
│   │   │       ├── SpyAnalysis.jsx             # Spy Window panel
│   │   │       └── analysis/                   # Comparison, graphs, debug
│   │   └── pages/
│   │       └── ImpactDashboard.jsx      # ROI & experiment results
│   └── public/
│       ├── demo_tasks.json              # Task dataset
│       └── spy_*.json                   # Runtime files (auto-generated)
├── server/           # Express + MongoDB backend
│   ├── index.js
│   └── infrastructure/
│       ├── http/routes/                 # REST API routes
│       └── database/models/             # Mongoose schemas
├── ml_service/       # Flask ML service
│   ├── simulation_server.py             # Main server
│   ├── cost_engine.py                   # Adaptive Cost Model (α, β)
│   └── models/
│       └── cal_log_ranker.py            # CAL-Log ranking algorithm
└── README.md
```

## For Evaluators

When you open the Spy Window (`/spy`), you will see:

1. **Evaluator Briefing** — Interactive guide explaining CAL-Log and what to observe
2. **Contestant ID** — Enter your identifier to track your session
3. **Annotation Interface** — Read text, label as Positive/Negative
4. **Spy Window (right panel)** — Real-time view of CAL-Log's decision-making

### What to Watch For

- **After 5 annotations**: The model retrains and α/β parameters update via OLS regression
- **Selection Logic card**: Shows whether CAL-Log classified you as a Fast Skimmer, Balanced, or Careful Reader
- **Efficiency Savings**: Compare CAL-Log's task selections against Random and Entropy baselines
- **Parameter Graphs**: Watch α and β adapt as the system learns your reading speed

## Research Context

This tool validates the CAL-Log algorithm introduced in our ICAIIC paper. The simulation demonstrates that CAL-Log reduces true annotation cost (time × effort) by adapting to individual annotator reading patterns, as opposed to standard Active Learning methods that only optimize for model uncertainty.

## License

Research use only.
