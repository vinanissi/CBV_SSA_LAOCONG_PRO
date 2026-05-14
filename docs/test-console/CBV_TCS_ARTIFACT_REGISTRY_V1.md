# CBV Test Artifact Registry — V1

**Phase:** 97.2 — `PHASE_97_2_TEST_ARTIFACT_REGISTRY_MARKDOWN_MIRROR`  
**Runtime:** `05_GAS_RUNTIME/998M_TEST_ARTIFACT_REGISTRY_RUNTIME.js`  
**Test Console:** `05_GAS_RUNTIME/998N_TEST_ARTIFACT_REGISTRY_TEST_CONSOLE.js`  
**Standards:** CBV Operational Ecosystem V1 · CBV Test Console Standard V1 (`CBV_TCS_V1`)

## Purpose

Provide a **central append-only index** in Google Sheets that maps each Drive test artifact to:

- `TRACE_ID`, `PHASE`, `TEST_SUITE`, `STATUS`, `SEVERITY`
- Drive `FILE_ID` / `FILE_URL` / `MIME_TYPE`
- `ARTIFACT_KIND` (`JSON` | `MD` | `TXT`)
- Denormalised report summary fields for quick filtering

Together with the Drive folder (`1wQhgcq6An8YTu_6WD91p1nJLJ0gtChwG`), this forms an **AI-auditable test memory layer**.

## Sheet

- **Name:** `CBV_TEST_ARTIFACT_REGISTRY`
- **Headers (row 1, fixed order):**  
  `ARTIFACT_ID`, `CREATED_AT`, `CREATED_BY`, `PHASE`, `TEST_SUITE`, `TRACE_ID`, `STATUS`, `SEVERITY`, `CONTRACT_VERSION`, `ENVELOPE_OK`, `FOLDER_ID`, `FILE_NAME`, `FILE_ID`, `FILE_URL`, `MIME_TYPE`, `ARTIFACT_KIND`, `FORMAT`, `SOURCE`, `EXPORTER_VERSION`, `REPORT_CHECKED_AT`, `REPORT_RUN_BY`, `REPORT_SUMMARY`, `REPORT_WARNINGS_COUNT`, `REPORT_ERRORS_COUNT`, `IS_DELETED`

## Rules

- **Append-only:** new rows for new artifacts; do not delete or rewrite historical rows in Phase 97.2 scope.
- **One row per file:** each `.json` / `.md` / `.txt` written by `CbvTcsDriveReport_export` is registered via `CbvTcsArtifactRegistry_registerExportResult`.
- **No destructive Drive operations** from this module (no trash, delete, clear).

## Key APIs

| Function | Role |
|----------|------|
| `CbvTcsArtifactRegistry_ensureSchema()` | Create sheet + headers if missing |
| `CbvTcsArtifactRegistry_registerArtifact(meta)` | Append one registry row |
| `CbvTcsArtifactRegistry_registerExportResult(exportResult, report)` | Register all files from a Drive export |
| `CbvTcsArtifactRegistry_listRecent(limit)` | Newest-first slice |
| `CbvTcsArtifactRegistry_findByTraceId(traceId)` | Substring match on `TRACE_ID` |
| `CbvTcsArtifactRegistry_findByPhase(phase, limit)` | Filter `PHASE` |
| `CbvTcsArtifactRegistry_validate()` | Schema + namespace guardrails |

## Production readiness

**Not production-ready.** Test artifact registry / audit runtime only.
