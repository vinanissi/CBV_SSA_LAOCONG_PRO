# PHASE_OCMS_02_READ_MODEL_CONTRACT — Handoff

**Status:** DOC-ONLY complete  
**Date:** 2026-05-31  
**Branch:** `phase/ocms-foundation-v1`  
**Verdict:** **GO**

---

## Delivered

- **`CaseReadModel`** contract (full schema)
- **Mapping** from AS-IS runtimes
- **3 P0 examples** (OPERATIONS, HO_SO, FINANCE)
- ADR: `ADR_OCMS_READ_MODEL_CONTRACT_ADDENDUM.md`
- Foundation doc set ready for **OCMS_03**

---

## Key files

| Role | Path |
|------|------|
| Contract | `OCMS/OCMS_READ_MODEL_CONTRACT.md` |
| Mapping | `OCMS/OCMS_READ_MODEL_MAPPING.md` |
| Examples | `OCMS/OCMS_READ_MODEL_EXAMPLES.md` |

---

## OCMS_03 implementation hints

1. Add FE hook `useCaseReadModel(taskId)` — derive client-side or call future Worker GET (not in this phase).
2. Strip fields: `title`, `caseType`, `lifecycle.label`, `relations[PRIMARY]`, `memorySummary.recent[0..2]`.
3. Feature flag: `OCMS_CASE_STRIP_ENABLED`.
4. Do **not** rename inbox task row to case.
5. Respect `permissions.canView` — hide strip if false.

---

## Three-layer reminder

- `workItems[].status` = task  
- `lifecycle` = case phase  
- `result` = business outcome  

---

## phase_tmp

Prior 13 files → `archive_003/`; 16 OCMS_02 files at root.

---

## Next phase

`PHASE_OCMS_03_FOCUS_CASE_CONTEXT_STRIP`

---

*Handoff — OCMS Read Model Contract.*
