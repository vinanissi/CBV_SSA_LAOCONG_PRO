# User–Task–Finance Mapping

**Purpose:** Define how USER_DIRECTORY integrates with TASK, FINANCE, and HO_SO modules. All user references use USER_DIRECTORY.ID (or email fallback for audit).

---

## 1. Field Mappings (USER_DIRECTORY.ID as Primary)

| Table | Field | Ref Target | Store | Validation GAS | Display |
|-------|-------|------------|-------|----------------|---------|
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | ID | assertActiveUserId | DISPLAY_NAME or FULL_NAME |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | ID | assertActiveUserId when set; default mapCurrentUserEmailToInternalId | DISPLAY_NAME or FULL_NAME |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | ID | mapCurrentUserEmailToInternalId | DISPLAY_NAME or FULL_NAME |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY (fallback: email) | ID or email | mapCurrentUserEmailToInternalId \|\| cbvUser | getUserDisplay(ACTOR_ID) |
| FINANCE_TRANSACTION | CONFIRMED_BY | USER_DIRECTORY | ID | mapCurrentUserEmailToInternalId | DISPLAY_NAME or FULL_NAME |
| FINANCE_LOG | ACTOR_ID | USER_DIRECTORY (fallback: email) | ID or email | mapCurrentUserEmailToInternalId \|\| cbvUser | getUserDisplay(ACTOR_ID) |
| ADMIN_AUDIT_LOG | ACTOR_ID | USER_DIRECTORY (fallback: email) | ID or email | mapCurrentUserEmailToInternalId \|\| cbvUser | getUserDisplay(ACTOR_ID) |
| HO_SO_MASTER | OWNER_ID | USER_DIRECTORY | ID | assertActiveUserId when provided | DISPLAY_NAME or FULL_NAME |

---

## 2. GAS Runtime Behavior

| Function | Purpose |
|----------|---------|
| assertActiveUserId(id, fieldName) | Validates OWNER_ID, REPORTER_ID before write |
| mapCurrentUserEmailToInternalId() | Maps Session.getActiveUser().getEmail() → USER_DIRECTORY.ID for DONE_BY, CONFIRMED_BY, ACTOR_ID |
| getUserDisplay(idOrEmail) | Resolves ACTOR_ID (ID or email) to display text for logs |

---

## 3. HO_SO and HTX

- **USER_DIRECTORY.HTX_ID** → HO_SO_MASTER.ID where HO_SO_TYPE=HTX
- **HO_SO_MASTER** remains a business-entity table; it is NOT a user store
- HO_SO_MASTER.OWNER_ID is optional and references USER_DIRECTORY when set

---

## 4. ACTOR_ID Fallback Policy

ACTOR_ID in TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG:

1. **Preferred:** Store USER_DIRECTORY.ID when current user is in USER_DIRECTORY
2. **Fallback:** Store Session.getActiveUser().getEmail() when user not in USER_DIRECTORY (preserves audit traceability)

Display code must handle both: `getUserDisplay(ACTOR_ID)` accepts ID or email.

---

## 5. Schema Summary

| Entity | User Fields | Notes |
|--------|-------------|-------|
| TASK_MAIN | OWNER_ID, REPORTER_ID | No ASSIGNEE_ID; OWNER_ID is assignee |
| TASK_UPDATE_LOG | ACTOR_ID | Text; can store ID or email |
| TASK_CHECKLIST | DONE_BY | Stores ID |
| FINANCE_TRANSACTION | CONFIRMED_BY | Stores ID |
| FINANCE_LOG | ACTOR_ID | Text; can store ID or email |
| ADMIN_AUDIT_LOG | ACTOR_ID | Text; can store ID or email |
| HO_SO_MASTER | OWNER_ID | Optional; stores ID |
