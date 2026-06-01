# ADR — DSR Diff Preview Addendum

- **ID**: `ADR_DSR_DIFF_PREVIEW_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Extends**: `ADR_DSR_FOUNDATION.md`, `ADR_DSR_CONNECTION_CHECK_ADDENDUM.md`
- **Context phase**: `PHASE_DSR_04_DIFF_PREVIEW`

---

## Decision

1. **Structure-only** comparison: sheet presence, row/column counts, header row equality — no business row data compare.
2. **Outputs:** append-only `SYNC_PLAN`, `SYNC_LOG`, `SYNC_AUDIT`, `SYNC_REPORT`; dashboard label updates on host.
3. **Read-only** on SOURCE and DESTINATION business sheets (header row read only when sheet exists on both sides).
4. **Exclusions:** `BAK_*` destination tabs; DSR runtime protected sheets when `BACKUP_INCLUDE_RUNTIME_SHEETS` is false.
5. **Runtime statuses:** `READY_FOR_SYNC`, `REVIEW_REQUIRED`, `CONFIG_REQUIRED`, `CONNECTION_REQUIRED`, `DIFF_FAILED`.

---

## Non-goals

- Backup creation, sync apply, triggers, sheet delete/clear, business data overwrite.

---

*Append-only ADR addendum.*
