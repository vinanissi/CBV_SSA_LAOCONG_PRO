# Phase Charter — PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL

---

## PHASE

`PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL`

---

## LOAD

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

| Category | Path |
|----------|------|
| Prior phase report | `PHASE_OCMS_00_DESIGN_AUTHORITY_REPORT.md` |
| ADR | `ADR_OCMS_FOUNDATION.md` (read-only baseline) |
| Domain | `OCMS_DOMAIN_MODEL.md`, `OCMS_ROADMAP.md` |
| Runtime state | `003_RUNTIME_STATE.md` |

---

## REPORTS

| Role | Path |
|------|------|
| Output report | `000_REPORTS/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_REPORT.md` |

---

## ADR

| Action | Path |
|--------|------|
| Required? | YES (addendum) |
| Output ADR | `002_DECISIONS/ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md` |
| Must not override | `ADR_OCMS_FOUNDATION.md` |

---

## HANDOFF

| Role | Path |
|------|------|
| Output handoff | `001_HANDOFF/PHASE_OCMS_00A_CASE_RESPONSIBILITY_MEMORY_MODEL_HANDOFF.md` |

---

## MODE

- [x] `DOC-ONLY`

---

## OUTPUT

- [x] ADR addendum (CRM)
- [x] `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`
- [x] Roadmap append
- [x] REPORT
- [x] HANDOFF
- [x] TEST_EVIDENCE

---

## SUCCESS CRITERIA

Exit: **GO**

1. CRM triad documented and binding for future OCMS phases.
2. No code in apps/workers/gas-runtime-api.
3. No schema, API, UI, `CASE_MAIN`.
4. Work Inbox V3 unchanged.

---

## NEXT PHASE

`PHASE_OCMS_01_CASE_KEY_CONVENTION`

---

*Phase charter — OCMS CRM foundation.*
