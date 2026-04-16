# CBV User / Role / Permission Spec

## Role Model

| Role | Source | Enforcement |
|------|--------|-------------|
| ADMIN | ADMIN_EMAILS (00_CORE_CONFIG.js) + AppSheet Accounts | assertAdminAuthority(), AppSheet slice |
| OPERATOR | AppSheet Accounts | AppSheet slice |
| VIEWER | AppSheet Accounts | AppSheet slice |

**ENUM_DICTIONARY (ROLE):** ADMIN, OPERATOR, VIEWER — for display and consistency.

**USER_DIRECTORY.ROLE:** Stores role per user. Used for display and optional GAS checks.

---

## GAS Helper Functions

| Function | Purpose |
|----------|---------|
| getActiveUsers() | Returns active USER rows |
| getUserByEmail(email) | Lookup by email |
| getUserById(userId) | Lookup by ID or CODE |
| getUserDisplay(userId) | Display name |
| getUserRole(userId) | Role string |
| assertValidUserId(userId, fieldName) | Throws if invalid |
| assertRoleAllowed(userId, requiredRoleOrList) | Throws if role not allowed |
| mapCurrentUserEmailToInternalId() | Current user → USER_DIRECTORY.ID |

---

## Permission Matrix (Small-Scale)

| Action | ADMIN | OPERATOR | VIEWER |
|--------|-------|----------|--------|
| View admin tables (ENUM, USER_DIRECTORY, MASTER_CODE) | ✓ | ✗ | ✗ |
| Edit ENUM_DICTIONARY | ✓ | ✗ | ✗ |
| Edit USER_DIRECTORY | ✓ | ✗ | ✗ |
| Edit MASTER_CODE | ✓ | ✗ | ✗ |
| Create/update tasks | ✓ | ✓ | ✗ |
| View tasks | ✓ | ✓ | ✓ |
| Confirm finance | ✓ | ✓* | ✗ |
| Mark checklist done | ✓ | ✓ | ✗ |

*If finance confirmation is role-gated, OPERATOR may be allowed. Adjust per business rules.

---

## Backend Validation Expectations

1. **createTask:** ensureRequired(OWNER_ID); assertValidUserId(OWNER_ID); assertValidUserId(REPORTER_ID) when provided; REPORTER_ID defaults to mapCurrentUserEmailToInternalId() or cbvUser()
2. **assignTask:** assertValidUserId(ownerId, 'OWNER_ID')
3. **createHoSo:** assertValidUserId(OWNER_ID) when OWNER_ID provided
4. **setFinanceStatus (CONFIRMED):** CONFIRMED_BY = mapCurrentUserEmailToInternalId() or cbvUser()
5. **Admin USER_DIRECTORY create:** assertValidEnumValue('ROLE', ROLE)
6. **Admin operations:** assertAdminAuthority() (checks ADMIN_EMAILS)

---

## Limitations

- Role enforcement is **partial**: GAS uses ADMIN_EMAILS for admin; OPERATOR/VIEWER distinction is AppSheet slice only
- No GAS assertRoleAllowed() in task/finance flows yet — add when needed
- ACTOR_ID in logs remains email for audit traceability
- Migration: existing email-based OWNER_ID/REPORTER_ID must be migrated to user ID manually or via script
