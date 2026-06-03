# Test Evidence — CASE_REFACTOR_04B Operator UAT

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT` |
| **Date** | 2026-06-01 |
| **Result** | GO_WITH_WARNINGS |

---

## Automated / static

| Test | Command / runner | Result |
|------|------------------|--------|
| Workboard production build | `cd apps/workboard && npm run build` | PASS |
| 04B readiness suite | `runCaseWorkspaceOperatorUat04bChecks()` | GO_WITH_WARNINGS |

**Runner:**

```bash
cd apps/workboard
npx tsx -e "import { runCaseWorkspaceOperatorUat04bChecks } from './src/modules/ocms/caseWorkspaceOperatorUatChecks.ts'; console.log(JSON.stringify(runCaseWorkspaceOperatorUat04bChecks(), null, 2));"
```

**Skipped (by design):** `live_operator_sessions`, `operator_feedback_scores`

---

## Manual (operators — not run in agent)

| ID | Scenario | Status |
|----|----------|--------|
| O1–O10 | See `CASE_WORKSPACE_OPERATOR_UAT_SCRIPT.md` | NOT_RUN |

---

## Recorder smoke (code-only)

| Check | Pass |
|-------|------|
| `UAT_IN_APP_RECORDER` | Yes |
| `UAT_RECORDER_WIRED` | Yes |
| Recorder hidden when telemetry flag OFF | Code path via `isCaseWorkspaceUatTelemetryEnabled()` |

---

## Live metrics

**Not collected — not fabricated.**

---

*Evidence log: `CASE/CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md`.*
