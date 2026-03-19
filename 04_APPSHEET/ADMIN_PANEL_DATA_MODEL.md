# Admin Panel Data Model

## 1. Final Data Model for Admin Panel Support

### Tables / Sheets

| Sheet | Purpose | Status |
|-------|---------|--------|
| ENUM_DICTIONARY | Locked workflow enums + ROLE | Existing; ROLE added to seed |
| MASTER_CODE | Dynamic business codes | Existing |
| ADMIN_AUDIT_LOG | Audit trail for admin operations | **New** |
| USER_ROLE | (Optional) Email → Role assignment | Not created; see Role Source |

### ENUM_DICTIONARY

- **Existing.** Columns: ID, ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT, SORT_ORDER, IS_ACTIVE, NOTE, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY
- **ROLE group:** ADMIN, OPERATOR, VIEWER — added to seed for consistency with CBV_ENUM.ROLE
- Admin ops: create row, update row, activate/inactivate (IS_ACTIVE)

### MASTER_CODE

- **Existing.** Columns per MASTER_CODE_SCHEMA.md
- Admin ops: create row, update row, activate/inactivate (STATUS), adjust DISPLAY_TEXT (when ALLOW_EDIT=TRUE)

### ADMIN_AUDIT_LOG (New)

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ID | Text | Yes | AAL_YYYYMMDD_xxxxx |
| AUDIT_TYPE | Text | Yes | ENUM_EDIT, MASTER_CODE_EDIT, ROLE_ASSIGN, etc. |
| ENTITY_TYPE | Text | Yes | ENUM_DICTIONARY, MASTER_CODE, USER_ROLE |
| ENTITY_ID | Text | No | Row ID when applicable |
| ACTION | Text | Yes | CREATE, UPDATE, ACTIVATE, INACTIVATE |
| BEFORE_JSON | Text | No | Snapshot before change |
| AFTER_JSON | Text | No | Snapshot after change |
| NOTE | Text | No | Optional note |
| ACTOR_ID | Text | Yes | cbvUser() — email or system |
| CREATED_AT | Datetime | Yes | |

---

## 2. Role Source Clarification

**Current state:**
- ROLE values: ADMIN, OPERATOR, VIEWER — defined in CBV_ENUM.ROLE (00_CORE_CONSTANTS.gs)
- Role assignment: AppSheet-side (Account list, slice filters). No in-sheet mapping.
- No USER_DIRECTORY or USER_ROLE sheet exists.

**Safe admin path:**
1. Add ROLE to ENUM_DICTIONARY via seed — admin can manage ROLE values like other enums
2. Role assignment stays AppSheet-managed (Account list + security filters)
3. If in-sheet role assignment is needed later: add USER_ROLE (EMAIL, ROLE, STATUS) — design reserved but not implemented to avoid conflict

---

## 3. Audit Log Strategy

### When to write ADMIN_AUDIT_LOG

| Operation | AUDIT_TYPE | ENTITY_TYPE | ENTITY_ID | ACTION |
|-----------|------------|-------------|-----------|--------|
| create enum row | ENUM_EDIT | ENUM_DICTIONARY | new ID | CREATE |
| update enum row | ENUM_EDIT | ENUM_DICTIONARY | row ID | UPDATE |
| activate/inactivate enum | ENUM_EDIT | ENUM_DICTIONARY | row ID | ACTIVATE / INACTIVATE |
| create master code row | MASTER_CODE_EDIT | MASTER_CODE | new ID | CREATE |
| update master code row | MASTER_CODE_EDIT | MASTER_CODE | row ID | UPDATE |
| activate/inactivate master code | MASTER_CODE_EDIT | MASTER_CODE | row ID | ACTIVATE / INACTIVATE |
| adjust display text | ENUM_EDIT or MASTER_CODE_EDIT | — | row ID | UPDATE |

### Log helper contract

```
logAdminAudit(auditType, entityType, entityId, action, beforeObj, afterObj, note)
```

- **Implemented:** 05_GAS_RUNTIME/03_SHARED_LOGGER.gs — appends to ADMIN_AUDIT_LOG via _appendRecord
- Called by admin service layer after each mutating operation
- BEFORE_JSON / AFTER_JSON: JSON.stringify of record snapshots (redact secrets if any)

---

## 4. Admin Operations → Service Contracts (Implemented)

| Operation | Service function | File | Validation |
|-----------|------------------|------|------------|
| create enum row | adminCreateEnumRow(data) | 01_ENUM_ADMIN_SERVICE.gs | allowed enum group, no duplicate (ENUM_GROUP, ENUM_VALUE) |
| update enum row | adminUpdateEnumRow(id, patch) | 01_ENUM_ADMIN_SERVICE.gs | row exists, patch DISPLAY_TEXT, SORT_ORDER, NOTE only |
| activate/inactivate enum | adminSetEnumActive(id, isActive) | 01_ENUM_ADMIN_SERVICE.gs | row exists |
| create master code row | adminCreateMasterCodeRow(data) | 02_MASTER_CODE_ADMIN_SERVICE.gs | no duplicate (MASTER_GROUP, CODE), STATUS in MASTER_CODE_STATUS |
| update master code row | adminUpdateMasterCodeRow(id, patch) | 02_MASTER_CODE_ADMIN_SERVICE.gs | row exists, !IS_SYSTEM, ALLOW_EDIT=TRUE |
| activate/inactivate master code | adminSetMasterCodeStatus(id, status) | 02_MASTER_CODE_ADMIN_SERVICE.gs | row exists, status in MASTER_CODE_STATUS |
| adjust display text | via adminUpdateEnumRow / adminUpdateMasterCodeRow (DISPLAY_TEXT in patch) | — | — |
| log admin action | logAdminAudit / logAdminAction | 03_SHARED_LOGGER.gs, 03_ADMIN_AUDIT_SERVICE.gs | — |

---

## 5. Bootstrap Additions

- ADMIN_AUDIT_LOG added to schema_manifest, config, initCoreSheets
- ROLE rows added to ENUM_SEED_SPEC
