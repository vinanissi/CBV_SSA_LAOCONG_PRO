# PHASE_OCMS_03D_ENABLE_CASE_CONTEXT_STRIP_FE — Handoff

**Verdict:** **GO_WITH_WARNINGS**

---

## Enable strip locally

```bash
# apps/workboard/.env.local (gitignored)
VITE_OCMS_CASE_STRIP_ENABLED=true
```

Restart `npm run dev`.

---

## Verify

```bash
cd apps/workboard
npm run build
npx tsx -e "import { runOcmsCaseContextStripFeEnableChecks } from './src/modules/ocms/ocmsCaseContextStripFeEnableChecks.ts'; console.log(runOcmsCaseContextStripFeEnableChecks());"
```

Browser: Focus Mode → strip between header and AI summary.

---

## Disable (zero delta)

Remove flag or set `VITE_OCMS_CASE_STRIP_ENABLED=false` — no strip DOM.

---

*End of handoff.*
