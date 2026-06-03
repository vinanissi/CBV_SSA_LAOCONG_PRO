# Checklist Schema WebApp Bootstrap Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_09_SCHEMA_WEBAPP_BOOTSTRAP`  
**Status:** ACTIVE

---

## Purpose

Expose phase 09 schema bootstrap and schema validation through `gas-runtime-api` Web App action routing so operators can execute remotely via HTTP POST.

---

## Action contract

| Action | Route owner | Handler | Notes |
|--------|-------------|---------|-------|
| `checklist.schema.bootstrap` | Task DB action router (`wiOp` branch) | `CBV_TCS_CHECKLIST_09_bootstrapSchema()` (fallback `bootstrapChecklistSheetSchema({})`) | Write path, idempotent, non-destructive |
| `checklist.schema.validate` | Task DB action router (`wiOp` branch) | `CBV_TCS_CHECKLIST_09_validateSchema()` (fallback `validateChecklistSheetSchema({})`) | Read-only validation |

---

## Response shape

Responses use `taskDbBuildResponse_` envelope:

```json
{
  "ok": true,
  "code": "OK",
  "action": "checklist.schema.validate",
  "traceId": "...",
  "data": {
    "ok": true,
    "status": "GO",
    "missingTabs": [],
    "missingHeaders": [],
    "warnings": [],
    "checkedAt": "..."
  },
  "warnings": [],
  "errors": [],
  "status": "GO"
}
```

If schema is incomplete, `data.ok = false` and envelope `status` is `GO_WITH_WARNINGS` (or `FAIL` when runtime errors exist).

---

## Safety rules

- No sheet delete/rename/clear.
- No destructive migration.
- Only additive sheet/tab/header creation through existing phase 09 bootstrap runtime.
- Preserve existing routes: Drive bootstrap/validate, checklist CRUD, link/runtime actions, health actions.

---

## Related

- `CHECKLIST_SHEET_SCHEMA_BOOTSTRAP_CONTRACT.md`
- `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md`
- `gas-runtime-api/51_ChecklistSheetSchemaBootstrap.js`
- `gas-runtime-api/85_ChecklistSheetSchemaTestConsole.js`
