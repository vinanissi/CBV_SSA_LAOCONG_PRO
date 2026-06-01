# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_07_TEST_CONSOLE
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_07_TEST_CONSOLE`.
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
PHASE_DSR_07_TEST_CONSOLE
```

This phase implements a dedicated test runtime for DSR.

Critical governance rule:

```text
Test Runtime MUST be separate from Business Runtime.
```

Allowed work:

- Create dedicated DSR Test Console module.
- Create dedicated top-level menu:
  - `🧪 CBV Test Console`
- Add DSR-specific test actions under the test console menu.
- Create append-only DSR test report sheet if missing.
- Generate test reports using a standard envelope.
- Add AI handoff prompt generation for test results.
- Add report review/copy helpers if appropriate.
- Add dry-run checks that do not mutate business data.
- Create/update REPORT, HANDOFF, ADR, AUTHORITY, CONTRACT, TEST EVIDENCE.
- Update registries/indexes if required by repo conventions.

Forbidden work:

- Do not place test actions under `🚀 CBV Runtime`.
- Do not mix test menu with business runtime menu.
- Do not sync SOURCE → DESTINATION.
- Do not create backup sheets as part of tests unless using an explicitly safe dry-run/mock path.
- Do not clear, overwrite, or delete business data.
- Do not create automatic triggers.
- Do not implement scheduler/automation.
- Do not change sync guard rules.
- Do not loosen authority boundary.
- Do not modify SOURCE spreadsheet content.
- Do not modify DESTINATION business sheets except dedicated DSR test/report runtime sheets.
- Do not make AI runtime decisions.
- Do not auto-run destructive operations from tests.

Allowed writes:

```text
DSR_TEST_REPORT
SYNC_LOG
SYNC_AUDIT
DASHBOARD_SYNC only for safe test-status display if existing layout supports it
```

Allowed read-only sources:

```text
SYNC_CONFIG
SYNC_PLAN
SYNC_BACKUP_INDEX
SYNC_REPORT
SYNC_LOG
SYNC_AUDIT
DASHBOARD_SYNC
```

---

## 3. PHASE DELIVERABLES

Implement:

```text
PHASE_DSR_07_TEST_CONSOLE
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

Verify or create dedicated test report sheet:

```text
DSR_TEST_REPORT
```

Do not recreate destructively.

Do not overwrite existing test reports.

---

### 3.2 Required Test Report Sheet

Create `DSR_TEST_REPORT` if missing.

Required headers:

```text
REPORT_ID
RUN_ID
CHECKED_AT
RUN_BY
TEST_SUITE
PHASE
STATUS
SUMMARY
OK_COUNT
WARNING_COUNT
ERROR_COUNT
CRITICAL_COUNT
NEXT_STEP
REPORT_TEXT
REPORT_JSON
AI_HANDOFF_PROMPT
CONTRACT_VERSION
ENVELOPE_OK
```

Append-only.

Never clear previous reports.

---

### 3.3 Required Test Console Menu

Create or extend a separate top-level GAS menu:

```text
🧪 CBV Test Console
└─ 🔁 DSR Test Console
   ├─ 1. Run DSR Full Test
   ├─ 2. Test Foundation
   ├─ 3. Test Connection Guard
   ├─ 4. Test Backup Guard
   ├─ 5. Test Diff Preview Guard
   ├─ 6. Test Sync Guard Dry-run
   ├─ 7. Test Runtime Report
   ├─ 8. Build AI Handoff Prompt
   ├─ 9. Open DSR Test Report
```

Business runtime menu must remain separate:

```text
🚀 CBV Runtime
```

Do not put test items there.

---

### 3.4 Required GAS Functions

Create or update modular GAS functions:

```javascript
cbvDsrTestRunFullSuite()

cbvDsrTestFoundation()

cbvDsrTestConnectionGuard()

cbvDsrTestBackupGuard()

cbvDsrTestDiffPreviewGuard()

cbvDsrTestSyncGuardDryRun()

cbvDsrTestRuntimeReport()

cbvDsrTestBuildAiHandoffPrompt()

cbvDsrTestOpenReportSheet()

cbvDsrTestEnsureReportSheet_()

cbvDsrTestBuildReportEnvelope_()

cbvDsrTestAppendReport_()

cbvDsrTestBuildCheck_()

cbvDsrTestSummarizeChecks_()

cbvDsrTestBuildReportText_()

cbvDsrTestBuildAiHandoffPrompt_()

cbvDsrTestNow_()

cbvDsrTestRunId_()
```

Reuse existing DSR helpers where safe:

```javascript
cbvDsrReadConfig_(ss)
cbvDsrValidateConnectionConfig_(config)
cbvDsrValidateSyncGuards_(...)
cbvDsrBuildRuntimeMetrics_(...)
cbvDsrAppendLog_(ss, payload)
cbvDsrAppendAudit_(ss, payload)
```

Function names may be adapted to existing repo conventions, but they must remain clear, modular, and traceable.

---

### 3.5 Required Standard Test Report Contract

Each test report must follow this envelope:

```json
{
  "ok": true,
  "phase": "PHASE_DSR_07_TEST_CONSOLE",
  "status": "GO|GO_WITH_WARNINGS|FAIL",
  "checkedAt": "...",
  "runBy": "...",
  "traceId": "...",
  "testSuite": "DSR_TEST_CONSOLE_V1",
  "summary": "...",
  "checks": [],
  "warnings": [],
  "errors": [],
  "nextStep": "...",
  "severity": "OK|WARNING|ERROR|CRITICAL",
  "reportText": "...",
  "reportJson": {},
  "contractVersion": "DSR_TEST_CONSOLE_REPORT_V1",
  "envelopeOk": true
}
```

Each check item must follow:

```json
{
  "code": "...",
  "ok": true,
  "severity": "OK|WARNING|ERROR|CRITICAL",
  "message": "...",
  "detail": {}
}
```

---

### 3.6 Required Test Suites

#### Foundation Test

Checks:

```text
Required DSR sheets exist
Required DSR headers exist
DSR_TEST_REPORT exists
Runtime helper functions exist
Business menu and test menu are separated
```

#### Connection Guard Test

Checks:

```text
SOURCE_SPREADSHEET_ID config exists
DESTINATION_SPREADSHEET_ID config exists
Missing config is handled safely
Invalid config does not mutate data
Connection check function exists
```

#### Backup Guard Test

Checks:

```text
Backup runtime function exists
Runtime sheet exclusion list exists
BAK_* exclusion exists
SYNC_BACKUP_INDEX exists
Backup status can be inspected
```

#### Diff Preview Guard Test

Checks:

```text
Diff preview function exists
SYNC_PLAN exists
Structure-only comparison boundary exists
No row-level data sync in diff preview
```

#### Sync Guard Dry-run Test

Checks:

```text
Manual sync function exists
SYNC_ALLOWED guard exists
Latest backup guard exists
Latest diff READY_FOR_SYNC guard exists
Runtime sheet exclusion exists
SOURCE write is forbidden
Triggers are forbidden
Dry-run does not call setValues on business sheets
```

#### Runtime Report Test

Checks:

```text
Runtime report function exists
Runtime report contract exists
SYNC_REPORT append-only behavior exists
Dashboard report update function exists
No business data mutation
```

---

### 3.7 Required AI Handoff Prompt

Generate an AI handoff prompt from the latest DSR test report.

The handoff prompt must include:

```text
phase
status
summary
failed checks
warning checks
critical checks
next step
explicit instruction: do not redesign
explicit instruction: do not phase jump if FAIL
explicit instruction: preserve DSR authority boundary
```

This prompt is stored in:

```text
AI_HANDOFF_PROMPT
```

inside `DSR_TEST_REPORT`.

---

### 3.8 Required Result Status

Allowed statuses:

```text
GO
GO_WITH_WARNINGS
FAIL
```

Severity mapping:

```text
OK:
All required checks pass.

WARNING:
Non-blocking warnings exist.

ERROR:
One or more required checks fail.

CRITICAL:
Destructive behavior or authority violation detected.
```

Rules:

```text
GO:
All required test checks pass.

GO_WITH_WARNINGS:
Required checks pass, but non-blocking warnings remain.

FAIL:
Mandatory checks fail, destructive operation detected, test/business runtime mixed, or authority boundary violated.
```

---

## 4. COMPLETION RULES

You MUST complete all deliverables required by:

```text
PHASE_DSR_07_TEST_CONSOLE
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

For this phase, create a test console contract artifact:

```text
DSR_TEST_CONSOLE_CONTRACT.md
```

If a new ADR is needed, create:

```text
ADR_DSR_TEST_CONSOLE_ADDENDUM.md
```

If authority boundary is updated, update:

```text
DSR_RUNTIME_AUTHORITY.md
```

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
- Dedicated `🧪 CBV Test Console` exists.
- Test runtime is separate from business runtime.
- `DSR_TEST_REPORT` exists with required headers.
- Test report envelope follows `DSR_TEST_CONSOLE_REPORT_V1`.
- AI handoff prompt generation exists.
- Test report appends only.
- No SOURCE spreadsheet write occurs.
- No DESTINATION business sheet write occurs.
- No sync, backup mutation, trigger, or destructive operation is performed by tests.
- Required artifacts are generated.

### GO_WITH_WARNINGS

Use `GO_WITH_WARNINGS` if:

- Required deliverables are completed.
- Non-blocking warnings or risks remain.
- Follow-up actions are clearly recorded.
- Example: live GAS execution was not possible in local/Cursor session.
- Example: real operator test is pending after deploy.

### FAIL

Use `FAIL` if:

- Safe completion is not possible.
- Mandatory deliverables are missing.
- Required checks fail.
- Test menu is mixed into business runtime menu.
- Authority, ADR, registry, or contract conflicts cannot be safely resolved.
- Code modifies SOURCE or business sheets.
- Code performs sync/backup mutation unexpectedly.
- Code creates triggers.
- Runtime report cannot be kept append-only.

---

## 6. TEST REQUIREMENTS

Perform minimum tests:

```text
1. Dedicated test console menu exists.

2. Test console is not mixed into business runtime menu.

3. DSR_TEST_REPORT sheet is created or detected.

4. DSR_TEST_REPORT required headers exist.

5. Test report envelope has required fields.

6. Test check items follow required schema.

7. Foundation test implemented.

8. Connection guard test implemented.

9. Backup guard test implemented.

10. Diff preview guard test implemented.

11. Sync guard dry-run test implemented.

12. Runtime report test implemented.

13. AI handoff prompt generation implemented.

14. Test report append-only behavior verified statically.

15. No SOURCE spreadsheet write.

16. No DESTINATION business sheet write.

17. No sync apply.

18. No backup mutation.

19. No trigger creation.

20. No destructive operation.

21. Report contract artifact created.

22. Phase report created.

23. Phase handoff created.

24. Test evidence created.

25. Bundle is minimal and <= TARGET_BUNDLE_SIZE.
```

Create test evidence artifact:

```text
PHASE_DSR_07_TEST_CONSOLE_TEST_EVIDENCE.md
```

---

## 7. REQUIRED PHASE ARTIFACTS

Create append-only phase artifacts using existing repo folder conventions.

Preferred names:

```text
PHASE_DSR_07_TEST_CONSOLE_REPORT.md
PHASE_DSR_07_TEST_CONSOLE_HANDOFF.md
PHASE_DSR_07_TEST_CONSOLE_TEST_EVIDENCE.md
```

Required contract:

```text
DSR_TEST_CONSOLE_CONTRACT.md
```

If ADR is needed:

```text
ADR_DSR_TEST_CONSOLE_ADDENDUM.md
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
test console changes
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

The test console contract must include:

```text
contract name
contract version
scope
test runtime boundary
business runtime separation
allowed reads
allowed writes
forbidden operations
report envelope schema
check item schema
AI handoff prompt requirements
append-only rules
operator verification steps
```

---

## 8. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.
2. Create a phase handoff bundle containing ONLY files created or modified by `PHASE_DSR_07_TEST_CONSOLE`.
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
0001_PHASE_DSR_07_TEST_CONSOLE.zip
0002_PHASE_DSR_07_TEST_CONSOLE.zip
0003_PHASE_DSR_07_TEST_CONSOLE.zip
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
- PHASE_DSR_08_OPERATOR_UX_POLISH

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
