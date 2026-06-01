# ADR — DSR Connection Check Addendum

- **ID**: `ADR_DSR_CONNECTION_CHECK_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Extends**: `ADR_DSR_FOUNDATION.md`
- **Context phase**: `PHASE_DSR_02_CONNECTION_CHECK`

---

## Decision

1. **Read-only cross-spreadsheet access** via `SpreadsheetApp.openById` for SOURCE and DESTINATION inspection only.
2. **Connection results** append to host `SYNC_LOG`, `SYNC_AUDIT`, `SYNC_REPORT`; dashboard labels updated on host `DASHBOARD_SYNC` column B only.
3. **No writes** to SOURCE or DESTINATION workbooks (including business sheets).
4. **Result statuses**: `CONNECTED`, `NEEDS_CONFIG`, `SOURCE_ERROR`, `DESTINATION_ERROR`, `FAILED`.
5. **Header preview** capped at 20 columns; no row data copy.
6. **Expected config** (warn if different): `SYNC_MODE=ONE_WAY_SOURCE_TO_DESTINATION`, `SAFETY_MODE=BACKUP_BEFORE_WRITE`.

---

## Non-goals (this phase)

- Sync apply, diff preview, backup sheets, triggers.

---

## Related

- `05_GAS_RUNTIME/84_DATA_SYNC_RUNTIME_CONNECTION.js`
- `00_SYSTEM_BRAIN/DSR/DSR_RUNTIME_AUTHORITY.md`

---

*Append-only ADR addendum.*
