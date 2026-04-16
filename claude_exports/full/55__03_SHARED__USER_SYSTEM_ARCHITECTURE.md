# CBV User System Architecture

**Design:** Dedicated USER_DIRECTORY layer. Operational users managed separately from business records. Supersedes MASTER_CODE-based user registry.

---

## Canonical Design

See **03_SHARED/USER_SYSTEM_STANDARD.md** for the definitive user system specification.

### USER_DIRECTORY vs MASTER_CODE vs HO_SO_MASTER

| Layer | Purpose |
|-------|---------|
| **USER_DIRECTORY** | Operational users (login, task owner, reporter, finance confirmation) |
| **MASTER_CODE** | Dynamic lookup codes (provinces, districts, cost centers). **Not for user registry.** |
| **HO_SO_MASTER** | Business entities (HTX, XA_VIEN, XE, TAI_XE). **Not for login/user storage.** |

---

## Migration from MASTER_CODE (USER)

**Previous design:** MASTER_CODE with MASTER_GROUP=USER stored users. SHORT_NAME=email, PARENT_CODE=role.

**Current design:** USER_DIRECTORY is the single source of truth for operational users.

**Migration steps:**
1. Create USER_DIRECTORY sheet and seed from existing MASTER_CODE USER rows (if any).
2. Update GAS 02_USER_SERVICE.js to read from USER_DIRECTORY instead of MASTER_CODE.
3. Configure AppSheet Ref for OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY → USER_DIRECTORY.
4. Migrate existing OWNER_ID/REPORTER_ID values (email or MASTER_CODE.ID) to USER_DIRECTORY.ID.
5. Remove MASTER_GROUP=USER convention from MASTER_CODE documentation.

---

## Field Mapping Summary

| Table | Field | Ref Target | Display |
|-------|-------|------------|---------|
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | DISPLAY_NAME or FULL_NAME |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | DISPLAY_NAME or FULL_NAME |
| HO_SO_MASTER | OWNER_ID | USER_DIRECTORY | DISPLAY_NAME or FULL_NAME |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | DISPLAY_NAME or FULL_NAME |
| FINANCE_TRANSACTION | CONFIRMED_BY | USER_DIRECTORY | DISPLAY_NAME or FULL_NAME |

ACTOR_ID in logs (TASK_UPDATE_LOG, ADMIN_AUDIT_LOG, FINANCE_LOG) remains email for audit traceability.
