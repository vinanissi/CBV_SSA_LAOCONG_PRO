# ADR — DSR Backup Runtime Addendum

- **ID**: `ADR_DSR_BACKUP_RUNTIME_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Extends**: `ADR_DSR_FOUNDATION.md`, `ADR_DSR_CONNECTION_CHECK_ADDENDUM.md`
- **Context phase**: `PHASE_DSR_03_BACKUP_RUNTIME`

---

## Decision

1. **Backup target:** DESTINATION spreadsheet only (`copyTo` + rename).
2. **Naming:** `{BACKUP_NAME_PREFIX}_<sheet>_<yyyyMMdd_HHmmss>` with numeric suffix on collision — never overwrite.
3. **Scope:** `ALL_DESTINATION_BUSINESS_SHEETS`; exclude DSR runtime tabs and `BAK_*` unless `BACKUP_INCLUDE_RUNTIME_SHEETS=TRUE`.
4. **Index:** Append-only rows on host `SYNC_BACKUP_INDEX`.
5. **No SOURCE writes**; no sync/diff/apply/triggers.

---

## Non-goals

- Delete old backups; overwrite business sheets; SOURCE→DEST data copy.

---

*Append-only ADR addendum.*
