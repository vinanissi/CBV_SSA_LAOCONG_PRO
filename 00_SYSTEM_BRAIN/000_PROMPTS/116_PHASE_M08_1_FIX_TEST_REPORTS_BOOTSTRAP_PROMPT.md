# M08.1 — FIX TEST REPORTS BOOTSTRAP (prompt archive)

**Archived:** 2026-05-14  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`

## Intent

Idempotent bootstrap for sheet **CBV_TEST_REPORTS** (create if missing; append missing headers on row 1 only), then **M08** test console calls ensure before `M08_TEST_REPORTS_BOOTSTRAP` check and appends a full canonical row after finalize via `CbvTcsReports_appendReport_`.

## Implementation pointers

- `05_GAS_RUNTIME/999F_TEST_REPORTS_BOOTSTRAP_RUNTIME.js` — `CbvTcsReports_ensureSheet_`, `CbvTcsReports_appendReport_`, `CbvTcsReports_getCanonicalHeaders_`
- `05_GAS_RUNTIME/999E_MILESTONE_08_OPERATIONAL_STATE_TEST_CONSOLE.js` — bootstrap check + sheet append
- `.clasp.json` — `999F` immediately after `999D`

Drive evidence remains primary; sheet is secondary audit trail.

## Post-deploy

`clasp push` → **M08 — Run Operational State Runtime Test** → expect `M08_TEST_REPORTS_BOOTSTRAP` **OK** when bound spreadsheet allows sheet create/write.
