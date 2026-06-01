# ADR — DSR Runtime Report Addendum

- **ID**: `ADR_DSR_RUNTIME_REPORT_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Context phase**: `PHASE_DSR_06_RUNTIME_REPORT`

---

## Decision

1. **Read-only aggregation** from host DSR runtime sheets (bounded tail reads).
2. **REPORT_JSON** contract `DSR_RUNTIME_REPORT_V1` appended to `SYNC_REPORT`.
3. **No** SOURCE/DEST business access required; no sync/backup/diff mutation.
4. Menu **8. Generate Runtime Report** — operator-triggered only.

---

*Append-only ADR addendum.*
