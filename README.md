# CAL-Log Research Tool

---

## 📊 Overview

**CAL-Log** (Cost‑Aware Active Learning with Logarithmic Cost) is a research prototype that selects annotation tasks based on **information gain per unit of cognitive cost**.  The system adapts in real‑time to each annotator’s reading speed, providing a mathematically‑grounded, transparent active‑learning loop.

---

## 🎯 Research Objectives

- Demonstrate that a **cost‑aware scoring function** (Entropy / Cost) reduces annotation time compared to classic uncertainty‑sampling baselines.
- Model annotator fatigue with an **OLS‑based cost model** (α + β·log length).
- Provide **full transparency** for every selected task (entropy, cost, β‑label) to support reproducible research.

---

## 🏗️ Architecture

The project is split into three independent runtimes that communicate via HTTP:

1. **Frontend (React + Vite)** – UI for annotators, Spy‑Mode dashboard, and evaluator briefing.
2. **Backend (Node + Express + MongoDB)** – REST API, session persistence, and feedback collection.
3. **ML Service (Python + Flask + scikit‑learn)** – CAL‑Log algorithm, adaptive cost model, and shadow‑model benchmarking.

> **Diagram placeholders** – replace the PNG files with the actual exported images from your Mermaid diagrams.

![Use‑Case Diagram](assets/use_case_diagram.png)
![Class Diagram (ML Service)](assets/ml_service_class_diagram.png)
![ER Diagram (MongoDB)](assets/er_diagram.png)

---

## 📐 Core Mathematics

```text
Score(x) = Entropy(x) / Cost(x)
Cost(x)  = α + β · log(1 + Length(x))
```

- **Entropy(x)** – Shannon entropy of the RoBERTa‑Base classifier’s soft‑max output.
- **α (alpha)** – Fixed overhead for task‑switching (seconds).
- **β (beta)** – Dynamic per‑word cost, updated every 5 annotations via Ordinary Least Squares regression on the annotator’s observed reading speed.

The cost model is **fatigue‑aware**: after each 5 k words processed, β is re‑estimated, causing the system to favor shorter tasks for a careful reader (β > 3) or longer tasks for a fast skimmer (β < 1.5).

---

## 🛠️ Prerequisites

| Component | Minimum Version |
|-----------|-----------------|
| **Node.js** | 18.x |
| **Python** | 3.9 |
| **MongoDB** | 4.4 (Atlas or local) |
| **Docker** (optional) | – |

---

## 🚀 Quick Start

```bash
# 1️⃣ Clone the repository
git clone <repo‑url>
cd ResearchTool

# 2️⃣ Install server dependencies
cd server
npm install
cp .env.example .env   # set MONGODB_URI, PORT, etc.
cd ..

# 3️⃣ Install client dependencies
cd client
npm install
cd ..

# 4️⃣ Install ML service dependencies
cd ml_service
pip install -r requirements.txt
cd ..
```

### Run the three services (three terminals recommended)

```bash
# Terminal 1 – ML Service (Flask)
cd ml_service
python simulation_server.py   # → http://localhost:9090

# Terminal 2 – Backend (Express)
cd server
npm start                     # → http://localhost:5001

# Terminal 3 – Frontend (Vite)
cd client
npm run dev                  # → http://localhost:5173
```

Open `http://localhost:5173/spy` to start an annotation session.

---

## 👤 Evaluator (User) Manual

1. **Enter Contestant ID** – unique identifier for your session.
2. **Read the brief** – the onboarding modal explains CAL‑Log and the Spy‑Mode.
3. **Label each task** – click *Positive* or *Negative*; the timer records `timeSeconds`.
4. **Watch the Spy Panel** – real‑time display of:
   - Entropy score
   - Cost score (α + β·log len)
   - Current β‑label (`Fast Skimmer`, `Balanced`, `Careful Reader`)
   - ROI comparison against Random & Entropy baselines
5. **Complete the survey** – after the last task, fill the post‑session questionnaire (feedback route).

---

## 🧑‍🔬 Researcher (Developer) Guide

- **Adding a new baseline**: create a new `SimpleBackbone` instance in `SimulationState._init_files()` and register it in `self.models`.
- **Changing the cost‑model update frequency**: modify `SimulationState.steps_since_update` logic in `annotate()`.
- **Exporting logs**: run `node scripts/export_feedback.js` to generate `evaluator_feedback_export.json`.
- **Running batch experiments (Kaggle mode)**: use `ml_service/experiment_runner.py` (not included in the repo) – it loads the same `SimulationState` class and iterates over all datasets.

---

## 📂 Project Structure (Current)

```
ResearchTool/
├── client/                     # React + Vite UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── ResearchWorkspace.jsx
│   │   │   └── workspace/
│   │   │       ├── EvaluatorBriefingModal.jsx
│   │   │       └── SpyAnalysis.jsx
│   │   └── pages/
│   │       └── ImpactDashboard.jsx
│   └── public/
│       ├── demo_tasks.json
│       └── spy_*.json          # runtime telemetry files
├── server/                     # Express API + MongoDB
│   ├── index.js
│   └── infrastructure/
│       ├── http/routes/
│       │   ├── session.js      # ← now contains DDD‑style comments
│       │   └── feedback.js     # ← now contains DDD‑style comments
│       └── database/models/
│           ├── AnnotationSession.js
│           └── EvaluatorFeedback.js
├── ml_service/                 # Flask ML core
│   ├── simulation_server.py
│   ├── cost_engine.py
│   └── models/
│       └── cal_log_ranker.py
└── README.md
```

> **Note** – `server/application/services/mlService.js` has been permanently removed.

---

## 🐞 Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Cannot connect to MongoDB` | Missing/incorrect `MONGODB_URI` in `.env` | Verify the connection string, ensure network access.
| `Flask server 502` | Port conflict (9090) | Stop any other process using the port or change `PORT` in `ml_service/.env`.
| UI shows *No tasks* | Dataset not loaded | Ensure `dataset.json` exists in `ml_service/` and is valid JSON.
| Transparency panel empty | `beta` not updated yet | Wait until at least 5 annotations have been recorded.

---

## 📚 Citation

If you use this tool for research, please cite the original CAL‑Log paper:
```
@inproceedings{cal‑log2024,
  title={Cost‑Aware Active Learning with Logarithmic Cost Model},
  author={Your Name and Co‑author},
  booktitle={Proceedings of the International Conference on AI & Interaction},
  year={2024}
}
```

---

## 📝 License

Research‑use only.  Redistribution or commercial use requires explicit permission from the authors.

---

## 🙏 Acknowledgements

- The **Open‑Source community** for `scikit‑learn`, `express`, `mongoose`, and `react`.
- **Annotators** who participated in the user study.
- **Funding** from XYZ grant (if applicable).

---

*Prepared for the viva defense of the CAL‑Log thesis (2026).*
