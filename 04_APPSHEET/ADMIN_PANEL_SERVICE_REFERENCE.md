# Admin Panel Service Reference

## Files Created

| File | Purpose |
|------|---------|
| 01_ENUM_ADMIN_SERVICE.js | ENUM_DICTIONARY admin CRUD |
| 02_MASTER_CODE_ADMIN_SERVICE.js | MASTER_CODE admin CRUD |
| 03_ADMIN_AUDIT_SERVICE.js | logAdminAction alias, contract docs |

## Public Admin Functions

### Enum (01_ENUM_ADMIN_SERVICE.js)

| Function | Description |
|----------|-------------|
| adminCreateEnumRow(data) | Create enum row. data: ENUM_GROUP, ENUM_VALUE, DISPLAY_TEXT?, SORT_ORDER?, NOTE? |
| adminUpdateEnumRow(id, patch) | Update DISPLAY_TEXT, SORT_ORDER, NOTE |
| adminSetEnumActive(id, isActive) | Set IS_ACTIVE true/false |

### Master Code (02_MASTER_CODE_ADMIN_SERVICE.js)

| Function | Description |
|----------|-------------|
| adminCreateMasterCodeRow(data) | Create row. data: MASTER_GROUP, CODE, NAME, DISPLAY_TEXT?, SHORT_NAME?, PARENT_CODE?, STATUS?, SORT_ORDER?, NOTE? |
| adminUpdateMasterCodeRow(id, patch) | Update NAME, DISPLAY_TEXT, SHORT_NAME, NOTE, SORT_ORDER (only when ALLOW_EDIT=TRUE, !IS_SYSTEM) |
| adminSetMasterCodeStatus(id, status) | Set STATUS: ACTIVE, INACTIVE, ARCHIVED |

### Audit (03_SHARED_LOGGER.js / 03_ADMIN_AUDIT_SERVICE.js)

| Function | Description |
|----------|-------------|
| logAdminAudit(auditType, entityType, entityId, action, beforeObj, afterObj, note) | Append to ADMIN_AUDIT_LOG |
| logAdminAction(...) | Alias for logAdminAudit |

## Authority Check

- **assertAdminAuthority()** — Called at entry of every admin function. Throws if cbvUser() not in CBV_CONFIG.ADMIN_EMAILS.
- **Required:** Add admin email(s) to `CBV_CONFIG.ADMIN_EMAILS` in 00_CORE_CONFIG.js before using admin panel.
- See 00_META/CBV_ADMIN_GOVERNANCE_STANDARD.md.

## Protection Rules Enforced

| Rule | Implementation |
|------|-----------------|
| No direct unsafe writes | All writes go through admin service functions |
| Validate before write | ensureRequired, cbvAssert, assertValidEnumValue |
| Audit every admin change | logAdminAudit called after each mutating op |
| Preserve display labels | Patch only allowed columns; DISPLAY_TEXT optional on create |
| Prevent duplicate enum | _adminEnumExists blocks (ENUM_GROUP, ENUM_VALUE) |
| Prevent duplicate master code | _adminMasterCodeExists blocks (MASTER_GROUP, CODE) |
| Respect IS_SYSTEM | adminUpdateMasterCodeRow rejects IS_SYSTEM rows |
| Respect ALLOW_EDIT | adminUpdateMasterCodeRow rejects ALLOW_EDIT=false |

## Audit Logging Flow

```
Admin op (e.g. adminUpdateEnumRow)
  → validate
  → perform write (_updateRow, _appendRecord)
  → clear cache (clearEnumCache / clearMasterCodeCache)
  → logAdminAudit(AUDIT_TYPE, ENTITY_TYPE, id, ACTION, before, after, note)
  → return cbvResponse
```

## Role Management Limitations

- **No adminAssignRole:** Role assignment is AppSheet-managed (Account list, slice filters).
- **No USER_ROLE sheet:** No in-sheet role mapping exists.
- **ROLE enum:** ADMIN, OPERATOR, VIEWER values are in ENUM_DICTIONARY and can be managed via adminCreateEnumRow / adminUpdateEnumRow (e.g. display text) — but assignment is external.
