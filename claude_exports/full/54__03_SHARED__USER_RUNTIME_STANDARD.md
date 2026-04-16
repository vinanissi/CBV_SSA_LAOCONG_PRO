# CBV User Runtime Standard

**Design:** USER_DIRECTORY as canonical operational user source. GAS runtime and validation layer.

---

## Required Public Functions

| Function | File | Purpose |
|----------|------|---------|
| seedUserDirectory(options) | 90_BOOTSTRAP_USER_SEED.js | Idempotent seed; sampleMode=true for demo users |
| getUsers() | 02_USER_SERVICE.js | All non-deleted users |
| getActiveUsers() | 02_USER_SERVICE.js | STATUS=ACTIVE only |
| getUserById(id) | 02_USER_SERVICE.js | Lookup by ID, USER_CODE, or email |
| getUserByEmail(email) | 02_USER_SERVICE.js | Lookup by email (case-insensitive) |
| assertValidUserId(userId, fieldName) | 02_USER_SERVICE.js | User exists, not deleted (any status) |
| assertActiveUserId(userId, fieldName) | 02_USER_SERVICE.js | User exists, not deleted, STATUS=ACTIVE |
| buildUserDisplayMap() | 02_USER_SERVICE.js | Map ID -> display string for dropdowns |
| auditUserDirectory() | 90_BOOTSTRAP_AUDIT.js | Full integrity audit |

---

## Validation Rules Enforced

1. **ID unique** — auditUserDirectory reports duplicate ID.
2. **USER_CODE unique** — validateUserRecordForCreate/ForUpdate; auditUserDirectory.
3. **EMAIL unique where present** — validateUserRecordForCreate/ForUpdate; auditUserDirectory.
4. **ROLE enum-backed** — assertValidEnumValue('ROLE', ...).
5. **STATUS enum-backed** — assertValidEnumValue('USER_DIRECTORY_STATUS', ...).
6. **Only ACTIVE selectable for assignment** — assertActiveUserId in createTask, assignTask.
7. **DISPLAY_NAME auto-derived** — ensureDisplayTextForUserDirectoryRows (FULL_NAME or USER_CODE).
8. **Validation reusable** — validateUserRecordForCreate, validateUserRecordForUpdate in 02_USER_VALIDATION.js.

---

## Usage by Module

| Module | Uses |
|--------|------|
| TASK | assertActiveUserId(OWNER_ID), assertActiveUserId(REPORTER_ID), mapCurrentUserEmailToInternalId |
| FINANCE | mapCurrentUserEmailToInternalId for CONFIRMED_BY |
| HO_SO | assertValidUserId(OWNER_ID) or assertActiveUserId when creating |
| AppSheet | buildUserDisplayMap for display; getActiveUsers for dropdown slice |

---

## Seed Rules

- **seedUserDirectory()** — Ensures sheet exists. sampleMode=false by default.
- **seedUserDirectory({ sampleMode: true })** — Adds SAMPLE_USER_001, SAMPLE_USER_002, SAMPLE_USER_003. NOTE=[SAMPLE].
- **seedGoldenDataset** — Calls seedUserDirectory({ sampleMode: true }) first.
- No hardcoded production users. Admin adds via AppSheet or future admin panel.

---

## Fallback Assumptions

1. When mapCurrentUserEmailToInternalId returns null, REPORTER_ID and CONFIRMED_BY store empty string (not email).
2. Logs (TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG) ACTOR_ID remains email for audit traceability.
3. If USER_DIRECTORY sheet missing, getUsers/getActiveUsers return []; assertActiveUserId throws.
4. cbvMakeId('UD') produces UD_YYYYMMDD_xxxxxxxx for new user IDs.

---

## File Dependencies

- 02_USER_SERVICE: 00_CORE_CONFIG, 00_CORE_UTILS
- 02_USER_VALIDATION: 02_USER_SERVICE, 01_ENUM_SERVICE, 03_SHARED_VALIDATION, 03_SHARED_REPOSITORY
- 90_BOOTSTRAP_USER_SEED: 00_CORE_CONFIG, 03_SHARED_REPOSITORY, 90_BOOTSTRAP_SCHEMA
