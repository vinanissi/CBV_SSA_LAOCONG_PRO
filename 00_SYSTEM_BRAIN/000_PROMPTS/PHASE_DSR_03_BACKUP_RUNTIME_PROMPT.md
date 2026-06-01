# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_03_BACKUP_RUNTIME
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_03_BACKUP_RUNTIME`.
4. Do not jump phases.
5. Do not redesign unrelated architecture.
6. Preserve existing contracts, ADRs, authorities, registries, indexes, governance artifacts, and runtime boundaries.
7. Prefer additive and reversible changes.
8. Keep all changes modular, traceable, and audit-friendly.
9. Document conflicts before modifying affected files.
10. Stop and report `FAIL` if safe completion is not possible.

This phase extends the existing foundation of:

```text
CBV_DATA_SYNC_RUNTIME v1
```

Mandatory scope:

```text
PHASE_DSR_03_BACKUP_RUNTIME
```

Allowed work:

- Read DSR config from `SYNC_CONFIG`.
- Validate destination spreadsheet config.
- Open DESTINATION spreadsheet by ID using the existing safe open helper.
- Create safe backup copies of DESTINATION sheets.
- Backup only destination sheets selected by backup scope.
- Create backup sheet names using deterministic timestamped naming.
- Record every backup in `SYNC_BACKUP_INDEX`.
- Write backup operation result to `SYNC_LOG`.
- Write governance audit event to `SYNC_AUDIT`.
- Write runtime report to `SYNC_REPORT`.
- Update `DASHBOARD_SYNC` with latest backup status.
- Add safe runtime menu item for backup runtime.
- Create/update phase report, handoff, and test evidence.
- Update registry/index files only if required by existing repo conventions.

Forbidden work:

- Do not sync SOURCE → DESTINATION.
- Do not clear, overwrite, or delete business data.
- Do not modify SOURCE spreadsheet content.
- Do not implement diff preview.
- Do not implement sync apply.
- Do not create automatic triggers.
- Do not delete old backups.
- Do not overwrite existing backup sheets.
- Do not backup runtime system sheets unless explicitly allowed by config.
- Do not modify DESTINATION business sheets except by creating backup copies.
- Do not change unrelated runtime architecture.

Protected runtime sheets:

```text
DASHBOARD_SYNC
SYNC_CONFIG
SYNC_PLAN
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
```

By default, runtime sheets should be excluded from business backup unless `BACKUP_INCLUDE_RUNTIME_SHEETS` is explicitly set to `TRUE`.

---

## 3. COMPLETION RULES

You MUST complete all deliverables required by `PHASE_DSR_03_BACKUP_RUNTIME`.

You MUST create or update required artifacts according to existing repo conventions:

```text
REPORT
HANDOFF
TEST EVIDENCE
REGISTRY / INDEX updates if required
ADR if a new architecture decision is introduced
AUTHORITY if authority scope changes
CONTRACT if runtime contract is formalized
```

If no ADR, authority, or contract update is required, explicitly state that in the final response.

You MUST record:

- warnings
- risks
- assumptions
- skipped items
- follow-up actions

Do not report `GO` if mandatory deliverables are missing.

---

## 4. PHASE DELIVERABLES

Implement safe destination backup runtime for `CBV_DATA_SYNC_RUNTIME v1`.

### 4.1 Required Existing Foundation

Before implementing this phase, verify that Phase 01 and Phase 02 foundations exist:

```text
DASHBOARD_SYNC
SYNC_CONFIG
SYNC_PLAN
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
```

Required existing functions from previous phases should be reused when available:

```javascript
cbvDsrEnsureFoundationSheets_()
cbvDsrReadConfig_(ss)
cbvDsrValidateConnectionConfig_(config)
cbvDsrOpenSpreadsheetByIdSafe_(spreadsheetId, role)
cbvDsrInspectSpreadsheet_(spreadsheet, role)
cbvDsrAppendLog_(ss, payload)
cbvDsrAppendAudit_(ss, payload)
cbvDsrAppendReport_(ss, payload)
cbvDsrNow_()
cbvDsrRunId_()
```

If foundation is missing, call or reuse the existing foundation bootstrap function safely.

Do not recreate foundation destructively.

### 4.2 Required Config Keys

Read config values from `SYNC_CONFIG`.

Required existing keys:

```text
DSR_VERSION
SOURCE_SPREADSHEET_ID
DESTINATION_SPREADSHEET_ID
SYNC_MODE
SAFETY_MODE
```

Required or newly seeded backup config keys:

```text
BACKUP_SCOPE
BACKUP_INCLUDE_RUNTIME_SHEETS
BACKUP_NAME_PREFIX
LAST_BACKUP_AT
LAST_BACKUP_RUN_ID
```

Expected values:

```text
SYNC_MODE: ONE_WAY_SOURCE_TO_DESTINATION
SAFETY_MODE: BACKUP_BEFORE_WRITE
BACKUP_SCOPE: ALL_DESTINATION_BUSINESS_SHEETS
BACKUP_INCLUDE_RUNTIME_SHEETS: FALSE
BACKUP_NAME_PREFIX: BAK
```

If `DESTINATION_SPREADSHEET_ID` is missing or invalid:

- Do not attempt backup.
- Return backup runtime status `NEEDS_CONFIG`.
- Write warning to `SYNC_LOG`.
- Write audit event to `SYNC_AUDIT`.
- Write report to `SYNC_REPORT`.
- Return `GO_WITH_WARNINGS` if all code and artifacts are complete.

### 4.3 Required Runtime Menu Update

Extend existing GAS menu:

```text
🚀 CBV Runtime
└─ 🔁 Data Sync Runtime
   ├─ 1. Bootstrap DSR Foundation
   ├─ 2. Open Sync Dashboard
   ├─ 3. Health Check Foundation
   ├─ 4. Connection Check SOURCE/DEST
   ├─ 5. Backup DESTINATION
```

Menu functions must be safe and non-destructive except for creating backup sheets.

### 4.4 Required GAS Functions

Create or update modular GAS functions:

```javascript
cbvDsrBackupDestination()
cbvDsrValidateBackupConfig_(config)
cbvDsrBuildBackupPlan_(destSpreadsheet, config)
cbvDsrShouldBackupSheet_(sheet, config)
cbvDsrCreateBackupSheet_(destSpreadsheet, sourceSheet, runId, config)
cbvDsrMakeBackupSheetName_(sheetName, runId, config)
cbvDsrAppendBackupIndex_(ss, payload)
cbvDsrWriteBackupReport_(ss, payload)
cbvDsrUpdateDashboardBackupStatus_(ss, payload)
```

Reuse existing helpers from previous phases where available.

Function names may be adapted to existing repo conventions, but they must remain clear, modular, and traceable.

### 4.5 Required Backup Behavior

Backup runtime must:

1. Open the current active spreadsheet as the DSR control spreadsheet.
2. Read DSR config from `SYNC_CONFIG`.
3. Open destination spreadsheet by `DESTINATION_SPREADSHEET_ID`.
4. Build a backup plan.
5. Exclude DSR runtime sheets by default.
6. For each eligible destination sheet:
   - create a copy inside the destination spreadsheet
   - rename it using backup naming convention
   - preserve values and formatting as allowed by `copyTo`
   - record result in `SYNC_BACKUP_INDEX`
7. Write append-only log, audit, and report.
8. Update dashboard status.
9. Return structured payload.

### 4.6 Required Backup Naming Convention

Backup sheet names must follow:

```text
BAK_<originalSheetName>_<yyyyMMdd_HHmmss>
```

or if needed to avoid Google Sheet name length limits:

```text
BAK_<shortOriginalSheetName>_<yyyyMMdd_HHmmss>
```

If duplicate backup name exists, append a numeric suffix:

```text
BAK_<sheetName>_<yyyyMMdd_HHmmss>_02
BAK_<sheetName>_<yyyyMMdd_HHmmss>_03
```

Never overwrite an existing backup sheet.

### 4.7 Required Backup Scope

Default backup scope:

```text
ALL_DESTINATION_BUSINESS_SHEETS
```

Excluded by default:

```text
DASHBOARD_SYNC
SYNC_CONFIG
SYNC_PLAN
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
BAK_*
```

Do not delete, hide, or modify the original destination sheets.

### 4.8 Required Backup Index Writes

Append to `SYNC_BACKUP_INDEX`.

Required fields:

```text
BACKUP_ID
RUN_ID
BACKUP_AT
SOURCE_SHEET
BACKUP_SHEET
ROWS
COLS
STATUS
MESSAGE
```

Status values:

```text
BACKUP_CREATED
SKIPPED_RUNTIME_SHEET
SKIPPED_EXISTING_BACKUP
SKIPPED_EMPTY_OR_INVALID
FAILED
```

### 4.9 Required Backup Runtime Output

The backup runtime payload must include:

```text
runId
backupAt
actor
phase
result
destination
backupPlan
backupResults
summary
warnings
errors
nextStep
```

Destination must include:

```text
spreadsheetId
ok
title
url
sheetCount
```

Each backup result must include:

```text
sourceSheet
backupSheet
rows
cols
status
message
```

### 4.10 Required Backup Result Status

Backup runtime may return:

```text
BACKUP_COMPLETED
BACKUP_COMPLETED_WITH_WARNINGS
NEEDS_CONFIG
DESTINATION_ERROR
FAILED
```

Rules:

```text
BACKUP_COMPLETED:
- destination opens
- at least one eligible sheet is backed up
- all eligible backups succeed

BACKUP_COMPLETED_WITH_WARNINGS:
- destination opens
- at least one eligible sheet is backed up
- non-blocking sheet-level warnings exist

NEEDS_CONFIG:
- required config missing or invalid

DESTINATION_ERROR:
- destination ID exists but cannot be opened or inspected

FAILED:
- unexpected runtime failure
- no safe backup could be performed despite valid config
```

### 4.11 Required Sheet Writes

Append-only writes only:

```text
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
```

Allowed dashboard update:

```text
DASHBOARD_SYNC
```

Allowed config update:

```text
SYNC_CONFIG
```

Only for:

```text
LAST_BACKUP_AT
LAST_BACKUP_RUN_ID
```

No business data sheet may be cleared, overwritten, or deleted.

---

## 5. RESULT CONTRACT

Final RESULT must be one of:

```text
GO
GO_WITH_WARNINGS
FAIL
```

### GO

Use `GO` only if:

- All required deliverables are completed.
- Required checks pass.
- No blocking governance or authority violation exists.
- Backup runtime code exists.
- Runtime menu item exists.
- Backup runtime safely reads config.
- DESTINATION can be opened and inspected.
- Backup sheets are created safely.
- Results are written append-only to:
  - `SYNC_LOG`
  - `SYNC_AUDIT`
  - `SYNC_REPORT`
  - `SYNC_BACKUP_INDEX`
- Dashboard backup status is updated.
- No business data is modified except by creating backup copies.
- No sync, diff, or trigger is performed.

### GO_WITH_WARNINGS

Use `GO_WITH_WARNINGS` if:

- Required deliverables are completed.
- Non-blocking warnings or risks remain.
- Follow-up actions are clearly recorded.
- Example: backup runtime code complete but real Spreadsheet execution was not possible in local/Cursor session.
- Example: destination config placeholder exists but real ID is not filled yet.
- Example: some sheets skipped according to backup scope.

### FAIL

Use `FAIL` if:

- Safe completion is not possible.
- Mandatory deliverables are missing.
- Required checks fail.
- Authority, ADR, registry, or contract conflicts cannot be safely resolved.
- Code cannot be made non-destructive.
- Backup runtime attempts to clear, overwrite, or delete business data.
- Phase jumps into diff or sync apply.

---

## 6. TEST REQUIREMENTS

Perform minimum tests:

```text
1. Foundation sheets exist or are safely bootstrapped.
2. Required backup config keys are seeded or read from SYNC_CONFIG.
3. Missing destination config returns NEEDS_CONFIG, not destructive failure.
4. Invalid destination spreadsheet ID is handled safely.
5. Destination open failure is reported as DESTINATION_ERROR.
6. Backup plan excludes DSR runtime sheets by default.
7. Backup plan excludes existing BAK_* sheets.
8. Backup sheet names follow BAK_<sheetName>_<yyyyMMdd_HHmmss>.
9. Duplicate backup names are handled without overwrite.
10. Backup creation uses copy behavior, not destructive write.
11. SYNC_BACKUP_INDEX receives append-only backup records.
12. SYNC_LOG receives append-only backup log.
13. SYNC_AUDIT receives append-only backup audit event.
14. SYNC_REPORT receives append-only backup report.
15. DASHBOARD_SYNC receives safe backup status update.
16. SOURCE spreadsheet is not modified.
17. Destination business sheets are not cleared, overwritten, or deleted.
18. No SOURCE → DESTINATION sync is performed.
19. No diff preview is performed.
20. No trigger is created.
```

Create test evidence artifact for the phase.

Suggested file name:

```text
PHASE_DSR_03_BACKUP_RUNTIME_TEST_EVIDENCE.md
```

---

## 7. REQUIRED PHASE ARTIFACTS

Create append-only phase artifacts using existing repo folder conventions.

Preferred names:

```text
PHASE_DSR_03_BACKUP_RUNTIME_REPORT.md
PHASE_DSR_03_BACKUP_RUNTIME_HANDOFF.md
PHASE_DSR_03_BACKUP_RUNTIME_TEST_EVIDENCE.md
```

If the repo has a mandatory artifact path convention, follow the repo convention.

Create or update ADR / Authority / Contract only if required by the phase or by repo governance conventions.

Suggested optional ADR if a new decision is introduced:

```text
ADR_DSR_BACKUP_RUNTIME_ADDENDUM.md
```

Suggested optional authority update if backup authority is formalized:

```text
DSR_RUNTIME_AUTHORITY.md
```

The report must include:

```text
phase
result
summary
files changed
runtime changes
sheet changes
menu changes
backup behavior
tests performed
warnings
risks
assumptions
skipped items
next recommended phase
```

The handoff must include:

```text
what changed
how to run
how to verify
what not to do
known warnings
next phase recommendation
```

The test evidence must include:

```text
test name
expected result
actual result
status
notes
```

---

## 8. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.
2. Create a phase handoff bundle containing ONLY files created or modified by `PHASE_DSR_03_BACKUP_RUNTIME`.
3. Include only:
   - REPORT
   - HANDOFF
   - ADR
   - TEST EVIDENCE
   - CONTRACT
   - AUTHORITY
   - REGISTRY / INDEX updates
   - modified source code
   - files directly changed by the phase
4. Exclude:
   - full repo
   - unchanged files
   - `.git`
   - `node_modules`
   - `dist`
   - `build`
   - `.next`
   - `.cursor`
   - `.vscode`
   - cache
   - dependencies
   - unrelated generated artifacts
5. Preserve filenames.
6. Prefix duplicate filenames with the source folder name.
7. Generate `PHASE_BUNDLE_INDEX.md`.

### `PHASE_BUNDLE_INDEX.md` must contain:

```text
phase
timestamp
result
copied files
file types
source paths
status NEW/UPDATED
warnings
errors
```

8. Keep the bundle minimal according to:

```text
TARGET_BUNDLE_SIZE: <=10 files
```

9. Create a ZIP archive inside:

```text
phase_tmp/
```

10. ZIP naming convention:

```text
0001_PHASE_DSR_03_BACKUP_RUNTIME.zip
0002_PHASE_DSR_03_BACKUP_RUNTIME.zip
0003_PHASE_DSR_03_BACKUP_RUNTIME.zip
```

11. Determine the next sequence by scanning existing ZIP files and using:

```text
max(existing_sequence) + 1
```

12. Never overwrite existing ZIP files.
13. Preserve previous ZIP archives.
14. The ZIP must contain:
   - `PHASE_BUNDLE_INDEX.md`
   - all bundle files
15. After successful ZIP creation, keep only the ZIP archive in `phase_tmp/` if:

```text
ZIP_RETENTION: KEEP_ZIP_ONLY
```

16. Record all copy, packaging, and validation errors.

---

## 9. FINAL RESPONSE FORMAT

Return the final response in exactly this structure:

```text
Result: GO / GO_WITH_WARNINGS / FAIL

Files Changed:
- ...

Authority Updates:
- ...

ADR Updates:
- ...

Registry Updates:
- ...

Tests Performed:
- ...

Warnings & Risks:
- ...

Recommended Next Phase:
- PHASE_DSR_04_DIFF_PREVIEW

Output Bundle Path:
- ...

ZIP Filename:
- ...

Bundle File Count:
- ...

Bundle Size:
- ...
```

Do not include unrelated commentary.
