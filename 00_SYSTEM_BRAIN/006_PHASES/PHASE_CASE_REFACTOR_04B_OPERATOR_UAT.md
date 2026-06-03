# Phase — CASE_REFACTOR_04B Operator UAT (live)

| Field | Value |
|-------|-------|
| **Phase ID** | `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT` |
| **Mode** | VERIFY |
| **Depends on** | `PHASE_CASE_REFACTOR_04_OPERATOR_UAT` |

---

## GOAL

Execute **real** operator UAT for Case Workspace in staging. Collect evidence — no fabrication.

---

## DELIVERABLES

- `CASE/CASE_WORKSPACE_OPERATOR_UAT_SCRIPT.md` (updated)
- `CASE/CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md`
- `CASE/CASE_WORKSPACE_UAT_SUMMARY.md`
- `000_REPORTS/PHASE_CASE_REFACTOR_04B_OPERATOR_UAT_REPORT.md`
- `001_HANDOFF/PHASE_CASE_REFACTOR_04B_OPERATOR_UAT_HANDOFF.md`
- `005_TEST_EVIDENCE/PHASE_CASE_REFACTOR_04B_OPERATOR_UAT_TEST_EVIDENCE.md`
- Optional: `CaseWorkspaceUatRecorder.tsx` (staging telemetry flag)

---

## NEXT

`PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION` — only after live UAT gates met.
