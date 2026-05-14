# CBV Test Console — Drive report export (V1)

**Phase:** 97.1 — `PHASE_97_1_TEST_CONSOLE_DRIVE_REPORT_EXPORT`  
**Standard:** CBV Operational Ecosystem V1 · CBV Test Console Standard V1 (`CBV_TCS_V1`)  
**Runtime:** `05_GAS_RUNTIME/998L_TEST_CONSOLE_DRIVE_REPORT_EXPORTER.js`

## Purpose

After a Test Console run produces a **CBV_TCS_V1** envelope, optionally persist a copy to the **Drive archive folder** (append-only new files). Failures to export **must not** invalidate the in-Sheet / in-memory test outcome except when the phase under test is the exporter itself.

## Target folder

- Folder ID: `1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG` (`CBV_TCS_DRIVE_REPORT_FOLDER_ID` in `998L`).

## API

### `CbvTcsDriveReport_export(report, options)`

- **report:** object matching the CBV_TCS_V1 envelope (same shape as other Test Console `*_run()` returns).
- **options:**
  - `phase` — string (used in filename slug).
  - `testSuite` — string (metadata / future use).
  - `prefix` — e.g. `'097_1'` → second segment `1`; first segment is **auto** from folder scan (`000`–`999`) max + 1.
  - `format` — `'json'` | `'md'` | `'both'`.

**Returns:**

```json
{
  "ok": true,
  "folderId": "...",
  "files": [{ "name", "fileId", "url", "mimeType" }],
  "warnings": [],
  "errors": []
}
```

## Naming (append-only, no overwrite)

Pattern:

`{NNN}_{S}_{PHASE_SLUG}_{YYYYMMDD}_{HHmmss}_{TRACE}.{ext}`

- `{NNN}`: three-digit decimal, **max existing prefix in folder + 1** (scan all files). If scan fails, sequence falls back with timestamp uniqueness via `_uniqN` suffix when a collision is detected.
- `{S}`: second segment parsed from `options.prefix` (e.g. `097_1` → `1`).
- Collision: `CbvTcsDriveReport_export` uses `getFilesByName` + alternate names (`_uniq1`, …) — **never** overwrites an existing file.

## File contents

- **JSON:** `JSON.stringify(report, null, 2)` verbatim.
- **Markdown:** human-readable sections (Metadata, Summary, Checks, Warnings, Errors, Next Step, Raw JSON fence).

## Safety (explicit deny)

- No `deleteFile`, `setTrashed`, clearing the folder, or updating business tables.
- Only **create** new Drive files and **read** folder metadata.

## Integration (Phase 97)

`998K_WEBAPP_STAFF_TRIAL_TEST_CONSOLE.js` calls `CbvTcsDriveReport_export` when loaded. On failure, warnings include **`DRIVE_EXPORT_FAILED:`** …; **`status` is not set to `FAIL` solely for Drive errors.**

## Menu

**🧪 CBV Test Console → Phase 97.1 — Drive Report Export**

- Run Drive Export Health Check — `CbvTcsDriveReport_TestConsole_run()`
- Export Latest Phase 97 Report to Drive — `CbvTcsDriveReport_exportLatestPhase97ToDrive()`
- Copy Latest Drive Export Result — reads `PropertiesService` key `CBV_TCS_DRIVE_EXPORT_LAST_RESULT_JSON`

## Production readiness

**Not production-ready.** Pilot / Test Console report export only.
