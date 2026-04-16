# USER_DIRECTORY Audit Specification

## Audit Function

`auditUserDirectory()` — in 90_BOOTSTRAP_AUDIT.js. Also invoked from selfAuditBootstrap().

---

## Checks Performed

| Check | Severity | Issue Code | Action |
|-------|----------|------------|--------|
| Duplicate ID | CRITICAL | UD_DUPLICATE_ID | Fix duplicate manually |
| Duplicate USER_CODE | HIGH | UD_DUPLICATE_USER_CODE | Fix duplicate manually |
| Duplicate EMAIL (where present) | HIGH | UD_DUPLICATE_EMAIL | Fix duplicate manually |
| Invalid ROLE | HIGH | UD_INVALID_ROLE | Use ADMIN, OPERATOR, VIEWER |
| Invalid STATUS | HIGH | UD_INVALID_STATUS | Use ACTIVE, INACTIVE, ARCHIVED |
| Orphan HTX_ID | MEDIUM | UD_ORPHAN_HTX | Fix or clear HTX_ID |

---

## Integration with selfAuditBootstrap

- auditUserDirectory() runs after auditMasterCodeIntegrity.
- Findings merged into main findings array.
- sectionResults.userDirectoryIntegrity = PASS | FAIL.

---

## DISPLAY_NAME Auto-Fill

`ensureDisplayTextForUserDirectoryRows()` — in 40_DISPLAY_MAPPING_SERVICE.js.
- Fills empty DISPLAY_NAME with FULL_NAME or USER_CODE.
- Called from initAll() via ensureDisplayTextForUserDirectoryRows.

---

## Validation Integration

| Service | Validation |
|---------|------------|
| createTask | assertActiveUserId(OWNER_ID), assertActiveUserId(REPORTER_ID) |
| assignTask | assertActiveUserId(ownerId) |
| setFinanceStatus (CONFIRMED) | mapCurrentUserEmailToInternalId() for CONFIRMED_BY |
| Admin create user | validateUserRecordForCreate(record) |
| Admin update user | validateUserRecordForUpdate(id, patch) |
