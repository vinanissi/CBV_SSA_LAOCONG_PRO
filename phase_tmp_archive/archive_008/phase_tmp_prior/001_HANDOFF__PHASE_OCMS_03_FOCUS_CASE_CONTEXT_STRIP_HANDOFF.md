# PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP — Handoff

**Status:** IMPLEMENT complete  
**Date:** 2026-05-31  
**Verdict:** **GO_WITH_WARNINGS**

**RUNTIME_STATE:** `NOT_WIRED`

---

## Delivered

- Case Context Strip module (`apps/workboard/src/modules/ocms/`)
- Focus integration below `CompactTaskHeader`
- Feature flag `VITE_OCMS_CASE_STRIP_ENABLED` (default OFF)
- Static checks `runOcmsCaseContextStripChecks()`

---

## Enable strip (operator)

```bash
# apps/workboard/.env.local
VITE_OCMS_CASE_STRIP_ENABLED=true
```

Rebuild / restart Vite dev server.

---

## Verify

```bash
cd apps/workboard
npm run typecheck
npx tsx -e "import { runOcmsCaseContextStripChecks } from './src/modules/ocms/ocmsCaseContextStripChecks.ts'; console.log(runOcmsCaseContextStripChecks());"
```

---

## Pipeline (runtime)

```text
Focus(taskId) → TaskItem + operationalBundle
  → caseDiscovery (anchors + precedence)
  → caseKeyResolver
  → deriveCaseReadModel
  → resolveStripVisibilityLevel
  → buildCaseContextStripView
  → WorkInboxCaseContextStrip (if flag ON)
```

---

## Not in scope (confirmed)

- CASE_MAIN / write API / GAS case service
- Right Panel Case tab
- HO_SO / FINANCE live projection reads (future Worker wiring)

---

## Next

`PHASE_OCMS_04_FEDERATED_TIMELINE_READ`

---

*End of handoff.*
