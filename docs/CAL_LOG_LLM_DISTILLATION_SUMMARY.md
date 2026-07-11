# CAL-Log Offline LLM Priors and Distilled Difficulty

## What changed

CAL-Log now has two optional, demo-safe AI additions that change system behavior without adding live LLM calls to the annotation loop.

### 1. Cold-start cost priors

Before a human starts annotating, CAL-Log can sample an unlabeled corpus and batch it through Anthropic once:

```powershell
$env:ANTHROPIC_API_KEY="..."
python ml_service/scripts/generate_llm_difficulty_labels.py --limit 500 --batch-size 20
python ml_service/scripts/estimate_cost_priors.py --limit 500
```

The output artifact is:

```text
ml_service/artifacts/llm_cost_priors.json
```

At runtime, enable it with:

```powershell
$env:CALLOG_USE_LLM_PRIORS="1"
python ml_service/simulation_server.py
```

The Flask service also exposes:

```text
POST /session/init-priors
```

Example body:

```json
{
  "sample_size": 300,
  "batch_size": 20,
  "use_llm": true,
  "model": "claude-sonnet-4-6",
  "persist": true,
  "apply": true
}
```

This returns `alpha_prior`, `beta_prior`, corpus difficulty statistics, and a short justification. If `apply` is true, the active `AdaptiveCostModel` uses those priors immediately.

### 2. Distilled semantic difficulty model

The LLM labels a few hundred to one thousand examples offline with `semantic_difficulty` in `[0, 1]`. Then CAL-Log trains a local sklearn regressor:

```powershell
python ml_service/scripts/train_distilled_difficulty_model.py --limit 1000
```

The output artifact is:

```text
ml_service/artifacts/semantic_difficulty_model.joblib
```

At demo time, enable the new cost term with:

```powershell
$env:CALLOG_USE_SEMANTIC_COST="1"
$env:CALLOG_GAMMA="6.0"
python ml_service/simulation_server.py
```

The live ranking cost becomes:

```text
Cost_v2 = alpha + beta * log(1 + word_count) + gamma * predicted_difficulty
```

The predicted difficulty is produced by the local serialized model. There is no Anthropic/API/network call inside `/predict` or `/annotate`.

## Comparison outputs

Task 1 comparison:

```powershell
python ml_service/scripts/compare_priors_simulation.py --limit 1200 --target-f1 0.72
```

Output:

```text
ml_service/artifacts/prior_comparison.json
```

This logs default priors versus LLM-informed priors, including annotations/time to target F1.

Task 2 evaluation:

```text
ml_service/artifacts/semantic_difficulty_eval.json
```

This stores held-out correlation and MAE between the distilled regressor and the original LLM difficulty labels.

## Why this is not a cosmetic LLM wrapper

These additions are not just narrating existing metrics.

The cold-start prior changes the initial `alpha` and `beta` used by `AdaptiveCostModel`, so the first batch of task rankings can change before any human timing data exists. Without the LLM-derived pre-session estimate, the system falls back to fixed constants and cannot reason about expected corpus difficulty before annotation begins.

The distilled difficulty model changes the ranking objective itself. High-ambiguity or semantically difficult texts receive an additional predicted cost penalty, even if they have the same word count as easy texts. Removing the distilled artifact removes this signal entirely; the system would go back to length-only cost estimation.

The live system remains reliable for a demo because LLM work happens offline. At annotation time, CAL-Log only loads local JSON/joblib artifacts and runs sklearn inference.

## Current limitations visible in code

1. Candidate selection only ranks the next slice of the pool, not the full unlabeled pool.

   Location: `ml_service/simulation_server.py`, inside `/predict`, where `candidates = available[:batch_size]`.

   Why it matters: CAL-Log ranks only the first 200 currently available items after shuffling. If a more valuable high-entropy/low-cost item exists later in the pool, it is invisible to the ranker for that request.

2. The live Flask state is global and shared across users.

   Location: `ml_service/simulation_server.py`, module-level `state = SimulationState()`.

   Why it matters: if two evaluators use the same ML service at once, alpha/beta history, model weights, pending labels, and shadow metrics can leak across sessions. The Node session store is per contestant, but the ML state is not.

3. The cost update can duplicate historical interactions.

   Location: `ml_service/simulation_server.py` passes the full `interaction_buffer` to `cost_model.update`, while `cost_engine.py` appends every received interaction into `user_history`.

   Why it matters: after multiple updates, older interactions can be appended repeatedly. This can overweight early annotations and make the rolling alpha/beta estimate less responsive than intended.
