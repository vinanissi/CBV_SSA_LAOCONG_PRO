# AppSheet Admin Panel Master — CBV_SSA_LAOCONG_PRO

Admin tables, views, restrictions, audit log, operational checklist.

---

## Admin Tables

| Table | Key | Label | Mutations |
|-------|-----|-------|-----------|
| ENUM_DICTIONARY | ID | ENUM_VALUE | GAS only |
| MASTER_CODE | ID | NAME | GAS only |
| ADMIN_AUDIT_LOG | ID | ACTION | Read-only (GAS appends) |

---

## ADMIN_AUDIT_LOG

**Operationally read-only.** No add/edit/delete in AppSheet. GAS appends via logAdminAudit().

Columns: ID, AUDIT_TYPE, ENTITY_TYPE, ENTITY_ID, ACTION, BEFORE_JSON, AFTER_JSON, NOTE, ACTOR_ID, CREATED_AT

---

## Admin Views

| View | Type | Purpose |
|------|------|---------|
| ENUM_LIST, ENUM_DETAIL, ENUM_FORM | Table, Detail, Form | Enum management |
| MASTER_CODE_LIST, MASTER_CODE_DETAIL, MASTER_CODE_FORM | Table, Detail, Form | Master code management |
| ADMIN_AUDIT_LOG_LIST, ADMIN_AUDIT_LOG_DETAIL | Table, Detail | Read-only audit |

**No inline add** for ADMIN_AUDIT_LOG. All enum/master writes via GAS actions.

---

## Admin-Only Restrictions

- **Separate app** recommended; share only with ADMIN_EMAILS
- ADMIN_EMAILS must be configured in 00_CORE_CONFIG.js
- assertAdminAuthority() in every admin GAS function

---

## Callable Admin Functions

| Function | Use |
|----------|-----|
| adminCreateEnumRow(data) | Create enum row |
| adminUpdateEnumRow(id, patch) | Update DISPLAY_TEXT, SORT_ORDER, NOTE |
| adminSetEnumActive(id, isActive) | Activate/inactivate enum |
| adminCreateMasterCodeRow(data) | Create master code row |
| adminUpdateMasterCodeRow(id, patch) | Update NAME, DISPLAY_TEXT, etc. |
| adminSetMasterCodeStatus(id, status) | Set STATUS |

---

## Operational Checklist

**Before first use:**
- [ ] ADMIN_EMAILS configured
- [ ] initAll() run
- [ ] Admin Panel app created, shared only with admins
- [ ] No inline add/edit for ENUM or MASTER_CODE — GAS actions only
- [ ] ADMIN_AUDIT_LOG views read-only

**Ongoing:**
- [ ] Keep ADMIN_EMAILS minimal
- [ ] Do not inline-edit ENUM_DICTIONARY or MASTER_CODE in Sheets
- [ ] IS_SYSTEM rows: hide Edit/Status
- [ ] ALLOW_EDIT=FALSE rows: hide Edit/Status

---

## What Admin Can and Cannot Do

**Can:** Create/update enum rows, master codes; activate/inactivate; view audit log  
**Cannot:** Inline edit in AppSheet; assign roles (AppSheet Account list); edit ADMIN_AUDIT_LOG
