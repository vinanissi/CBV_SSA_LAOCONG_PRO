# USER System — Consolidated Reference

**CBV-compliant structure.** Single source of truth for operational users.

---

## 1. Principles

| Principle | Implementation |
|-----------|----------------|
| USER_DIRECTORY = canonical user source | All operational user refs point to USER_DIRECTORY |
| HO_SO_MASTER = business entities only | HTX, XA_VIEN, XE, TAI_XE — not users |
| GAS = real guard | assertActiveUserId, mapCurrentUserEmailToInternalId |
| AppSheet refs = safe, non-destructive | ACTIVE_USERS from USER_DIRECTORY; Allow Adds OFF |
| Stored value = USER_DIRECTORY.ID | Never email, name, or HO_SO ID as primary ref |

---

## 2. Schema

| Table | Purpose |
|-------|---------|
| USER_DIRECTORY | Operational users (ID, USER_CODE, FULL_NAME, DISPLAY_NAME, EMAIL, ROLE, STATUS, HTX_ID, ...) |
| HO_SO_MASTER | Business entities (HTX, XA_VIEN, XE, TAI_XE) |
| MASTER_CODE | Reference codes (UNIT, PROVINCE, etc.) — NOT user registry |

---

## 3. Field Mapping

| Table | Field | Ref | Store | GAS |
|-------|-------|-----|-------|-----|
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | USER_DIRECTORY.ID | assertActiveUserId |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | USER_DIRECTORY.ID | mapCurrentUserEmailToInternalId default |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | USER_DIRECTORY.ID | mapCurrentUserEmailToInternalId |
| FINANCE_TRANSACTION | CONFIRMED_BY | ACTIVE_USERS | USER_DIRECTORY.ID | mapCurrentUserEmailToInternalId |
| HO_SO_MASTER | OWNER_ID | ACTIVE_USERS | USER_DIRECTORY.ID | assertActiveUserId |
| TASK_UPDATE_LOG | ACTOR_ID | — | ID or email fallback | mapCurrentUserEmailToInternalId \|\| cbvUser |
| FINANCE_LOG | ACTOR_ID | — | ID or email fallback | Same |
| ADMIN_AUDIT_LOG | ACTOR_ID | — | ID or email fallback | Same |

---

## 4. GAS Functions (02_USER_SERVICE.gs)

| Function | Purpose |
|----------|---------|
| getActiveUsers() | Users with STATUS=ACTIVE |
| getUserById(userId) | By ID, USER_CODE, or email |
| getUserByEmail(email) | By EMAIL (case-insensitive) |
| getUserDisplay(userId) | Display name for UI |
| assertActiveUserId(id, field) | Validates before write |
| mapCurrentUserEmailToInternalId() | Session email → USER_DIRECTORY.ID |
| clearUserCache() | After USER_DIRECTORY edits |

---

## 5. AppSheet Slice

| Slice | Source | Filter |
|-------|--------|--------|
| ACTIVE_USERS | USER_DIRECTORY | `AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE)` |

---

## 6. Documentation Index

| Doc | Purpose |
|-----|---------|
| 03_SHARED/USER_SYSTEM_STANDARD.md | Design standard |
| 03_SHARED/USER_TASK_FINANCE_MAPPING.md | Field mappings |
| 04_APPSHEET/APPSHEET_USER_LAYER.md | AppSheet layer |
| 04_APPSHEET/APPSHEET_USER_REF_RULES.md | Per-field rules |
| 04_APPSHEET/APPSHEET_USER_SECURITY_NOTES.md | Security |
| 09_AUDIT/USER_MIGRATION_PLAN.md | Migration |
| 06_DATABASE/USER_DIRECTORY_SCHEMA.md | Schema |
