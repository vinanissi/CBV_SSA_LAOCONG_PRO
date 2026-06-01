# ADR — DSR Manual Sync Apply Addendum

- **ID**: `ADR_DSR_MANUAL_SYNC_APPLY_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Extends**: `ADR_DSR_FOUNDATION.md`, `ADR_DSR_BACKUP_RUNTIME_ADDENDUM.md`, `ADR_DSR_DIFF_PREVIEW_ADDENDUM.md`
- **Context phase**: `PHASE_DSR_05_MANUAL_SYNC_APPLY`

---

## Decision

1. First phase allowing **DESTINATION business sheet writes** — values only, manual menu + YES confirmation.
2. **SYNC_GUARD_CONTRACT** mandatory; `cbvDsrValidateSyncGuards_()` runs before `openById` write path.
3. `SYNC_ALLOWED` defaults `FALSE`; operator must set `TRUE` in `SYNC_CONFIG`.
4. Strict diff gate: `LAST_DIFF_RESULT` must be `READY_FOR_SYNC`.
5. Backup gate: `BACKUP_CREATED` rows in `SYNC_BACKUP_INDEX`.
6. No triggers, no SOURCE writes, no destination sheet deletion.

---

*Append-only ADR addendum.*
