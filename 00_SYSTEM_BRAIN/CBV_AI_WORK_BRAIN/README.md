---
doc: README
module: CBV_AI_WORK_BRAIN
purpose: Orientation for AI-assisted work sessions on CBV_SSA_LAOCONG_PRO
doctrine: Append-only logs elsewhere in this tree; README may gain new sections, not destructive edits to history
updated: 2026-05-11
---

# CBV_AI_WORK_BRAIN

## Purpose

Central, **human- and AI-readable** workspace for continuity: what we know, what we decided, what failed, and what we observed in runtime—**without** replacing Git history or production docs.

## Layout

| Path | Role |
|------|------|
| `MEMORY_INDEX.md` | Pointers to canonical sources (schemas, specs, RUN reports). |
| `PROJECT_STATE.md` | Short factual state; append dated sections when milestones change. |
| `DECISION_LOG.md` | Decision records (append-only dated entries). |
| `ERROR_LEARNING_LOG.md` | Post-incident learnings (append-only). |
| `RUNTIME_OBSERVATION_LOG.md` | Spreadsheet/GAS/AppSheet observations (append-only). |
| `AI_HANDOFF_PROMPTS/` | Curated prompt fragments or templates for handoff. |
| `TEMP_CONTEXT/` | Ephemeral exports (rotate/delete per operator policy). |
| `NOISE_REJECTED/` | Rejected or superseded snippets (append-only archive). |
| `SNAPSHOTS/` | Frozen excerpts referencing dated RUN folders or tags. |

## Rules

- **No secrets:** never store PAT, `.clasp.json` live values, API keys, or cookies here.
- **No fake data:** do not invent spreadsheet rows, user IDs, or incidents.
- **Scaffold first:** populate deliberately when phases complete.
