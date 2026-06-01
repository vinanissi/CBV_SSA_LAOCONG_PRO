# ADR — DSR Test Console Addendum

- **ID**: `ADR_DSR_TEST_CONSOLE_ADDENDUM`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Context phase**: `PHASE_DSR_07_TEST_CONSOLE`

---

## Decision

1. **Separate menu:** DSR tests only under `🧪 CBV Test Console → 🔁 DSR Test Console`.
2. **Sheet:** `DSR_TEST_REPORT` append-only with `DSR_TEST_CONSOLE_REPORT_V1` envelope.
3. **Dry-run:** Tests validate guards/functions; no `cbvDsrManualSyncApply` invocation.
4. **AI handoff:** Generated from latest test envelope, stored in report row.

---

*Append-only ADR.*
