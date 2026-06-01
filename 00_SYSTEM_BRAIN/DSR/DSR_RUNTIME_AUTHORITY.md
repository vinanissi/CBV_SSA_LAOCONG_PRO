# DSR Runtime Authority — CBV_DATA_SYNC_RUNTIME v1

**Status:** Foundation through Test Console (PHASE_DSR_01–07) + Whitelist (05B) + Selective Apply (05C)  
**Owner module:** Data Sync Runtime (DSR)  
**GAS entry:** `05_GAS_RUNTIME/84_DATA_SYNC_RUNTIME_*.js`, `84_DATA_SYNC_RUNTIME_MENU.js`

---

## Authority scope (this phase)

| In scope | Out of scope |
|----------|----------------|
| Sheet/tab creation with headers | SOURCE → DESTINATION data copy |
| Dashboard shell (`DASHBOARD_SYNC`) | Automatic triggers |
| Append-only LOG / AUDIT / REPORT / BACKUP_INDEX / PLAN | Unattended/automatic sync |
| Config seed (`SYNC_CONFIG`) | Deleting or clearing business data |
| Operator menu under `🚀 CBV Runtime` | Test console mixed into business menu |
| Read-only SOURCE/DEST `openById` inspection | Writes to SOURCE/DEST business sheets |
| Connection check (`CONNECTED`, `NEEDS_CONFIG`, …) | Sync, diff, apply, triggers |
| Destination backup (`copyTo`, `BAK_*` naming) | Sync apply, delete old backups |
| Structure diff preview (`SYNC_PLAN`) | Unguarded sync apply |
| Manual sync apply (guarded, whitelist-only) | Full workbook sync; triggers; SOURCE writes |
| Whitelist sync guard (`SYNC_WHITELIST`, forbidden patterns) | Sync non-whitelisted or forbidden sheets |
| Runtime report aggregation | Sync/backup/diff mutation, business sheet writes |
| DSR Test Console (`DSR_TEST_REPORT`) | Tests in business menu; destructive test sync |

---

## Sheet contract

See `ADR_DSR_FOUNDATION.md` for tab list and header columns.

---

## Operator entrypoints

| Menu item | Function |
|-----------|----------|
| 1. Bootstrap DSR Foundation | `cbvDsrBootstrapFoundation` |
| 2. Open Sync Dashboard | `cbvDsrOpenDashboard` |
| 3. Health Check Foundation | `cbvDsrHealthCheckFoundation` |
| 4. Connection Check SOURCE/DEST | `cbvDsrConnectionCheck` |
| 5. Backup DESTINATION | `cbvDsrBackupDestination` |
| 6. Diff Preview SOURCE ↔ DEST | `cbvDsrDiffPreview` |
| 7. Manual Sync Apply SOURCE → DEST | `cbvDsrManualSyncApply` (blocked when selective required) |
| 8. Generate Runtime Report | `cbvDsrGenerateRuntimeReport` |
| 9. Build Selective Sync Plan | `cbvDsrBuildSelectiveSyncPlan` |
| 10. Manual Selective Sync Apply | `cbvDsrManualSelectiveSyncApply` |
| 11. Open Sync Selection | `cbvDsrOpenSyncSelection` |

---

## Test console (PHASE_DSR_07)

- Menu: **🧪 CBV Test Console → 🔁 DSR Test Console** only.
- Sheet: `DSR_TEST_REPORT` append-only; contract `DSR_TEST_CONSOLE_REPORT_V1`.
- Dry-run / static checks — does not invoke `cbvDsrManualSyncApply` or backup/sync mutations.

---

## Runtime report (PHASE_DSR_06)

- Contract: `003_AUDIT/DSR/DSR_RUNTIME_REPORT_CONTRACT.md`
- Read-only tail aggregation; append REPORT/LOG/AUDIT; update dashboard labels.
- Results: `READY`, `READY_WITH_WARNINGS`, `ATTENTION_REQUIRED`, `FAILED`, `NO_RUNTIME_HISTORY`.

---

## Manual sync apply (PHASE_DSR_05 + 05B + 05C)

- Contract: `00_SYSTEM_BRAIN/003_AUDIT/DSR/SYNC_GUARD_CONTRACT.md`
- ADR: `ADR_DSR_WHITELIST_SYNC_GUARD.md` (DSR_DECISION_001), `ADR_DSR_SELECTIVE_SYNC_APPLY.md` (DSR_DECISION_002)
- Requires `SYNC_ALLOWED=TRUE`, backup, diff `READY_FOR_SYNC`, whitelist + selective config
- **DSR may write** only when sheet is **whitelisted**, **not forbidden**, and **operator selected** (`APPROVE` + `READY_TO_APPLY` on latest `SYNC_SELECTION` row)
- **Forbidden:** interpret whitelist as blanket approval; sync all whitelist by default; auto-create selections; sync `SKIP`/`HOLD`/`BLOCK`/empty decisions
- Menu 7 legacy apply **blocked** when `SELECTIVE_SYNC_REQUIRED=TRUE` — use menu 10
- **Forbidden scope:** full-workbook sync; destination-only runtime sheets; master-data sheets (`USER_DIRECTORY`, `MASTER_CODE`, `DON_VI`, `HO_SO_MASTER`, …); governance/config/system sheets (`CBV_*`, `SYNC_*`, `DSR_*`, `BAK_*`, …); deleting destination-only sheets
- DESTINATION: clear tab content + values copy **only for whitelisted sheets**; SOURCE read-only
- Non-whitelisted: SKIP + LOG + AUDIT (no clear/write). Forbidden: BLOCK + LOG + AUDIT.
- Results: `SYNC_APPLIED`, `GUARD_BLOCKED`, `BACKUP_REQUIRED`, `DIFF_REQUIRED`, `CONFIG_REQUIRED`, `PARTIAL_SYNC`, `SYNC_FAILED`

---

## Diff preview (PHASE_DSR_04)

- Structure-only: sheet presence, row/column counts, header row match.
- Append-only `SYNC_PLAN` + host LOG/AUDIT/REPORT.
- Results: `READY_FOR_SYNC`, `REVIEW_REQUIRED`, `CONFIG_REQUIRED`, `CONNECTION_REQUIRED`, `DIFF_FAILED`.

---

## Backup runtime (PHASE_DSR_03)

- **Target:** DESTINATION only; additive `BAK_<sheet>_<yyyyMMdd_HHmmss>` tabs.
- **Excludes:** DSR runtime sheets (unless `BACKUP_INCLUDE_RUNTIME_SHEETS=TRUE`), existing `BAK_*` tabs.
- **Index:** Host `SYNC_BACKUP_INDEX` append-only.
- **Results:** `BACKUP_COMPLETED`, `BACKUP_COMPLETED_WITH_WARNINGS`, `NEEDS_CONFIG`, `DESTINATION_ERROR`, `FAILED`.

---

## Connection check (PHASE_DSR_02)

- Reads `SYNC_CONFIG` on **host** spreadsheet only.
- Opens SOURCE and DESTINATION by ID — metadata + header preview (≤20 columns per sheet).
- Appends to host `SYNC_LOG`, `SYNC_AUDIT`, `SYNC_REPORT`; updates `DASHBOARD_SYNC` labels only.
- Result statuses: `CONNECTED`, `NEEDS_CONFIG`, `SOURCE_ERROR`, `DESTINATION_ERROR`, `FAILED`.

---

## Governance

- All bootstrap and health runs append to `SYNC_LOG`, `SYNC_AUDIT`, `SYNC_REPORT`.
- `SAFETY_MODE` default `STRICT`; `SYNC_MODE` default `MANUAL` until connection phase.

---

*Authority pack — extend in PHASE_DSR_02+ only via ADR addendum.*
