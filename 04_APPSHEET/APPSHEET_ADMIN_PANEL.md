# AppSheet Admin Panel Phase 1 Configuration Plan

## Design Source

- 04_APPSHEET/ADMIN_PANEL_DATA_MODEL.md
- 04_APPSHEET/ADMIN_PANEL_SERVICE_REFERENCE.md
- 05_GAS_RUNTIME/01_ENUM_ADMIN_SERVICE.gs, 02_MASTER_CODE_ADMIN_SERVICE.gs

---

## 1. Table Configuration Summary

| Table | Key | Label | Purpose | Mutations via |
|-------|-----|-------|---------|---------------|
| ENUM_DICTIONARY | ID | ENUM_VALUE | Workflow enums + ROLE | GAS actions only |
| MASTER_CODE | ID | NAME | Dynamic business codes | GAS actions only |
| ADMIN_AUDIT_LOG | ID | ACTION | Audit trail | Read-only |
| — | — | — | USER_DIRECTORY | Not present; role assignment via AppSheet Account list |

### Table Details

**ENUM_DICTIONARY**
- Columns: ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY
- Source: Google Sheets
- Create/update/activate: via GAS `adminCreateEnumRow`, `adminUpdateEnumRow`, `adminSetEnumActive`

**MASTER_CODE**
- Columns: ID, MASTER_GROUP, CODE, NAME, DISPLAY_TEXT, SHORT_NAME, PARENT_CODE, STATUS, SORT_ORDER, IS_SYSTEM, ALLOW_EDIT, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY, IS_DELETED
- Source: Google Sheets
- Create/update/status: via GAS `adminCreateMasterCodeRow`, `adminUpdateMasterCodeRow`, `adminSetMasterCodeStatus`

**ADMIN_AUDIT_LOG**
- Columns: ID, AUDIT_TYPE, ENTITY_TYPE, ENTITY_ID, ACTION, BEFORE_JSON, AFTER_JSON, NOTE, ACTOR_ID, CREATED_AT
- Source: Google Sheets
- Mutations: none (append-only; GAS appends)

---

## 2. View List

### ENUM

| View | Type | Slice | Purpose |
|------|------|-------|---------|
| ENUM_LIST | Table | ENUM_ALL | List all enum rows; group filter optional |
| ENUM_DETAIL | Detail | ENUM_ALL | View single row; actions for edit/activate/inactivate |
| ENUM_FORM | Form | — | Add new enum row; submits via GAS action |

### MASTER_CODE

| View | Type | Slice | Purpose |
|------|------|-------|---------|
| MASTER_CODE_LIST | Table | MC_ALL | List all; filter by MASTER_GROUP. Use MC_ALL so IS_SYSTEM rows are visible. |
| MASTER_CODE_DETAIL | Detail | MC_ALL | View single row; actions for edit/status |
| MASTER_CODE_FORM | Form | — | Add new master code; submits via GAS action |

### AUDIT

| View | Type | Slice | Purpose |
|------|------|-------|---------|
| ADMIN_AUDIT_LOG_LIST | Table | AAL_ALL | Read-only list; sort by CREATED_AT desc |
| ADMIN_AUDIT_LOG_DETAIL | Detail | AAL_ALL | Read-only detail |

### ROLE (via ENUM_DICTIONARY)

| View | Type | Slice | Purpose |
|------|------|-------|---------|
| ROLE_LIST | Table | ENUM_ROLE | `ENUM_GROUP = "ROLE"` — display ROLE values only |
| ROLE_DETAIL | Detail | ENUM_ROLE | View ROLE enum row; edit DISPLAY_TEXT via GAS |

**Note:** Role assignment (who has ADMIN/OPERATOR/VIEWER) is AppSheet Account list. ROLE_LIST/ROLE_DETAIL show the ROLE enum values (ADMIN, OPERATOR, VIEWER) from ENUM_DICTIONARY for display-text management only.

---

## 3. Slice Definitions

| Slice | Condition | Use |
|-------|-----------|-----|
| ENUM_ALL | `TRUE` | All enum rows |
| ENUM_ACTIVE | `[IS_ACTIVE] = TRUE` | Active only |
| ENUM_BY_GROUP | `[ENUM_GROUP] = "[param]"` | Filter by group |
| ENUM_ROLE | `[ENUM_GROUP] = "ROLE"` | ROLE values only |
| MC_ALL | `[IS_DELETED] = FALSE` | All non-deleted |
| MC_EDITABLE | `[IS_DELETED] = FALSE AND [IS_SYSTEM] = FALSE AND [ALLOW_EDIT] = TRUE` | Editable rows only |
| MC_BY_GROUP | `[MASTER_GROUP] = "[param]" AND [IS_DELETED] = FALSE` | Filter by group |
| AAL_ALL | `TRUE` | All audit rows |

---

## 4. Editable / Non-Editable Field Rules

### ENUM_DICTIONARY

| Field | Editable | Rule |
|-------|----------|------|
| ID | No | Never; system-generated |
| ENUM_GROUP | No | Create-time only; identity |
| ENUM_VALUE | No | Create-time only; identity |
| DISPLAY_TEXT | Yes | Via GAS action `adminUpdateEnumRow` |
| SORT_ORDER | Yes | Via GAS action `adminUpdateEnumRow` |
| IS_ACTIVE | Yes | Via GAS action `adminSetEnumActive` (not inline) |
| NOTE | Yes | Via GAS action `adminUpdateEnumRow` |
| CREATED_AT, CREATED_BY | No | Audit |
| UPDATED_AT, UPDATED_BY | No | Audit |

### MASTER_CODE

| Field | Editable | Rule |
|-------|----------|------|
| ID | No | Never |
| MASTER_GROUP | No | Create-time only |
| CODE | No | Create-time only |
| NAME | Yes | Via GAS when ALLOW_EDIT=TRUE, !IS_SYSTEM |
| DISPLAY_TEXT | Yes | Via GAS when ALLOW_EDIT=TRUE, !IS_SYSTEM |
| SHORT_NAME | Yes | Via GAS when ALLOW_EDIT=TRUE, !IS_SYSTEM |
| PARENT_CODE | No | Phase 1: not exposed for edit |
| STATUS | Yes | Via GAS action `adminSetMasterCodeStatus` (not inline) |
| SORT_ORDER | Yes | Via GAS |
| IS_SYSTEM | No | System flag; read-only |
| ALLOW_EDIT | No | System flag; read-only |
| NOTE | Yes | Via GAS |
| CREATED_AT, CREATED_BY | No | Audit |
| UPDATED_AT, UPDATED_BY | No | Audit |
| IS_DELETED | No | Soft delete; not exposed |

### ADMIN_AUDIT_LOG

| Field | Editable | Rule |
|-------|----------|------|
| All | No | Read-only table |

---

## 5. IS_SYSTEM / ALLOW_EDIT Visual Protection

| Condition | UI Behavior |
|-----------|-------------|
| MASTER_CODE.IS_SYSTEM = TRUE | Show in list/detail; hide Edit and Status actions; show badge "System" |
| MASTER_CODE.ALLOW_EDIT = FALSE | Show in list/detail; hide Edit and Status actions (GAS rejects both) |
| MASTER_CODE.IS_SYSTEM = TRUE | Status change action hidden or disabled |

**Implementation:** Use AppSheet Column visibility or Ref display to show `IS_SYSTEM` / `ALLOW_EDIT`. Action visibility: `AND([IS_SYSTEM] = FALSE, [ALLOW_EDIT] = TRUE)` for edit; `AND([IS_SYSTEM] = FALSE, [ALLOW_EDIT] = TRUE)` for status change.

---

## 6. STATUS / IS_ACTIVE / DISPLAY_TEXT Control

| Field | Control |
|-------|---------|
| ENUM_DICTIONARY.IS_ACTIVE | Change via GAS action only (`adminSetEnumActive`). No inline toggle. |
| MASTER_CODE.STATUS | Change via GAS action only (`adminSetMasterCodeStatus`). No inline dropdown. |
| DISPLAY_TEXT | Change via GAS action only. No inline edit in table/detail; use form or action that invokes GAS. |

**Rule:** Do not enable direct (inline) edit of IS_ACTIVE or STATUS. Use buttons that invoke GAS.

---

## 7. AppSheet Actions (GAS-Backed)

### ENUM

| Action | Condition | GAS Function |
|--------|-----------|--------------|
| ACT_ENUM_CREATE | Form submit | adminCreateEnumRow(data) |
| ACT_ENUM_UPDATE | Row selected | adminUpdateEnumRow(id, patch) |
| ACT_ENUM_ACTIVATE | Row selected, IS_ACTIVE=FALSE | adminSetEnumActive(id, true) |
| ACT_ENUM_DEACTIVATE | Row selected, IS_ACTIVE=TRUE | adminSetEnumActive(id, false) |

### MASTER_CODE

| Action | Condition | GAS Function |
|--------|-----------|--------------|
| ACT_MC_CREATE | Form submit | adminCreateMasterCodeRow(data) |
| ACT_MC_UPDATE | Row selected, !IS_SYSTEM, ALLOW_EDIT | adminUpdateMasterCodeRow(id, patch) |
| ACT_MC_ACTIVATE | Row selected, STATUS≠ACTIVE, !IS_SYSTEM, ALLOW_EDIT | adminSetMasterCodeStatus(id, "ACTIVE") |
| ACT_MC_DEACTIVATE | Row selected, STATUS=ACTIVE, !IS_SYSTEM, ALLOW_EDIT | adminSetMasterCodeStatus(id, "INACTIVE") |
| ACT_MC_ARCHIVE | Row selected, !IS_SYSTEM, ALLOW_EDIT | adminSetMasterCodeStatus(id, "ARCHIVED") |

---

## 8. Valid_If and Allow Other Values

- **ENUM_GROUP (in ENUM_FORM):** List from existing ENUM_DICTIONARY ENUM_GROUP values. Do NOT enable "Allow other values."
- **ENUM_VALUE:** Free text; GAS validates no duplicate (ENUM_GROUP, ENUM_VALUE).
- **MASTER_GROUP (in MASTER_CODE_FORM):** Free text or list of known groups. GAS validates.
- **STATUS (MASTER_CODE):** Valid_If = SELECT from ENUM_DICTIONARY where ENUM_GROUP="MASTER_CODE_STATUS". Do NOT enable "Allow other values."

---

## 9. Key / Label Config

| Table | Key | Label | List Display |
|-------|-----|-------|--------------|
| ENUM_DICTIONARY | ID | ENUM_VALUE | CONCATENATE([ENUM_GROUP], " / ", [ENUM_VALUE]) or ENUM_VALUE |
| MASTER_CODE | ID | NAME | DISPLAY_TEXT or NAME |
| ADMIN_AUDIT_LOG | ID | ACTION | CONCATENATE([AUDIT_TYPE], " ", [ACTION], " ", FORMAT([CREATED_AT])) |

---

## 10. Phase 1 Limitations

| Limitation | Mitigation |
|------------|------------|
| No USER_DIRECTORY / USER_ROLE table | Role assignment via AppSheet Account list |
| ROLE_LIST/ROLE_DETAIL show enum values only | Assignment done in AppSheet Accounts |
| All admin writes must go through GAS | Use Actions; no inline add/edit for sensitive fields |
| PARENT_CODE not editable in Phase 1 | Add in Phase 2 if hierarchy needed |
| No bulk import UI | Use GAS script or manual seed |
| Admin panel visible only to ADMIN role | Restrict via AppSheet app access / slice by role |
