# Checklist Sheet Schema Bootstrap Authority

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP`  
**Authority level:** Implementation (GAS bootstrap); not runtime write authority

---

## Who may change schema

| Actor | Permission |
|-------|------------|
| Phase 09+ GAS bootstrap (`bootstrapChecklistSheetSchema`) | Create missing satellite tabs; append safe `TASK_CHECKLIST` headers |
| `90_BOOTSTRAP_SCHEMA.js` manifest maintainers | Document canonical column order for new environments |
| Operators (manual) | Run test console functions after review |
| Workboard FE | **No** schema mutation in phase 09 |

---

## Source of truth after bootstrap

| Data class | SoT | Notes |
|------------|-----|-------|
| Checklist items | `TASK_CHECKLIST` | Already live via `49_WorkInboxChecklist.js` |
| Satellite runtime (02–07) | **localStorage** until phase 11 | Bootstrap prepares empty tabs only |
| Files | Drive (phase 10+) | Not in scope |

---

## TASK_CHECKLIST mapping authority

```text
Physical ID       → checklist_item_id
Physical TASK_ID  → task_id
Physical TITLE    → title
Physical ITEM_NO  → sort_order
Physical IS_DONE  → status (derived)
Physical IS_ARCHIVED → is_archived (after column present)
```

Do not introduce a second items tab named `CHECKLIST_ITEMS` while `TASK_CHECKLIST` is live.

---

## Validation authority

`validateChecklistSheetSchema` is the read-only gate before phase 10/11. Production bridge work should not start if validation reports `FAIL` for required headers on satellite tabs.

Warnings on `EXTRA_COLUMNS` or pre-existing `TASK_CHECKLIST` column order are acceptable.

---

## Diagnostics

| Suite | Command |
|-------|---------|
| Static contract | `npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistSheetSchemaBootstrapChecks.ts` |
| Live Sheet | `CBV_TCS_CHECKLIST_09_validateSchema()` in Task DB GAS |

---

## Deferred to later phases

- `PHASE_CHECKLIST_10_DRIVE_FOLDER_BOOTSTRAP`
- `PHASE_CHECKLIST_11_SHEET_DRIVE_BRIDGE_IMPLEMENTATION`
- `PHASE_CHECKLIST_12_LOCAL_RUNTIME_MIGRATION`
