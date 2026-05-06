## MAIN_CONTROL — Phase A+B Implementation (Control Plane)

Scope: only `apps-script/main-control/src`, `.clasp.json.example`, and this doc.

### Files created

- `apps-script/main-control/src/010_MC_SCHEMA.js`
- `apps-script/main-control/src/020_MC_BOOTSTRAP_CONTROL_PLANE.js`
- `apps-script/main-control/src/040_MC_CONNECTION_PACKAGE.js`
- `apps-script/main-control/src/080_MC_HEALTH.js`

### Files updated (very light)

- `apps-script/main-control/src/200_MAIN_CONTROL_WEBAPP.js`
  - Added new token-gated actions:
    - GET `action=control_plane_health`
    - GET `action=control_plane_schema_report`
    - POST `action=CONTROL_PLANE_HEALTH`
    - POST `action=CONTROL_PLANE_SCHEMA_REPORT`
    - POST `action=CONTROL_PLANE_BOOTSTRAP`
  - Enriched existing actions (backward compatible):
    - `GET_CONNECTION_PACKAGE`: prefer `MC_issueConnectionPackage()` if available, else fallback to legacy `MC_getConnectionPackage_()`
    - `HEALTH_CHECK`: adds `data.controlPlaneHealth` (non-blocking)

- `apps-script/main-control/.clasp.json.example`
  - Inserted new files in `filePushOrder` before `200_MAIN_CONTROL_WEBAPP.js`:
    - `010_MC_SCHEMA.js`
    - `020_MC_BOOTSTRAP_CONTROL_PLANE.js`
    - `040_MC_CONNECTION_PACKAGE.js`
    - `080_MC_HEALTH.js`

### New public functions

- **Schema / Phase B**
  - `MC_Schema_report()`
  - `MC_Schema_ensureControlPlaneSheets()`

- **Bootstrap / Phase A+B**
  - `MC_bootstrapControlPlaneDryRun()`
  - `MC_bootstrapControlPlane()`

- **Health / Phase A**
  - `MC_healthControlPlane()`
  - `MC_healthControlPlaneText()`
  - `MC_diagnosticsControlPlane()`

- **Connection package store / Phase B**
  - `MC_issueConnectionPackage(moduleCode, options)`
  - `MC_storeConnectionPackage(packageObj)`
  - `MC_getStoredConnectionPackages(moduleCode)`

### Control Plane sheets ensured (Core DB)

Ensured (create if missing, add-only headers if missing):

- `CBV_MODULE_REGISTRY`
  - Add-only extra headers appended if missing:
    - `MODULE_DB_ID`
    - `MODULE_WEBAPP_URL`
    - `ENV_CODE`
    - `UPDATED_BY`
    - `HEALTH_STATUS`
    - `LAST_HEALTH_AT`
    - `NOTE`
- `CBV_EVENT_QUEUE`
- `CBV_EVENT_LOG`
- `CBV_COMMAND_LOG`
- `CBV_AUDIT_LOG`
- `CBV_IDEMPOTENCY`
- `CBV_SYSTEM_HEALTH`
- **NEW** `CBV_CONNECTION_PACKAGE`
  - Headers (add-only, never delete/rename):
    - `PACKAGE_ID`, `MODULE_CODE`, `MODULE_NAME`, `ENV_CODE`, `MODULE_DB_ID`, `MODULE_WEBAPP_URL`,
      `MAIN_CONTROL_WEBAPP_URL`, `CONFIG_DB_ID`, `CORE_DB_ID`, `VERSION`, `STATUS`, `ISSUED_AT`,
      `EXPIRES_AT`, `PACKAGE_JSON`, `CREATED_AT`, `UPDATED_AT`, `CREATED_BY`, `NOTE`

### How to run in Apps Script

Recommended order:

1. `MC_bootstrapControlPlaneDryRun()`
2. `MC_bootstrapControlPlane()`
3. `MC_healthControlPlane()`
4. `MC_Schema_report()`

Expected output characteristics:

- All functions return a **plain object** shaped like:
  - `{ ok, code, message, data, error }`
- Ensure operations are **idempotent** (re-run safe).
- Schema ensure is **add-only** (only appends missing headers).
- Health never throws; it reports findings with severity `INFO|WARN|ERROR|BLOCKER`.

### Rollback

- Rollback code: revert the commit.
- Data rollback: **do not delete** sheets/columns that were added (add-only). If needed, leave them unused.

