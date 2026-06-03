# Handoff — CASE_REFACTOR_04B Operator UAT

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_04B_OPERATOR_UAT` |
| **Result** | GO_WITH_WARNINGS |
| **Next** | `PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT` (staging sessions) → `05` after gates |

---

## Summary

Phase 04B adds **in-app operator self-report** for Case Workspace UAT (telemetry flag only). Build and static checks pass. **Live operator evidence still missing** — do not claim full GO or proceed to persistence without staging sessions.

---

## What changed

1. `CaseWorkspaceUatRecorder` — buttons: Hiểu case, checklist, docs, timeline, handoff, friction, copy JSON, reset session.
2. `runCaseWorkspaceOperatorUat04bChecks()` — extends phase 04 checks with recorder gates.
3. UAT script, evidence log, summary updated for 04B.

---

## Evidence location

- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_OPERATOR_UAT_SCRIPT.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_OPERATOR_EVIDENCE_LOG.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_UAT_SUMMARY.md`

---

## How to run live UAT (operators)

```env
VITE_CASE_WORKSPACE_ENABLED=true
VITE_CASE_WORKSPACE_UAT_TELEMETRY=true
VITE_CBV_API_BASE_URL=<staging>
```

1. `npm run dev` in `apps/workboard` (restart after env change).
2. `/inbox` → Focus on real staging tasks.
3. Per case: use workspace + yellow UAT panel **only after** performing each action.
4. End session: **Copy metrics JSON** → paste in evidence log; append session table row + Q1–Q10 feedback.
5. Update `CASE_WORKSPACE_UAT_SUMMARY.md`.

---

## Verify (technical)

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runCaseWorkspaceOperatorUat04bChecks } from './src/modules/ocms/caseWorkspaceOperatorUatChecks.ts'; console.log(JSON.stringify(runCaseWorkspaceOperatorUat04bChecks(), null, 2));"
```

---

## Blockers for GO

- Operator count &lt; 3
- Case count &lt; 20
- Gate metrics N/A

---

*Bundle: phase_tmp/0001_PHASE_CASE_REFACTOR_04B_OPERATOR_UAT.zip*
