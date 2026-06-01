# DSR Test Console Contract

**Contract name:** `DSR_TEST_CONSOLE`  
**Contract version:** `DSR_TEST_CONSOLE_REPORT_V1`  
**Phase:** `PHASE_DSR_07_TEST_CONSOLE`

---

## Test runtime boundary

- All DSR QA lives under **🧪 CBV Test Console → 🔁 DSR Test Console**.
- **Never** under **🚀 CBV Runtime** business menu.

---

## Allowed reads

`SYNC_CONFIG`, `SYNC_PLAN`, `SYNC_BACKUP_INDEX`, `SYNC_REPORT`, `SYNC_LOG`, `SYNC_AUDIT`, `DASHBOARD_SYNC` (read-only).

---

## Allowed writes

| Target | Rule |
|--------|------|
| `DSR_TEST_REPORT` | Append-only test reports |
| `SYNC_LOG` | Optional test-run log via `cbvDsrAppendLog_` |
| `SYNC_AUDIT` | Optional test-run audit |
| `DASHBOARD_SYNC` | Optional safe label updates only if used |

---

## Forbidden operations

- Sync apply, backup creation, diff mutation  
- SOURCE / DESTINATION business writes  
- Triggers, schedulers  
- Calling `cbvDsrManualSyncApply` from tests  

---

## Report envelope schema

See `DSR_TEST_CONSOLE_REPORT_V1` in phase prompt — fields: `ok`, `phase`, `status`, `checkedAt`, `runBy`, `traceId`, `testSuite`, `summary`, `checks[]`, `warnings`, `errors`, `nextStep`, `severity`, `contractVersion`, `envelopeOk`.

Check item: `code`, `ok`, `severity`, `message`, `detail`.

---

## AI handoff prompt

Stored in `DSR_TEST_REPORT.AI_HANDOFF_PROMPT` — includes phase, status, failed/warning/critical checks, next step, no-redesign / no-phase-jump / preserve-authority instructions.

---

## Operator verification

1. Reload spreadsheet → **🧪 CBV Test Console** → **🔁 DSR Test Console** → **1. Run DSR Full Test**  
2. Open **DSR_TEST_REPORT** (menu 9)  
3. Confirm **🚀 CBV Runtime** has no DSR test items  

---

*Implementation: `84_DATA_SYNC_RUNTIME_TEST_CONSOLE.js`*
