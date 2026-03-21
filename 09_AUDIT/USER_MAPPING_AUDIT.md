# User Mapping Audit

**Date:** 2025-03-21  
**Scope:** USER_DIRECTORY integration into TASK, FINANCE, HO_SO.

---

## 1. Fields Mapped to USER_DIRECTORY

| Table | Field | Mapped | Storage | Validation |
|-------|-------|--------|---------|------------|
| TASK_MAIN | OWNER_ID | ✅ | USER_DIRECTORY.ID | assertActiveUserId |
| TASK_MAIN | REPORTER_ID | ✅ | USER_DIRECTORY.ID | assertActiveUserId / mapCurrentUserEmailToInternalId |
| TASK_CHECKLIST | DONE_BY | ✅ | USER_DIRECTORY.ID | mapCurrentUserEmailToInternalId |
| TASK_UPDATE_LOG | ACTOR_ID | ✅ | ID or email fallback | mapCurrentUserEmailToInternalId \|\| cbvUser |
| FINANCE_TRANSACTION | CONFIRMED_BY | ✅ | USER_DIRECTORY.ID | mapCurrentUserEmailToInternalId |
| FINANCE_LOG | ACTOR_ID | ✅ | ID or email fallback | mapCurrentUserEmailToInternalId \|\| cbvUser |
| ADMIN_AUDIT_LOG | ACTOR_ID | ✅ | ID or email fallback | mapCurrentUserEmailToInternalId \|\| cbvUser |
| logAction() | ACTOR_ID | ✅ | ID or email fallback | mapCurrentUserEmailToInternalId \|\| cbvUser |
| HO_SO_MASTER | OWNER_ID | ✅ | USER_DIRECTORY.ID | assertActiveUserId |

---

## 2. Schema Gaps Found

| Gap | Severity | Action |
|-----|----------|--------|
| No ASSIGNEE_ID on TASK_MAIN | None | By design; OWNER_ID is assignee |
| No additional finance approver fields | None | Only CONFIRMED_BY needed |
| ACTOR_ID mixed ID/email | Low | Documented; getUserDisplay handles both |

**No destructive schema changes proposed.**

---

## 3. GAS Changes Applied

| File | Function | Change |
|------|----------|--------|
| 20_TASK_SERVICE.gs | addTaskUpdate | ACTOR_ID = mapCurrentUserEmailToInternalId() \|\| cbvUser() |
| 30_FINANCE_SERVICE.gs | logFinance | ACTOR_ID = mapCurrentUserEmailToInternalId() \|\| cbvUser() |
| 03_SHARED_LOGGER.gs | logAdminAudit | ACTOR_ID = mapCurrentUserEmailToInternalId() \|\| cbvUser() |
| 03_SHARED_LOGGER.gs | logAction | ACTOR_ID = mapCurrentUserEmailToInternalId() \|\| cbvUser() |

---

## 4. Safe Fixes Applied

- Replaced `cbvUser()`-only usage in ACTOR_ID with `mapCurrentUserEmailToInternalId() || cbvUser()`
- Guard: `typeof mapCurrentUserEmailToInternalId === 'function'` to avoid errors if USER_SERVICE not loaded
- No schema mutations; ACTOR_ID columns remain text

---

## 5. Final Mapping Summary

| Entity | User Fields | Primary Ref | Fallback |
|--------|-------------|-------------|----------|
| TASK | OWNER_ID, REPORTER_ID | USER_DIRECTORY.ID | — |
| TASK | DONE_BY (checklist) | USER_DIRECTORY.ID | — |
| TASK | ACTOR_ID (log) | USER_DIRECTORY.ID | Email |
| FINANCE | CONFIRMED_BY | USER_DIRECTORY.ID | — |
| FINANCE | ACTOR_ID (log) | USER_DIRECTORY.ID | Email |
| ADMIN | ACTOR_ID (audit) | USER_DIRECTORY.ID | Email |
| HO_SO | OWNER_ID | USER_DIRECTORY.ID | — |

---

## 6. Compliance

- ✅ HO_SO_MASTER not used as user store
- ✅ No joins by FULL_NAME
- ✅ USER_DIRECTORY.ID as primary ref
- ✅ Email secondary/fallback only for audit traceability
