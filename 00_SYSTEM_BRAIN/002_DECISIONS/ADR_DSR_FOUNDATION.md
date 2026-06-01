# ADR — CBV Data Sync Runtime Foundation (DSR v1)

- **ID**: `ADR_DSR_FOUNDATION`
- **Date**: 2026-06-01
- **Status**: **ACCEPTED**
- **Context phase**: `PHASE_DSR_01_FOUNDATION`
- **Scope**: `05_GAS_RUNTIME/84_DATA_SYNC_RUNTIME_*.js` — control-plane spreadsheet tabs + operator menu

---

## Context

CBV needs a **manual-first, append-only** data sync control plane between a SOURCE and DESTINATION Google Spreadsheet without coupling to TASK_MAIN or Work Inbox runtimes. Operators require visible configuration, plans, logs, audits, and reports before any sync apply phase.

---

## Decision

1. **Module name:** `CBV_DATA_SYNC_RUNTIME` v1 (`CBV_DSR_VERSION` constant).
2. **Control sheets** on the active (DSR host) spreadsheet:

| Sheet | Role |
|-------|------|
| `DASHBOARD_SYNC` | Operator dashboard shell |
| `SYNC_CONFIG` | Key/value runtime configuration |
| `SYNC_PLAN` | Future diff/plan output (headers only in foundation) |
| `SYNC_LOG` | Append-only operation log |
| `SYNC_AUDIT` | Append-only governance trail |
| `SYNC_REPORT` | Append-only phase/run reports |
| `SYNC_BACKUP_INDEX` | Future backup index (headers only) |

3. **Menu:** `🚀 CBV Runtime` → `🔁 Data Sync Runtime` — separate from `CBV PRO` and `🧪 CBV Test Console`.
4. **Foundation phase non-goals:** no SOURCE→DESTINATION sync, no triggers, no backup/diff/apply runtimes, no sheet deletion, no business row overwrite (except empty dashboard bootstrap and missing config keys).
5. **Config keys** seeded when missing: `DSR_VERSION`, `SOURCE_SPREADSHEET_ID`, `DESTINATION_SPREADSHEET_ID`, `SYNC_MODE`, `SAFETY_MODE`, `LAST_BOOTSTRAP_AT` — IDs left blank until `PHASE_DSR_02_CONNECTION_CHECK`.

---

## Consequences

- **Positive:** Traceable foundation; aligns with CBV append-only audit patterns; reuses `90_BOOTSTRAP_INIT` header helpers.
- **Negative:** Live verification requires `clasp push` / Apps Script deploy on host spreadsheet.
- **Follow-up:** `PHASE_DSR_02_CONNECTION_CHECK` — validate spreadsheet IDs and read-only connectivity.

---

## Related

- `00_SYSTEM_BRAIN/DSR/DSR_RUNTIME_AUTHORITY.md`
- `00_SYSTEM_BRAIN/000_REPORTS/PHASE_DSR_01_FOUNDATION_REPORT.md`

---

*Append-only ADR.*
