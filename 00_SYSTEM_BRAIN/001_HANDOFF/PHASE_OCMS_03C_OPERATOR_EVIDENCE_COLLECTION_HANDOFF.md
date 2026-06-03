# PHASE_OCMS_03C_OPERATOR_EVIDENCE_COLLECTION — Handoff

**Verdict:** **GO_WITH_WARNINGS**  
**RUNTIME_STATE:** `NOT_WIRED`

---

## Operator lead workflow

1. Enable flags (see `OCMS_CASE_STRIP_UAT_OPERATOR_SCRIPT.md`)
2. Each operator completes O1–O8 on staging Focus tasks
3. Export: `copy(window.__OCMS_UAT_EXPORT__())`
4. Paste JSON into `OCMS/OCMS_CASE_STRIP_OPERATOR_EVIDENCE_LOG.md`
5. Parse to table (optional):

```bash
cd apps/workboard
npx tsx -e "import { parseOcmsUatExportJson, formatOcmsEvidenceMetricsTable } from './src/modules/ocms/ocmsOperatorEvidenceParser.ts'; const r = parseOcmsUatExportJson(process.argv[1]); console.log(r.ok ? formatOcmsEvidenceMetricsTable(r.payload) : r);"
```

(paste JSON as escaped argument or via temp file)

6. Complete qualitative + rollup sections
7. Update `005_TEST_EVIDENCE/PHASE_OCMS_03C_OPERATOR_EVIDENCE_COLLECTION_TEST_EVIDENCE.md` with **COLLECTED** status

---

## Readiness check

```bash
cd apps/workboard
npx tsx -e "import { runOcmsOperatorEvidenceCollectionChecks } from './src/modules/ocms/ocmsOperatorEvidenceCollectionChecks.ts'; console.log(runOcmsOperatorEvidenceCollectionChecks());"
```

---

## Blockers for OCMS_04

- ≥3 operator sessions with valid exports
- ≥20 `focusTaskViews` aggregate (per threshold helper)
- Signed governance attestation in evidence log

---

*End of handoff.*
