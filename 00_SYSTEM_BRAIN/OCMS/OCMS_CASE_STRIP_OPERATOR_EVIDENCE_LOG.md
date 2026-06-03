# OCMS Case Strip — Operator Evidence Log

**Phase:** `PHASE_OCMS_03C_OPERATOR_EVIDENCE_COLLECTION`  
**Prerequisite:** `OCMS_CASE_STRIP_UAT_OPERATOR_SCRIPT.md` (O1–O8)  
**Flags:** `VITE_OCMS_CASE_STRIP_ENABLED=true`, `VITE_OCMS_UAT_TELEMETRY=true`

---

## Collection targets

| Target | Minimum | Actual | Status |
|--------|---------|--------|--------|
| Operators | 3–5 | **Pending** | NOT COLLECTED |
| Observed focus cases | 20–50 | **Pending** | NOT COLLECTED |

**Rule:** Do not fill Actual with estimates. Leave **Pending** until real sessions complete.

---

## Session record (repeat per operator session)

### Session metadata

| Field | Value |
|-------|-------|
| Operator ID / name | |
| Date | |
| Environment | staging / local |
| Strip flag | ON / OFF |

### Metrics export

Paste raw JSON from `copy(window.__OCMS_UAT_EXPORT__())`:

```json
(PASTE HERE — do not invent)
```

Parsed summary (optional — run in Node after session):

```bash
npx tsx -e "import { parseOcmsUatExportJson, formatOcmsEvidenceMetricsTable } from './src/modules/ocms/ocmsOperatorEvidenceParser.ts'; const r = parseOcmsUatExportJson(process.argv[1]); console.log(r.ok ? formatOcmsEvidenceMetricsTable(r.payload) : r);"
```

| Metric | Value |
|--------|-------|
| stripUsageRate | |
| collapseRate | |
| discoverySuccessRate | |
| relationClickRate | |
| diagnosticFrequency | |

---

## Qualitative evidence (per operator)

| Topic | Notes |
|-------|-------|
| Visibility usefulness | |
| Diagnostics usefulness | |
| Discovery usefulness | |
| Relation link usefulness | |
| Layout / below-fold impact | |
| Understanding vs task header alone | |
| Ignored elements | |
| Clicked elements | |
| Collapsed strip? | |
| Misunderstandings | |
| Suggested improvements | |

### Operator feedback prompts

| Question | Answer |
|----------|--------|
| What helped? | |
| What confused? | |
| What was ignored? | |
| Context helpfulness (1–5) | |

---

## Aggregated rollup (operator-maintained)

Fill only after ≥3 operator sessions with valid exports.

| Metric | Aggregate | Notes |
|--------|-----------|-------|
| stripUsageRate | **Pending** | |
| collapseRate | **Pending** | |
| discoverySuccessRate | **Pending** | |
| relationClickRate | **Pending** | |
| diagnosticFrequency | **Pending** | |

---

## Governance attestation

- [ ] No fake HO_SO / FINANCE data observed in strip
- [ ] Flag OFF verified zero DOM delta (O7)
- [ ] Right Panel unchanged (O8)
- [ ] No CASE_MAIN / write API introduced

**Signed by (operator lead):** _______________ **Date:** _______________

---

*Append sessions below. Do not delete prior rows.*
