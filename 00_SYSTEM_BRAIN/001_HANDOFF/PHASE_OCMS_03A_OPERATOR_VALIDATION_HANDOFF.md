# PHASE_OCMS_03A_OPERATOR_VALIDATION — Handoff

**Status:** VERIFY complete  
**Date:** 2026-05-31  
**Verdict:** **GO_WITH_WARNINGS**

**RUNTIME_STATE:** `NOT_WIRED`

---

## Delivered

- Operator validation suite: `runOcmsOperatorValidationChecks()` — 28 checks, all PASS
- OCMS_03 regression re-run via same suite (`VAL_OCMS_03_REGRESSION`)
- Governance report + test evidence

---

## Run validation

```bash
cd apps/workboard
npm run typecheck
npx tsx -e "import { runOcmsOperatorValidationChecks } from './src/modules/ocms/ocmsOperatorValidationChecks.ts'; console.log(runOcmsOperatorValidationChecks());"
```

---

## Operator UAT (manual — staging)

1. Set `VITE_OCMS_CASE_STRIP_ENABLED=true`
2. Open Focus on task-only row → expect MINIMAL/STANDARD strip
3. Open Focus on task with `relatedHoSoId` → expect EXPANDED-cap strip + collapse
4. Toggle flag OFF → confirm no strip DOM, no layout gap
5. Confirm Right Panel tabs unchanged (Chi tiết / Timeline / Handoff / Tài liệu)
6. Confirm checklist + attachments still work

---

## Guardrails confirmed

- No CASE_MAIN, API, service, schema
- No Right Panel Case tab
- No fake discovery data

---

## Next

`PHASE_OCMS_04_FEDERATED_TIMELINE_READ`

---

*End of handoff.*
