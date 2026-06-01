# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_06_RUNTIME_REPORT
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_06_RUNTIME_REPORT`.
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
PHASE_DSR_06_RUNTIME_REPORT
```

Allowed work:

- Build runtime reporting layer for DSR.
- Read existing DSR runtime sheets:
  - `SYNC_LOG`
  - `SYNC_AUDIT`
  - `SYNC_REPORT`
  - `SYNC_PLAN`
  - `SYNC_BACKUP_INDEX`
  - `DASHBOARD_SYNC`
  - `SYNC_CONFIG`
- Generate operational summary report.
- Generate run history summary.
- Generate success/failure metrics.
- Generate warning/error summary.
- Generate audit timeline summary.
- Update dashboard report section.
- Add safe runtime menu item for report generation.
- Create/update REPORT, HANDOFF, ADR, TEST EVIDENCE.
- Update registries/indexes if required by repo conventions.

Forbidden work:

- Do not sync SOURCE → DESTINATION.
- Do not clear, overwrite, or delete business data.
- Do not create backup sheets.
- Do not create triggers.
- Do not implement automation/scheduler.
- Do not change sync guard rules.
- Do not loosen authority boundary.
- Do not modify SOURCE spreadsheet content.
- Do not modify DESTINATION business sheets except allowed DSR runtime sheets.
- Do not implement Test Console in this phase.

Allowed writes:

```text
SYNC_REPORT
SYNC_LOG
SYNC_AUDIT
DASHBOARD_SYNC
```

Allowed read-only sources:

```text
SYNC_CONFIG
SYNC_PLAN
SYNC_BACKUP_INDEX
previous SYNC_REPORT rows
previous SYNC_LOG rows
previous SYNC_AUDIT rows
```

---

## 3. PHASE DELIVERABLES

Implement:

```text
PHASE_DSR_06_RUNTIME_REPORT
```

### 3.1 Foundation Validation

Verify existing DSR runtime sheets exist:

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

### 3.2 Required Runtime Menu Update

Extend existing GAS menu:

```text
🚀 CBV Runtime
└─ 🔁 Data Sync Runtime
   ├─ 1. Bootstrap DSR Foundation
   ├─ 2. Open Sync Dashboard
   ├─ 3. Health Check Foundation
   ├─ 4. Connection Check SOURCE/DEST
   ├─ 5. Backup DESTINATION
   ├─ 6. Diff Preview SOURCE ↔ DEST
   ├─ 7. Manual Sync Apply
   ├─ 8. Generate Runtime Report
```

Menu item must be safe and non-destructive.

---

### 3.3 Required GAS Functions

Create or update modular GAS functions:

```javascript
cbvDsrGenerateRuntimeReport()

cbvDsrCollectRuntimeReportData_()

cbvDsrReadRecentLogRows_()

cbvDsrReadRecentAuditRows_()

cbvDsrReadRecentReportRows_()

cbvDsrReadLatestDiffPlan_()

cbvDsrReadLatestBackupIndex_()

cbvDsrBuildRuntimeMetrics_()

cbvDsrBuildRunHistorySummary_()

cbvDsrBuildWarningErrorSummary_()

cbvDsrBuildAuditTimelineSummary_()

cbvDsrAppendRuntimeReport_()

cbvDsrUpdateDashboardRuntimeReport_()
```

Reuse existing helpers where possible:

```javascript
cbvDsrReadConfig_(ss)
cbvDsrAppendLog_(ss, payload)
cbvDsrAppendAudit_(ss, payload)
cbvDsrAppendReport_(ss, payload)
cbvDsrNow_()
cbvDsrRunId_()
cbvDsrEnsureFoundationSheets_()
```

Function names may be adapted to existing repo conventions, but they must remain clear, modular, and traceable.

---

### 3.4 Required Runtime Report Scope

The report must summarize:

```text
Current DSR Status
Latest Connection Check
Latest Backup Status
Latest Diff Status
Latest Manual Sync Status
Run History
Success Count
Warning Count
Failure Count
Last Successful Run
Last Failed Run
Latest Backup ID
Latest Diff Result
Latest Sync Result
Warnings
Errors
Recommended Next Step
```

Do not analyze row-level business data.

Do not expose sensitive data.

---

### 3.5 Required Runtime Metrics

Minimum metrics:

```text
totalLogEntries
totalAuditEntries
totalRuntimeReports
totalDiffPlanEntries
totalBackupEntries
recentSuccessCount
recentWarningCount
recentErrorCount
latestRunId
latestRunAt
latestResult
latestPhase
latestNextStep
```

Recommended window:

```text
latest 100 log rows
latest 100 audit rows
latest 50 report rows
latest 50 plan rows
latest 50 backup rows
```

Avoid reading unbounded large ranges if not necessary.

---

### 3.6 Required Report JSON Contract

Each runtime report appended to `SYNC_REPORT` must include:

```text
REPORT_ID
RUN_ID
REPORT_AT
PHASE
RESULT
SUMMARY
WARNINGS_JSON
ERRORS_JSON
NEXT_STEP
REPORT_JSON
```

`REPORT_JSON` must include:

```json
{
  "contractVersion": "DSR_RUNTIME_REPORT_V1",
  "phase": "PHASE_DSR_06_RUNTIME_REPORT",
  "generatedAt": "...",
  "runId": "...",
  "result": "...",
  "metrics": {},
  "currentStatus": {},
  "runHistory": [],
  "warningErrorSummary": {},
  "auditTimeline": [],
  "nextStep": "..."
}
```

---

### 3.7 Required Dashboard Updates

Update `DASHBOARD_SYNC` with a readable section:

```text
Runtime Report
Last Report At
Last Report Result
Latest Run ID
Latest Phase
Latest Backup Status
Latest Diff Status
Latest Sync Status
Warnings
Errors
Next Recommended Action
```

Keep dashboard operator-friendly.

Do not overwrite unrelated dashboard sections unless the existing dashboard layout uses fixed sections.

---

### 3.8 Required Runtime Status

Allowed report results:

```text
READY
READY_WITH_WARNINGS
ATTENTION_REQUIRED
FAILED
NO_RUNTIME_HISTORY
```

Rules:

```text
READY:
- recent runtime state is healthy
- no blocking error found

READY_WITH_WARNINGS:
- no blocking error found
- warnings exist

ATTENTION_REQUIRED:
- latest report/diff/sync indicates review required or guard blocked

FAILED:
- report generation failed or blocking runtime error found

NO_RUNTIME_HISTORY:
- runtime sheets exist but no relevant history is available
```

---

## 4. COMPLETION RULES

You MUST complete all deliverables required by:

```text
PHASE_DSR_06_RUNTIME_REPORT
```

You MUST create or update required artifacts according to existing repo conventions:

```text
REPORT
HANDOFF
TEST EVIDENCE
REGISTRY / INDEX updates if required
ADR if needed
AUTHORITY if needed
CONTRACT if needed
```

For this phase, if the runtime report JSON contract is formalized as a new contract artifact, create:

```text
DSR_RUNTIME_REPORT_CONTRACT.md
```

If no ADR or authority update is required, explicitly state that in the final response.

You MUST record:

```text
warnings
risks
assumptions
skipped items
follow-up actions
```

Do not report `GO` if mandatory deliverables are missing.

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
- Runtime report generation code exists.
- Menu item exists.
- Report reads runtime sheets safely.
- Report appends to `SYNC_REPORT`.
- Report appends to `SYNC_LOG`.
- Report appends governance event to `SYNC_AUDIT`.
- Dashboard report section is updated.
- No business data is modified.
- No sync, backup, diff mutation, trigger, or destructive operation is performed.

### GO_WITH_WARNINGS

Use `GO_WITH_WARNINGS` if:

- Required deliverables are completed.
- Non-blocking warnings or risks remain.
- Follow-up actions are clearly recorded.
- Example: live GAS execution was not possible in local/Cursor session.
- Example: no runtime history exists yet, but report code handles `NO_RUNTIME_HISTORY`.

### FAIL

Use `FAIL` if:

- Safe completion is not possible.
- Mandatory deliverables are missing.
- Required checks fail.
- Authority, ADR, registry, or contract conflicts cannot be safely resolved.
- Code modifies SOURCE or business sheets.
- Code performs sync/backup/diff apply unexpectedly.
- Runtime report cannot be kept append-only.

---

## 6. TEST REQUIREMENTS

Perform minimum tests:

```text
1. Foundation sheets detected.

2. Runtime report menu item exists.

3. Report generation reads SYNC_LOG safely.

4. Report generation reads SYNC_AUDIT safely.

5. Report generation reads SYNC_REPORT safely.

6. Report generation reads SYNC_PLAN safely.

7. Report generation reads SYNC_BACKUP_INDEX safely.

8. Empty runtime history returns NO_RUNTIME_HISTORY safely.

9. Metrics builder returns required metric keys.

10. Run history summary works.

11. Warning/error summary works.

12. Audit timeline summary works.

13. REPORT_JSON follows DSR_RUNTIME_REPORT_V1.

14. SYNC_REPORT receives append-only runtime report.

15. SYNC_LOG receives append-only report generation log.

16. SYNC_AUDIT receives append-only report generation audit event.

17. DASHBOARD_SYNC report section updates safely.

18. No SOURCE spreadsheet write.

19. No DESTINATION business sheet write.

20. No sync apply.

21. No backup creation.

22. No trigger creation.

23. No destructive operation.

24. Bundle is minimal and <= TARGET_BUNDLE_SIZE.
```

Create test evidence artifact:

```text
PHASE_DSR_06_RUNTIME_REPORT_TEST_EVIDENCE.md
```

---

## 7. REQUIRED PHASE ARTIFACTS

Create append-only phase artifacts using existing repo folder conventions.

Preferred names:

```text
PHASE_DSR_06_RUNTIME_REPORT_REPORT.md
PHASE_DSR_06_RUNTIME_REPORT_HANDOFF.md
PHASE_DSR_06_RUNTIME_REPORT_TEST_EVIDENCE.md
```

If a runtime report contract is created:

```text
DSR_RUNTIME_REPORT_CONTRACT.md
```

If ADR is needed:

```text
ADR_DSR_RUNTIME_REPORT_ADDENDUM.md
```

If authority boundary is updated:

```text
DSR_RUNTIME_AUTHORITY.md
```

If registry/index update is required:

```text
PHASE_REGISTRY.md
```

The phase report must include:

```text
phase
result
summary
files changed
runtime changes
sheet changes
menu changes
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

The runtime report contract must include:

```text
contract name
contract version
scope
allowed reads
allowed writes
forbidden operations
REPORT_JSON schema
result statuses
append-only rules
operator verification steps
```

---

## 8. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.
2. Create a phase handoff bundle containing ONLY files created or modified by `PHASE_DSR_06_RUNTIME_REPORT`.
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
0001_PHASE_DSR_06_RUNTIME_REPORT.zip
0002_PHASE_DSR_06_RUNTIME_REPORT.zip
0003_PHASE_DSR_06_RUNTIME_REPORT.zip
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
- PHASE_DSR_07_TEST_CONSOLE

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
