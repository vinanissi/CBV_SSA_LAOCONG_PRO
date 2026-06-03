# Case Workspace — Live Operator Metrics

**Phase:** `PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT`  
**Source:** `window.__CASE_WORKSPACE_UAT_EXPORT__()` + evidence log (actual only)  
**Last updated:** 2026-06-01 (agent run — no live data)

---

## Coverage

| Field | Value |
|-------|-------|
| Operators observed | 0 |
| Cases observed | 0 |
| Total operator actions (logged) | 0 |

---

## Gate metrics

| Metric | Target | Value | Status |
|--------|--------|-------|--------|
| Case Understanding Rate | ≥70% | — | **NOT_MEASURED** (0 cases) |
| Workspace Usability Rate | ≥70% | — | **NOT_MEASURED** |
| Task Action Success Rate | ≥90% | — | **NOT_MEASURED** |
| Checklist Success Rate | Qualitative / rate | — | **NOT_MEASURED** |
| Document Access Success Rate | Qualitative / rate | — | **NOT_MEASURED** |
| Timeline Access Success Rate | Qualitative / rate | — | **NOT_MEASURED** |
| Handoff Access Success Rate | Qualitative / rate | — | **NOT_MEASURED** |
| Action Bar Success Rate | Qualitative / rate | — | **NOT_MEASURED** |

**Why NOT_MEASURED:** No staging operator sessions; counters remain zero. Do not estimate.

---

## Count metrics

| Metric | Value | Status |
|--------|-------|--------|
| Operator Friction Count | 0 | **NOT_MEASURED** (live) |
| Operator Confusion Count | 0 | **NOT_MEASURED** (live) |
| Critical Blocker Count | 0 | **NOT_MEASURED** (live) |

---

## How to compute (after live UAT)

From export JSON `rates` object (when `casesObserved > 0`):

- `caseUnderstandingRate` → Case Understanding Rate  
- `workspaceUsabilityRate` → Workspace Usability Rate  
- `taskActionSuccessRate` → Task Action Success Rate  
- `checklistSuccessRate`, `documentAccessSuccessRate`, `timelineAccessSuccessRate`, `handoffAccessSuccessRate`, `actionBarSuccessRate` → respective rows  

Counts from `metrics.operatorFrictionCount`, `metrics.operatorConfusionCount`, and blocker table in evidence log.

---

*Update only from real exports — never fabricate.*
