# PHASE_OCMS_03B_REAL_OPERATOR_UAT — Handoff

**Verdict:** **GO_WITH_WARNINGS**  
**RUNTIME_STATE:** `NOT_WIRED**

---

## Run readiness checks

```bash
cd apps/workboard
npm run typecheck
npx tsx -e "import { runOcmsRealOperatorUatChecks } from './src/modules/ocms/ocmsRealOperatorUatChecks.ts'; console.log(runOcmsRealOperatorUatChecks());"
```

---

## Operator trial

1. Read `OCMS/OCMS_CASE_STRIP_UAT_OPERATOR_SCRIPT.md`
2. Enable flags (strip + UAT telemetry)
3. Execute O1–O8
4. Export metrics: `window.__OCMS_UAT_EXPORT__()`
5. Record feedback in script section — **do not invent scores**

---

## Telemetry scope

- **sessionStorage** key `cbv_ocms_strip_uat_v1`
- No backend, no CASE write model
- Default OFF when `VITE_OCMS_UAT_TELEMETRY` unset

---

## Next

Staging sign-off → `PHASE_OCMS_04_FEDERATED_TIMELINE_READ`

---

*End of handoff.*
