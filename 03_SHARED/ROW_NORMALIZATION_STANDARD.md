# Row Normalization Standard

## Purpose

Fully blank trailing rows (or interstitial blank rows) in Google Sheets must be ignored when reading data. Treating them as real records causes false audit errors (blank ROLE, STATUS, TASK_TYPE, ACTION, etc.). This standard centralizes blank-row detection and normalization in a shared layer so all downstream consumers benefit.

## Blank-Row Rule

**A row is ignored only if all meaningful business fields are blank.**

- A row with *any* meaningful data—even if incomplete—is a real row and must be audited.
- Audit-only fields (CREATED_AT, UPDATED_AT, IS_DELETED, CREATED_BY, UPDATED_BY) do **not** count as evidence of a real row.
- Partial rows (meaningful data present, required fields missing) are **kept** and must be flagged by audit.

## Shared Helpers

| Function | Description |
|----------|-------------|
| `isEffectivelyBlankRow(rowObj, meaningfulFields, options)` | Returns `true` if all meaningful fields are blank. |
| `filterRealDataRows(rowObjs, meaningfulFields, options)` | Drops rows where all meaningful fields are blank. |
| `getMeaningfulFieldsForTable(tableName, headers)` | Returns meaningful columns for a table; fallback = all non-audit columns. |
| `readNormalizedRows(sheet, tableName)` | Reads rows from sheet and returns only non-blank rows. |

## Meaningful Fields per Table

| Table | Meaningful Fields (examples) |
|-------|------------------------------|
| USER_DIRECTORY | ID, USER_CODE, FULL_NAME, EMAIL, ROLE, STATUS, HTX_ID, ... |
| TASK_MAIN | ID, TASK_CODE, TITLE, TASK_TYPE, STATUS, HTX_ID, ... |
| HO_SO_MASTER | ID, CODE, NAME, HO_SO_TYPE, STATUS, ... |
| FINANCE_TRANSACTION | ID, TRANS_CODE, AMOUNT, STATUS, ... |
| TASK_UPDATE_LOG | ID, TASK_ID, ACTION, CONTENT, ... |
| ADMIN_AUDIT_LOG | ID, ACTION, ENTITY_TYPE, ENTITY_ID, ... |
| ENUM_DICTIONARY | ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, ... |
| MASTER_CODE | ID, MASTER_GROUP, CODE, NAME, STATUS, ... |

Full mapping in `05_GAS_RUNTIME/03_SHARED_ROW_READER.gs` → `CBV_MEANINGFUL_FIELDS`.

## Consumers

| Consumer | Uses | Benefit |
|----------|------|---------|
| `_rows(sheet)` | `readNormalizedRows` | Repository reads exclude blank rows |
| `_auditGetRows(sheet)` | `readNormalizedRows` | Audit ignores fully blank rows |
| `_goldenAllRows(sheet)` | `readNormalizedRows` | Seed verification excludes blanks |

## Examples

### Fully blank row — ignored

```
Row: { ID: '', USER_CODE: '', FULL_NAME: '', ROLE: '', STATUS: '', CREATED_AT: '', ... }
→ isEffectivelyBlankRow → true
→ filterRealDataRows → row excluded
```

### Partial row — still audited

```
Row: { ID: 'USR_001', USER_CODE: 'u1', FULL_NAME: '', ROLE: '', STATUS: '' }
→ Has ID + USER_CODE (meaningful) → isEffectivelyBlankRow → false
→ Row kept; audit may flag blank ROLE, STATUS
```

### Audit-only fields — do not make row real

```
Row: { ID: '', USER_CODE: '', FULL_NAME: '', CREATED_AT: '2025-01-01', UPDATED_AT: '2025-01-02' }
→ All meaningful fields blank → isEffectivelyBlankRow → true
→ Row excluded (CREATED_AT/UPDATED_AT ignored)
```

## File

- **Implementation**: `05_GAS_RUNTIME/03_SHARED_ROW_READER.gs`
- **Load order**: After `02_USER_SERVICE.gs`, before `03_SHARED_REPOSITORY.gs` (`.clasp.json` filePushOrder)

## Related

- `09_AUDIT/BLANK_ROW_HANDLING_AUDIT.md` — audit findings and verification
