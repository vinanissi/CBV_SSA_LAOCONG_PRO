# Phase — CASE_REFACTOR_04C Live Operator UAT

| Field | Value |
|-------|-------|
| **Phase ID** | `PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT` |
| **Mode** | VERIFY |
| **Depends on** | `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT` |

---

## GOAL

Collect **live or staging** operator evidence for Case Workspace. Minimum: 3 operators, 20 cases, 100+ actions. No fabrication.

---

## DELIVERABLES

- `CASE/CASE_WORKSPACE_LIVE_OPERATOR_UAT_SCRIPT.md`
- `CASE/CASE_WORKSPACE_LIVE_OPERATOR_EVIDENCE_LOG.md`
- `CASE/CASE_WORKSPACE_LIVE_OPERATOR_METRICS.md`
- `CASE/CASE_WORKSPACE_LIVE_OPERATOR_FEEDBACK_SUMMARY.md`
- Report / Handoff / Test evidence

---

## RESULT RULE

**FAIL** if live operator evidence absent. **GO** only when gates measured from real exports.

---

## NEXT

`PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION` — after live UAT gates met.
