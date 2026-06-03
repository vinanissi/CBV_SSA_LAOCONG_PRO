# PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Branch:** `phase/ocms-foundation-v1`  
**Verdict:** **GO**

---

## Delivered

- **Case Lifecycle Model** — 10 states, transitions, reopen/archive rules
- **ADR addendum** — `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md`
- Append updates to domain, CRM, result, case type catalog, roadmap v0.4
- **phase_tmp:** prior files in `archive_001/`; 12 current phase files at root

---

## Key files

| Role | Path |
|------|------|
| Lifecycle model | `OCMS/OCMS_CASE_LIFECYCLE_MODEL.md` |
| ADR | `002_DECISIONS/ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md` |
| Result relation | `OCMS/OCMS_RESULT_MODEL.md` §10 |

---

## Three-layer rule (carry forward)

1. **Task Status** — Work Item (`TASK_MAIN`)
2. **Case Lifecycle** — operational phase
3. **Case Result** — business outcome

Never collapse these in read model or UI without explicit ADR.

---

## OCMS_02 contract hints

```json
{
  "caseType": "HO_SO",
  "lifecycle": "REVIEW",
  "result": null,
  "taskStatus": "..."
}
```

---

## Next phase

`PHASE_OCMS_02_READ_MODEL_CONTRACT` or `PHASE_OCMS_01_CASE_KEY_CONVENTION`.

---

*Handoff — OCMS Case Lifecycle.*
