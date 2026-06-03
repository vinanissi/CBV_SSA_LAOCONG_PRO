# Handoff — CASE_REFACTOR_04C Live Operator UAT

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT` |
| **Result** | **FAIL** |
| **Next** | **Re-run live UAT on staging** → then `PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION` |

---

## Summary

04C deliverables and extended telemetry are ready. **Live operator evidence is absent** — phase cannot pass until humans complete staging UAT per the live script.

---

## Evidence locations

- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_LIVE_OPERATOR_UAT_SCRIPT.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_LIVE_OPERATOR_EVIDENCE_LOG.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_LIVE_OPERATOR_METRICS.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_LIVE_OPERATOR_FEEDBACK_SUMMARY.md`

---

## Operator runbook

```env
VITE_CASE_WORKSPACE_ENABLED=true
VITE_CASE_WORKSPACE_UAT_TELEMETRY=true
```

1. Follow **L1–L12** in live script.  
2. Use yellow UAT panel **only after** real actions.  
3. End session: copy JSON → evidence log; fill action + session tables.  
4. Update metrics + feedback summary.  
5. Facilitator runs:

```bash
cd apps/workboard
npx tsx -e "import { runCaseWorkspaceLiveOperatorUat04cChecks } from './src/modules/ocms/caseWorkspaceLiveOperatorUatChecks.ts'; console.log(JSON.stringify(runCaseWorkspaceLiveOperatorUat04cChecks(), null, 2));"
```

Expect **GO** only when `liveEvidencePresent: true` and gates documented.

---

## Blockers

- 0 operators / 0 cases / 0 actions logged  
- All gate metrics NOT_MEASURED  

---

*Bundle: phase_tmp/0001_PHASE_CASE_REFACTOR_04C_LIVE_OPERATOR_UAT.zip*
