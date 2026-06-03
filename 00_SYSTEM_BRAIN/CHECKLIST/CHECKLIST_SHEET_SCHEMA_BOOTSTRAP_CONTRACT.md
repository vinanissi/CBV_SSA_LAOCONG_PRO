# Checklist Sheet Schema Bootstrap Contract

**Version:** 1.0  
**Phase:** `PHASE_CHECKLIST_09_SHEET_SCHEMA_BOOTSTRAP`  
**Status:** ACTIVE (bootstrap module; bridge/migration deferred)

---

## Purpose

Idempotent creation and validation of Google Sheet tabs and header rows for Checklist Runtime persistence per `ADR_CHECKLIST_SHEET_DRIVE_PERSISTENCE.md`.

**In scope:** tabs, headers, diagnostics, manual bootstrap entrypoints.  
**Out of scope:** Drive folders, file upload, FE→Sheet bridge, localStorage migration, row backfill.

---

## Logical tabs → physical sheets (CBV)

| Logical role | Physical tab | Bootstrap action |
|--------------|--------------|------------------|
| `CHECKLIST_ITEMS` | **`TASK_CHECKLIST`** | Extend headers only (no duplicate tab) |
| `CHECKLIST_FEEDBACK` | `CHECKLIST_FEEDBACK` | Create if missing |
| `CHECKLIST_ATTACHMENTS` | `CHECKLIST_ATTACHMENTS` | Create if missing |
| `CHECKLIST_LINKS` | `CHECKLIST_LINKS` | Create if missing |
| `CHECKLIST_HISTORY` | `CHECKLIST_HISTORY` | Create if missing |
| `CHECKLIST_TEMPLATES` | `CHECKLIST_TEMPLATES` | Create if missing |
| `CHECKLIST_TEMPLATE_ITEMS` | `CHECKLIST_TEMPLATE_ITEMS` | Create if missing |
| `CHECKLIST_LAYOUT_STATE` | `CHECKLIST_LAYOUT_STATE` | Create if missing |

---

## Header manifest (physical names)

Canonical manifest: `CBV_CHECKLIST_SHEET_SCHEMA_MANIFEST` in `05_GAS_RUNTIME/51_CHECKLIST_SHEET_SCHEMA_BOOTSTRAP.js` and TypeScript mirror `checklistSheetSchemaManifest.ts`.

### TASK_CHECKLIST (CHECKLIST_ITEMS role)

Existing columns preserved. Safe extensions (append-only at header row):

```text
SOURCE, SCHEMA_VERSION, IS_ARCHIVED
```

### Satellite tabs

Headers per phase 08 `CHECKLIST_SHEET_PERSISTENCE_CONTRACT.md` — uppercase `UPPER_SNAKE` in Sheet row 1.

---

## Bootstrap API

| Function | Behavior |
|----------|----------|
| `bootstrapChecklistSheetSchema(options)` | Idempotent create/extend; returns report object |
| `validateChecklistSheetSchema(options)` | Read-only validation; no writes |

**Options:** `spreadsheetId`, `dryRun`, `extendTaskChecklist` (default true).

**Spreadsheet resolution order:** `options.spreadsheetId` → `taskDbGetSpreadsheet_()` → `CBV_TASK_DB_ID`.

---

## Non-destructive rules

```text
MUST NOT: delete tabs, rename tabs, clear rows, delete columns, reorder existing columns when data exists
MAY: insertSheet for missing satellite tabs, append missing header cells at end of row 1 for TASK_CHECKLIST
MUST: report EXTRA_COLUMNS, MISSING_COLUMNS, UNSAFE conditions without auto-fixing destructive cases
```

---

## Append-only tabs (persistence policy)

When bridge is implemented (phase 11+):

```text
CHECKLIST_FEEDBACK — append rows only in v1
CHECKLIST_HISTORY — append rows only in v1
```

Bootstrap does not enforce row-level policy; documents intent only.

---

## Schema version

All new tabs and extended `TASK_CHECKLIST` columns use `SCHEMA_VERSION = 1` default in manifest; cell values populated on write path in phase 11+, not during bootstrap.

---

## Operator runbook (manual)

1. Open Task DB Apps Script project (`gas-runtime-api` or clasp push target).
2. Run `CBV_TCS_CHECKLIST_09_bootstrapSchemaDryRun()` — review report.
3. Run `CBV_TCS_CHECKLIST_09_bootstrapSchema()` on production Task DB.
4. Run `CBV_TCS_CHECKLIST_09_validateSchema()` — expect OK or documented warnings only.

---

## Related artifacts

- `CHECKLIST_SHEET_SCHEMA_BOOTSTRAP_AUTHORITY.md`
- `CHECKLIST_SHEET_SCHEMA_BOOTSTRAP_RUNTIME_NOTES.md`
- `CHECKLIST_SHEET_PERSISTENCE_CONTRACT.md`
- `90_BOOTSTRAP_SCHEMA.js` — `CBV_SCHEMA_MANIFEST` aligned entries
