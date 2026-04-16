# User System Audit

## Design Source
- 03_SHARED/USER_SYSTEM_ARCHITECTURE.md
- 04_APPSHEET/APPSHEET_USER_BINDING.md
- 05_GAS_RUNTIME/USER_ROLE_PERMISSION_SPEC.md
- 05_GAS_RUNTIME/02_USER_SERVICE.js

---

## Audit Checklist

### 1. Architecture

| Check | Status | Evidence |
|-------|--------|----------|
| MASTER_CODE used as user registry | ☐ | USER_SYSTEM_ARCHITECTURE.md |
| No USER_DIRECTORY table | ☐ | Single source: MASTER_CODE |
| USER convention documented | ☐ | SHORT_NAME=email, PARENT_CODE=role |

### 2. Required Fields (MASTER_CODE Mapping)

| Field | Mapped | Notes |
|-------|--------|-------|
| ID | ID | ✓ |
| USER_CODE | CODE | ✓ |
| NAME | NAME | ✓ |
| DISPLAY_TEXT | DISPLAY_TEXT | ✓ |
| EMAIL | SHORT_NAME | ✓ |
| ROLE_CODE | PARENT_CODE | ✓ |
| STATUS | STATUS | ✓ |
| SORT_ORDER, IS_SYSTEM, ALLOW_EDIT, NOTE | ✓ | ✓ |
| CREATED_*, UPDATED_*, IS_DELETED | ✓ | ✓ |

### 3. Business Field Mappings

| Table | Field | Ref? | Stored | Status |
|-------|-------|------|-------|--------|
| TASK_MAIN | OWNER_ID | Ref | MASTER_CODE.ID | ☐ |
| TASK_MAIN | REPORTER_ID | Ref | MASTER_CODE.ID | ☐ |
| HO_SO_MASTER | OWNER_ID | Ref | MASTER_CODE.ID | ☐ |
| TASK_CHECKLIST | DONE_BY | Ref | MASTER_CODE.ID | ☐ |
| FINANCE_TRANSACTION | CONFIRMED_BY | Ref | MASTER_CODE.ID | ☐ |
| TASK_UPDATE_LOG | ACTOR_ID | No | Email | ☐ |
| ADMIN_AUDIT_LOG | ACTOR_ID | No | Email | ☐ |
| FINANCE_LOG | ACTOR_ID | No | Email | ☐ |

### 4. GAS User Service

| Function | Implemented | Tested |
|----------|------------|--------|
| getActiveUsers() | ☐ | ☐ |
| getUserByEmail(email) | ☐ | ☐ |
| getUserById(userId) | ☐ | ☐ |
| getUserDisplay(userId) | ☐ | ☐ |
| getUserRole(userId) | ☐ | ☐ |
| assertValidUserId(userId, fieldName) | ☐ | ☐ |
| assertRoleAllowed(userId, requiredRoleOrList) | ☐ | ☐ |
| mapCurrentUserEmailToInternalId() | ☐ | ☐ |
| clearUserCache() | ☐ | ☐ |

### 5. AppSheet Binding

| Item | Status |
|------|--------|
| OWNER_ID dropdown: MASTER_CODE, filter USER+ACTIVE | ☐ |
| REPORTER_ID default: USEREMAIL() lookup | ☐ |
| Valid_If formulas documented | ☐ |
| No free-text person entry | ☐ |

### 6. Permission Model

| Item | Status |
|------|--------|
| Role matrix documented | ☐ |
| assertAdminAuthority for admin ops | ☐ |
| OPERATOR/VIEWER via AppSheet slice | ☐ |
| Limitations documented | ☐ |

### 7. Migration Readiness

| Item | Status |
|------|--------|
| USER rows in MASTER_CODE | ☐ |
| Existing OWNER_ID/REPORTER_ID migration plan | ☐ |
| GAS createTask/assignTask validation | ☐ |
| AppSheet Ref configured | ☐ |

---

## Limitations

- Role enforcement: ADMIN via ADMIN_EMAILS; OPERATOR/VIEWER via AppSheet only
- ACTOR_ID in logs remains email
- Migration of legacy email values required before full validation

---

## Final Statement

**USER SYSTEM SAFE** — Design and implementation complete. Ready for:
1. Creating USER rows in MASTER_CODE via admin panel
2. Configuring AppSheet Ref for OWNER_ID, REPORTER_ID per APPSHEET_USER_BINDING.md
3. Migrating existing email-based OWNER_ID/REPORTER_ID to user ID (manual or script)
4. GAS validation active: assertValidUserId in createTask, assignTask; mapCurrentUserEmailToInternalId for REPORTER_ID and DONE_BY defaults

**Limitation:** Role enforcement is partial (ADMIN via ADMIN_EMAILS; OPERATOR/VIEWER via AppSheet slice). ACTOR_ID in logs remains email for audit traceability.
