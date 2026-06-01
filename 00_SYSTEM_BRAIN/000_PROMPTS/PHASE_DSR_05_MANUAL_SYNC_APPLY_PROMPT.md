# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_05_MANUAL_SYNC_APPLY
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_05_MANUAL_SYNC_APPLY`.
4. Do not jump phases.
5. Do not redesign unrelated architecture.
6. Preserve existing contracts, ADRs, authorities, registries, indexes, governance artifacts, and runtime boundaries.
7. Prefer additive and reversible changes.
8. Keep all changes modular, traceable, and audit-friendly.
9. Document conflicts before modifying affected files.
10. Stop and report `FAIL` if safe completion is not possible.

This phase extends:

```text
CBV_DATA_SYNC_RUNTIME v1
```

Mandatory scope:

```text
PHASE_DSR_05_MANUAL_SYNC_APPLY
```

This is the first phase that may write SOURCE data into DESTINATION business sheets.

Therefore, this phase MUST introduce strict sync guards before any write operation is allowed.

---

## 3. PHASE SCOPE

### 3.1 Allowed Work

You may implement:

- Manual sync apply runtime.
- Guard checks before sync.
- Source-to-destination sheet value copy.
- Destination sheet creation if the source sheet does not exist in destination.
- Destination content clear only after all required guards pass.
- Append-only logging to runtime sheets.
- Runtime report after sync attempt.
- Dashboard status update.
- Menu item for manual sync apply.
- A sync guard contract artifact.
- Report, handoff, test evidence, ADR, authority, registry/index updates as needed.

### 3.2 Forbidden Work

You MUST NOT:

- Create automatic triggers.
- Run sync automatically.
- Sync without explicit manual menu/function call.
- Sync if guard checks fail.
- Sync if latest backup is missing.
- Sync if latest diff result is not safe.
- Delete destination sheets.
- Delete source sheets.
- Modify SOURCE spreadsheet data.
- Clear destination sheets before guard success.
- Clear runtime sheets.
- Clear historical logs.
- Overwrite audit/report history.
- Implement scheduler/automation.
- Jump to report UX polish or test console phases.

---

## 4. REQUIRED SYNC GUARD CONTRACT

Create a new contract artifact if repo conventions allow:

```text
SYNC_GUARD_CONTRACT.md
```

Preferred path:

```text
00_SYSTEM_BRAIN/003_AUDIT/DSR/SYNC_GUARD_CONTRACT.md
```

or follow existing repo conventions.

The contract must require:

```text
SYNC_ALLOWED = TRUE
LATEST_BACKUP_EXISTS = TRUE
LATEST_DIFF_STATUS IN (READY_FOR_SYNC, REVIEW_REQUIRED_WITH_OPERATOR_APPROVAL)
MANUAL_OPERATOR_ACTION = TRUE
SOURCE_SPREADSHEET_ID valid
DESTINATION_SPREADSHEET_ID valid
SYNC_MODE = ONE_WAY_SOURCE_TO_DESTINATION
SAFETY_MODE = BACKUP_BEFORE_WRITE
```

For Phase 05 default behavior:

```text
REVIEW_REQUIRED_WITH_OPERATOR_APPROVAL is NOT allowed unless explicitly implemented as a separate manual confirmation flag.
```

Recommended strict initial rule:

```text
Only latest diff status READY_FOR_SYNC may proceed.
```

If any guard fails:

```text
DO NOT SYNC
DO NOT CLEAR DESTINATION
WRITE FAILURE REASON TO SYNC_LOG
WRITE AUDIT EVENT TO SYNC_AUDIT
WRITE REPORT TO SYNC_REPORT
UPDATE DASHBOARD_SYNC
RETURN GUARD_BLOCKED
```

---

## 5. REQUIRED CONFIG KEYS

Read from `SYNC_CONFIG`:

```text
SOURCE_SPREADSHEET_ID
DESTINATION_SPREADSHEET_ID
SYNC_MODE
SAFETY_MODE
SYNC_ALLOWED
```

If `SYNC_ALLOWED` does not exist, add it with default:

```text
FALSE
```

Do not set `SYNC_ALLOWED` to `TRUE` automatically.

Operator must intentionally set it.

Expected values:

```text
SYNC_MODE = ONE_WAY_SOURCE_TO_DESTINATION
SAFETY_MODE = BACKUP_BEFORE_WRITE
SYNC_ALLOWED = TRUE
```

---

## 6. REQUIRED FOUNDATION SHEETS

Verify existence:

```text
DASHBOARD_SYNC
SYNC_CONFIG
SYNC_PLAN
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
```

Reuse existing foundation bootstrap if needed.

Do not recreate destructively.

---

## 7. REQUIRED RUNTIME MENU UPDATE

Extend:

```text
🚀 CBV Runtime
└─ 🔁 Data Sync Runtime
   ├─ 1. Bootstrap DSR Foundation
   ├─ 2. Open Sync Dashboard
   ├─ 3. Health Check Foundation
   ├─ 4. Connection Check SOURCE/DEST
   ├─ 5. Backup DESTINATION
   ├─ 6. Diff Preview SOURCE ↔ DEST
   ├─ 7. Manual Sync Apply SOURCE → DEST
```

The menu item must call a guarded runtime function.

---

## 8. REQUIRED GAS FUNCTIONS

Create or update modular GAS functions:

```javascript
cbvDsrManualSyncApply()

cbvDsrValidateSyncGuards_()

cbvDsrGetLatestBackupStatus_()

cbvDsrGetLatestDiffStatus_()

cbvDsrBuildSyncApplyPlan_()

cbvDsrApplySheetSync_()

cbvDsrCreateDestinationSheetIfMissing_()

cbvDsrClearDestinationSheetSafely_()

cbvDsrWriteValuesToDestination_()

cbvDsrWriteSyncApplyReport_()

cbvDsrUpdateDashboardSyncApplyStatus_()
```

Reuse existing helpers:

```javascript
cbvDsrReadConfig_(ss)
cbvDsrValidateConnectionConfig_(config)
cbvDsrOpenSpreadsheetByIdSafe_(spreadsheetId, role)
cbvDsrInspectSpreadsheet_(spreadsheet, role)
cbvDsrAppendLog_(ss, payload)
cbvDsrAppendAudit_(ss, payload)
cbvDsrAppendReport_(ss, payload)
cbvDsrNow_()
cbvDsrRunId_()
cbvDsrEnsureFoundationSheets_()
```

Function names may follow existing repo conventions, but must remain clear, modular, and traceable.

---

## 9. REQUIRED SYNC APPLY BEHAVIOR

### 9.1 Sheet Selection

Default sync scope:

```text
All SOURCE sheets except excluded runtime/system sheets.
```

Exclude these sheets from apply:

```text
DASHBOARD_SYNC
SYNC_CONFIG
SYNC_PLAN
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_BACKUP_INDEX
Any sheet starting with BAK_
```

If repo contains an existing exclusion convention, preserve it.

### 9.2 Destination Handling

For each source sheet:

If destination sheet exists:

```text
1. Guard already passed.
2. Clear destination sheet content only.
3. Write source values.
```

If destination sheet does not exist:

```text
1. Create destination sheet.
2. Write source values.
```

Do not delete destination-only sheets.

Do not delete destination sheet formatting unless unavoidable.

Do not delete historical backup sheets.

### 9.3 Data Copy Scope

Copy values only:

```text
sourceSheet.getDataRange().getValues()
```

Do not copy formulas, notes, protections, filters, permissions, or formatting in Phase 05 unless existing architecture requires it.

### 9.4 Runtime Sheet Writes

Append-only writes to:

```text
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
```

Allowed dashboard update:

```text
DASHBOARD_SYNC
```

Allowed config placeholder repair:

```text
SYNC_CONFIG
```

Do not clear:

```text
SYNC_LOG
SYNC_AUDIT
SYNC_REPORT
SYNC_PLAN
SYNC_BACKUP_INDEX
```

---

## 10. REQUIRED SYNC APPLY RESULT STATUSES

Runtime result must be one of:

```text
SYNC_APPLIED
GUARD_BLOCKED
CONFIG_REQUIRED
BACKUP_REQUIRED
DIFF_REQUIRED
SYNC_FAILED
PARTIAL_SYNC
```

Rules:

```text
SYNC_APPLIED
All eligible source sheets were written to destination successfully.

GUARD_BLOCKED
One or more guard conditions failed.

CONFIG_REQUIRED
Required config missing or invalid.

BACKUP_REQUIRED
No valid latest backup exists.

DIFF_REQUIRED
No valid latest diff exists or latest diff not READY_FOR_SYNC.

SYNC_FAILED
Unexpected failure before safe completion.

PARTIAL_SYNC
Some sheets synced and some failed. Must include exact failure list.
```

If `PARTIAL_SYNC` occurs, report must clearly show which sheets succeeded and which failed.

---

## 11. REQUIRED SYNC APPLY PAYLOAD

The runtime report payload must include:

```text
runId
startedAt
finishedAt
actor
phase
result
sourceSpreadsheetId
destinationSpreadsheetId
guardStatus
latestBackup
latestDiff
totalEligibleSheets
syncedSheets
failedSheets
skippedSheets
warnings
errors
nextStep
```

Each synced sheet summary must include:

```text
sheetName
sourceRows
sourceCols
destRowsBefore
destColsBefore
destRowsAfter
destColsAfter
status
message
```

---

## 12. COMPLETION RULES

You MUST complete all deliverables required by:

```text
PHASE_DSR_05_MANUAL_SYNC_APPLY
```

You MUST create or update required artifacts:

```text
REPORT
HANDOFF
TEST EVIDENCE
CONTRACT
REGISTRY / INDEX updates if required
ADR if needed
AUTHORITY if needed
```

You MUST record:

```text
warnings
risks
assumptions
skipped items
follow-up actions
```

Do not report GO if mandatory deliverables are missing.

For this phase, the sync guard contract is mandatory.

---

## 13. RESULT CONTRACT

RESULT must be:

```text
GO
GO_WITH_WARNINGS
FAIL
```

### GO

Allowed only if:

```text
Manual sync apply runtime implemented.
Sync guard contract created.
Guard checks block unsafe sync.
Sync only runs through manual operator action.
Latest backup requirement enforced.
Latest diff requirement enforced.
SYNC_ALLOWED requirement enforced.
Destination-only sheets are preserved.
Runtime/system sheets are excluded.
Logs/audit/report are append-only.
No trigger is created.
All mandatory artifacts generated.
Tests pass.
```

### GO_WITH_WARNINGS

Allowed if:

```text
Implementation complete.
Non-blocking warnings remain.
Real Spreadsheet verification pending.
Live sync not executed in Cursor/local environment.
Follow-up actions documented.
```

### FAIL

Required if:

```text
Safe completion impossible.
Mandatory artifacts missing.
Sync guard contract missing.
Guard bypass possible.
Business data can be cleared before guard success.
Authority conflict cannot be resolved.
Phase jumps into automation, trigger, or unrelated redesign.
Required checks fail.
```

---

## 14. TEST REQUIREMENTS

Perform minimum tests:

```text
1. Foundation sheets detected.

2. Config loaded.

3. Missing SYNC_ALLOWED defaults to FALSE.

4. SYNC_ALLOWED = FALSE blocks sync.

5. Missing backup blocks sync.

6. Missing diff blocks sync.

7. Latest diff not READY_FOR_SYNC blocks sync.

8. Invalid source ID blocks sync.

9. Invalid destination ID blocks sync.

10. Runtime/system sheets are excluded.

11. BAK_ sheets are excluded.

12. Destination-only sheets are preserved.

13. Destination sheet create path works.

14. Existing destination sheet clear/write path is guarded.

15. Sync writes values only.

16. SYNC_LOG receives append-only apply log.

17. SYNC_AUDIT receives append-only apply audit.

18. SYNC_REPORT receives append-only apply report.

19. Dashboard updates apply status.

20. No trigger is created.

21. No SOURCE data is modified.

22. No destination clear occurs before guards pass.

23. Partial failure reports exact failed sheet names.

24. Final report includes nextStep.
```

Create:

```text
PHASE_DSR_05_MANUAL_SYNC_APPLY_TEST_EVIDENCE.md
```

---

## 15. REQUIRED PHASE ARTIFACTS

Create append-only artifacts.

Preferred names:

```text
PHASE_DSR_05_MANUAL_SYNC_APPLY_REPORT.md
PHASE_DSR_05_MANUAL_SYNC_APPLY_HANDOFF.md
PHASE_DSR_05_MANUAL_SYNC_APPLY_TEST_EVIDENCE.md
SYNC_GUARD_CONTRACT.md
```

Create ADR if a new architecture decision is introduced:

```text
ADR_DSR_MANUAL_SYNC_APPLY_ADDENDUM.md
```

Update authority if sync apply permission is added:

```text
DSR_RUNTIME_AUTHORITY.md
```

Update registry/index if repo conventions require:

```text
PHASE_REGISTRY.md
```

Report must include:

```text
phase
result
summary
files changed
runtime changes
sheet changes
menu changes
guard contract
tests performed
warnings
risks
assumptions
skipped items
next recommended phase
```

Handoff must include:

```text
what changed
how to run
how to verify
what not to do
guard conditions
known warnings
next phase recommendation
```

Test Evidence must include:

```text
test name
expected result
actual result
status
notes
```

---

## 16. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.

2. Create a phase handoff bundle containing ONLY files created or modified by:

```text
PHASE_DSR_05_MANUAL_SYNC_APPLY
```

3. Include only:

```text
REPORT
HANDOFF
ADR
TEST EVIDENCE
CONTRACT
AUTHORITY
REGISTRY / INDEX updates
modified source code
files directly changed by the phase
```

4. Exclude:

```text
full repo
unchanged files
.git
node_modules
dist
build
.next
.cursor
.vscode
cache
dependencies
generated artifacts unrelated to this phase
```

5. Preserve filenames.

6. Prefix duplicate filenames with the source folder name.

7. Generate:

```text
PHASE_BUNDLE_INDEX.md
```

Containing:

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

9. Create ZIP archive inside:

```text
phase_tmp/
```

10. ZIP naming convention:

```text
0001_PHASE_DSR_05_MANUAL_SYNC_APPLY.zip
0002_PHASE_DSR_05_MANUAL_SYNC_APPLY.zip
0003_PHASE_DSR_05_MANUAL_SYNC_APPLY.zip
```

11. Determine next sequence by scanning existing ZIP files and using:

```text
max(existing_sequence) + 1
```

12. Never overwrite existing ZIP files.

13. Preserve previous ZIP archives.

14. ZIP must contain:

```text
PHASE_BUNDLE_INDEX.md
all bundle files
```

15. After successful ZIP creation, keep only the ZIP archive in `phase_tmp/` if:

```text
ZIP_RETENTION: KEEP_ZIP_ONLY
```

16. Record all copy, packaging, and validation errors.

---

## 17. FINAL RESPONSE FORMAT

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
- PHASE_DSR_06_RUNTIME_REPORT

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
