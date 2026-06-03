# Task Key Contract (Locked)

**Status:** LOCKED — `PHASE_DATA_REL_01_TASK_KEY_CONTRACT`  
**Authority:** `01_SCHEMA/TASK_MAIN_SCHEMA.md`, `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md`  
**Audit:** `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`

---

## Physical keys (workbook)

| Role | Table | Physical column | Notes |
|------|-------|-----------------|-------|
| Parent PK | `TASK_MAIN` | **`ID`** | e.g. `TASK-mpwr16qj-CNBT` — **not** `TASK_MAIN.TASK_ID` |
| Display code | `TASK_MAIN` | `TASK_CODE` | Human/business code; not a FK target |
| Child FK | `TASK_CHECKLIST`, `TASK_ATTACHMENT`, `TASK_UPDATE_LOG`, checklist satellites | **`TASK_ID`** | Value **must equal** `TASK_MAIN.ID` |

There is **no** physical column `TASK_MAIN.TASK_ID` in the current schema manifest (`gas-runtime-api/31_TaskDbSchemaMap.js`, `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js`). Do not add one without a dedicated migration phase.

---

## Runtime / DTO naming

| Layer | Name | Maps to |
|-------|------|---------|
| Google Sheet row | `TASK_MAIN.ID` | Physical PK |
| GAS / Worker / FE DTO | `taskId` | **`TASK_MAIN.ID`** (same value) |
| AppSheet child ref | `[TASK_ID]` | Parent key = `[TASK_MAIN].[ID]` |

---

## Child tables (FK target = `TASK_MAIN.ID`)

| Child table | FK column | Parent key |
|-------------|-----------|------------|
| `TASK_CHECKLIST` | `TASK_ID` | `TASK_MAIN.ID` |
| `TASK_ATTACHMENT` | `TASK_ID` | `TASK_MAIN.ID` |
| `TASK_UPDATE_LOG` | `TASK_ID` | `TASK_MAIN.ID` |
| `CHECKLIST_FEEDBACK` | `TASK_ID` | `TASK_MAIN.ID` |
| `CHECKLIST_ATTACHMENTS` | `TASK_ID` | `TASK_MAIN.ID` |
| `CHECKLIST_LINKS` | `TASK_ID` | `TASK_MAIN.ID` |
| `CHECKLIST_HISTORY` | `TASK_ID` | `TASK_MAIN.ID` |
| `CHECKLIST_LAYOUT_STATE` | `TASK_ID` | `TASK_MAIN.ID` |

AppSheet filters: `[TASK_ID] = [TASK_MAIN].[ID]`.

---

## GAS runtime (source of truth)

- `taskDbMakeId_('TASK')` → writes `TASK_MAIN.ID`
- `taskDbMapTaskSummaryRow_` → `taskId: String(rec.ID || '')`
- Child writes use `TASK_ID` column on child sheets only

---

## Out of scope (this contract)

- Renaming `ID` → `TASK_ID` on `TASK_MAIN`
- Adding duplicate `TASK_MAIN.TASK_ID` column
- User / finance / HO_SO FK cleanup (later phases)

---

## Related authority

| Topic | Document |
|-------|----------|
| Index | [DATA_REL_AUTHORITY_INDEX.md](./DATA_REL_AUTHORITY_INDEX.md) |
| Schema manifest | `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` |
| FK audit map | `05_GAS_RUNTIME/90_BOOTSTRAP_AUDIT_SCHEMA.js` |
| User refs | [USER_TASK_FINANCE_MAPPING.md](./USER_TASK_FINANCE_MAPPING.md) |
| HO_SO relations | [ADR_HO_SO_RELATION_AUTHORITY.md](../00_SYSTEM_BRAIN/002_DECISIONS/ADR_HO_SO_RELATION_AUTHORITY.md) |
