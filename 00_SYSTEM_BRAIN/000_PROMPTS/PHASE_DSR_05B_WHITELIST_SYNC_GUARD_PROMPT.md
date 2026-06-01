# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_05B_WHITELIST_SYNC_GUARD
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_05B_WHITELIST_SYNC_GUARD`.
4. Do not jump phases.
5. Do not redesign unrelated architecture.
6. Preserve existing contracts, ADRs, authorities, registries, indexes, governance artifacts, and runtime boundaries.
7. Prefer additive and reversible changes.
8. Keep all changes modular, traceable, and audit-friendly.
9. Document conflicts before modifying affected files.
10. Stop and report `FAIL` if safe completion is not possible.

This phase modifies the guard boundary of:

```text
CBV_DATA_SYNC_RUNTIME v1
```

Critical decision:

```text
FULL_WORKBOOK_SYNC = FORBIDDEN
WHITELIST_SYNC = REQUIRED
```

This phase exists because audit found that SOURCE and DESTINATION schemas have diverged. Full workbook sync may destroy destination-only runtime, governance, AppSheet, dashboard, and master-data structures.

Mandatory scope:

```text
PHASE_DSR_05B_WHITELIST_SYNC_GUARD
```

Allowed work:

- Add whitelist sync guard.
- Block full workbook sync.
- Add allowed sheet whitelist config.
- Add forbidden sheet pattern config.
- Update manual sync apply logic to sync only whitelisted sheets.
- Update diff preview/reporting to highlight whitelist status.
- Update sync guard contract.
- Update authority/ADR/registry as required.
- Add tests for whitelist enforcement.
- Create/update REPORT, HANDOFF, TEST EVIDENCE.
- Keep changes additive and reversible.

Forbidden work:

- Do not run real sync.
- Do not clear or overwrite any business data.
- Do not modify SOURCE spreadsheet content.
- Do not delete destination-only sheets.
- Do not create automatic triggers.
- Do not implement scheduler/automation.
- Do not loosen existing sync guard conditions.
- Do not allow full workbook sync.
- Do not sync master data sheets.
- Do not sync system/runtime/governance sheets.
- Do not bypass backup/diff/manual approval guards.
- Do not redesign DSR architecture.

---

## 3. COMPLETION RULES

You MUST complete all deliverables required by:

```text
PHASE_DSR_05B_WHITELIST_SYNC_GUARD
```

You MUST create or update required artifacts according to existing repo conventions:

```text
REPORT
HANDOFF
ADR
AUTHORITY
CONTRACT
TEST EVIDENCE
REGISTRY / INDEX updates if required
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

## 4. PHASE OBJECTIVE

Convert DSR manual sync from unsafe full-workbook behavior into guarded whitelist-only behavior.

Before this phase:

```text
Manual Sync Apply may evaluate all source sheets.
```

After this phase:

```text
Manual Sync Apply MUST only apply sheets explicitly allowed by whitelist.
All other sheets MUST be skipped, logged, and audited.
```

---

## 5. REQUIRED DESIGN DECISION

Create or update ADR:

```text
ADR_DSR_WHITELIST_SYNC_GUARD.md
```

The ADR must record:

```text
Decision ID: DSR_DECISION_001
Decision: FULL_WORKBOOK_SYNC is forbidden.
Decision: WHITELIST_SYNC is required.
Reason: SOURCE and DESTINATION schema divergence detected.
Risk: Full workbook sync may destroy destination runtime/governance/master data.
Status: APPROVED
Date: 2026-06-01
```

---

## 6. REQUIRED CONTRACT UPDATE

Create or update:

```text
SYNC_GUARD_CONTRACT.md
```

Add mandatory guard:

```text
WHITELIST_SYNC_REQUIRED = TRUE
```

Add explicit prohibition:

```text
FULL_WORKBOOK_SYNC = FORBIDDEN
```

Manual Sync Apply is allowed only if all guards pass:

```text
SYNC_ALLOWED = TRUE
SOURCE_SPREADSHEET_ID valid
DESTINATION_SPREADSHEET_ID valid
SYNC_MODE = ONE_WAY_SOURCE_TO_DESTINATION
SAFETY_MODE = BACKUP_BEFORE_WRITE
LATEST_BACKUP_EXISTS = TRUE
LAST_DIFF_RESULT acceptable by policy
WHITELIST_SYNC_REQUIRED = TRUE
SYNC_WHITELIST non-empty
target sheet is in SYNC_WHITELIST
target sheet does not match any FORBIDDEN pattern
```

If any guard fails:

```text
DO_NOT_SYNC
DO_NOT_CLEAR_DESTINATION
DO_NOT_WRITE_DESTINATION
LOG
AUDIT
REPORT
```

---

## 7. REQUIRED AUTHORITY UPDATE

Update:

```text
DSR_RUNTIME_AUTHORITY.md
```

Add authority rule:

```text
DSR may only write to destination business sheets that are explicitly included in SYNC_WHITELIST.
```

Add forbidden scope:

```text
DSR must not full-sync entire workbook.
DSR must not sync destination-only runtime sheets.
DSR must not sync master-data sheets.
DSR must not sync governance/config/system sheets.
DSR must not delete destination-only sheets.
```

---

## 8. REQUIRED CONFIG KEYS

Update `SYNC_CONFIG` bootstrap/default config if implemented in code.

Required keys:

```text
SYNC_ALLOWED
SYNC_MODE
SAFETY_MODE
SYNC_WHITELIST
SYNC_FORBIDDEN_PATTERNS
FULL_WORKBOOK_SYNC
WHITELIST_SYNC_REQUIRED
```

Required values:

```text
FULL_WORKBOOK_SYNC = FORBIDDEN
WHITELIST_SYNC_REQUIRED = TRUE
```

Recommended `SYNC_WHITELIST` default:

```text
TASK_MAIN
TASK_CHECKLIST
TASK_ATTACHMENT
TASK_UPDATE_LOG
FINANCE_TRANSACTION
FINANCE_LOG
DOC_REQUIREMENT
RULE_DEF
```

Recommended `SYNC_FORBIDDEN_PATTERNS` default:

```text
USER_DIRECTORY
MASTER_CODE
DON_VI
HO_SO_MASTER
CBV_*
HOME_ALERT_*
FEATURE_FLAG
ROLE_PERMISSION_MATRIX
SYSTEM_REGISTRY
SYNC_*
DSR_*
BAK_*
```

If storing list values in one cell, use newline-separated values or JSON array. Pick the style consistent with existing DSR config helpers. Document the chosen format in the contract and handoff.

---

## 9. REQUIRED RUNTIME CHANGES

Update manual sync apply module.

Required behavior:

```text
1. Load config.
2. Parse SYNC_WHITELIST.
3. Parse SYNC_FORBIDDEN_PATTERNS.
4. Validate whitelist exists and is non-empty.
5. Validate FULL_WORKBOOK_SYNC is FORBIDDEN.
6. Validate WHITELIST_SYNC_REQUIRED is TRUE.
7. Build apply plan using only whitelisted source sheets.
8. Before syncing each sheet:
   - confirm sheet is in whitelist
   - confirm sheet does not match forbidden patterns
   - confirm source sheet exists
   - confirm destination sheet exists or create only if policy explicitly permits
9. For non-whitelisted sheets:
   - SKIP
   - LOG
   - AUDIT
   - do not clear
   - do not write
10. For forbidden sheets:
   - BLOCK
   - LOG
   - AUDIT
   - do not clear
   - do not write
11. Report applied/skipped/blocked counts.
```

Do not remove existing guards. This phase adds stricter guards.

---

## 10. REQUIRED FUNCTIONS

Create or update modular functions:

```javascript
cbvDsrParseSheetListConfig_(value)

cbvDsrParseForbiddenPatterns_(value)

cbvDsrIsSheetWhitelisted_(sheetName, whitelist)

cbvDsrIsSheetForbidden_(sheetName, forbiddenPatterns)

cbvDsrValidateWhitelistSyncConfig_(config)

cbvDsrValidateSheetSyncPermission_(sheetName, config)

cbvDsrBuildWhitelistApplyPlan_(sourceSs, destSs, config)

cbvDsrLogWhitelistSkip_(ss, payload)

cbvDsrAuditWhitelistDecision_(ss, payload)
```

Update existing:

```javascript
cbvDsrValidateSyncGuards_()

cbvDsrBuildSyncApplyPlan_()

cbvDsrManualSyncApply()
```

Function names may be adapted to repo conventions, but behavior must be clear and traceable.

---

## 11. REQUIRED DIFF PREVIEW UPDATE

Update diff preview reporting if necessary so that each plan row can distinguish:

```text
WHITELISTED
NOT_WHITELISTED
FORBIDDEN
DEST_ONLY
SOURCE_ONLY
REVIEW_REQUIRED
READY_FOR_SYNC
```

If modifying `SYNC_PLAN` schema is risky, do not destructively change headers. Instead:

- add details in `MESSAGE`
- add JSON detail where available
- document limitation in report

---

## 12. REQUIRED REPORTING

Runtime reports must include:

```text
whitelistCount
forbiddenPatternCount
appliedSheetCount
skippedSheetCount
blockedSheetCount
skippedSheets
blockedSheets
fullWorkbookSyncStatus
whitelistSyncRequired
nextStep
```

---

## 13. RESULT CONTRACT

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
- Full workbook sync is explicitly blocked.
- Whitelist sync is required.
- Manual sync apply uses whitelist-only apply plan.
- Forbidden sheet patterns are enforced.
- Existing backup/diff/manual approval guards are preserved.
- Contract, ADR, authority, report, handoff, and test evidence are complete.
- No real sync/destructive operation is performed during implementation.

### GO_WITH_WARNINGS

Use `GO_WITH_WARNINGS` if:

- Required deliverables are completed.
- Non-blocking warnings or risks remain.
- Follow-up actions are clearly recorded.
- Example: live GAS execution pending.
- Example: actual whitelist values require operator confirmation.

### FAIL

Use `FAIL` if:

- Safe completion is not possible.
- Mandatory deliverables are missing.
- Required checks fail.
- Full workbook sync remains possible.
- Whitelist can be bypassed.
- Forbidden sheets can be synced.
- Authority, ADR, registry, or contract conflicts cannot be safely resolved.
- Code modifies SOURCE or business sheets during implementation.
- Code creates triggers or destructive automation.

---

## 14. TEST REQUIREMENTS

Perform minimum tests:

```text
1. FULL_WORKBOOK_SYNC = FORBIDDEN exists in config/contract.
2. WHITELIST_SYNC_REQUIRED = TRUE exists in config/contract.
3. SYNC_WHITELIST is parsed correctly from configured format.
4. SYNC_FORBIDDEN_PATTERNS is parsed correctly from configured format.
5. Empty whitelist blocks sync.
6. Missing whitelist blocks sync.
7. Sheet in whitelist is allowed when not forbidden.
8. Sheet not in whitelist is skipped.
9. Sheet matching USER_DIRECTORY is blocked.
10. Sheet matching MASTER_CODE is blocked.
11. Sheet matching DON_VI is blocked.
12. Sheet matching HO_SO_MASTER is blocked.
13. Sheet matching CBV_* is blocked.
14. Sheet matching HOME_ALERT_* is blocked.
15. Sheet matching FEATURE_FLAG is blocked.
16. Sheet matching ROLE_PERMISSION_MATRIX is blocked.
17. Sheet matching SYSTEM_REGISTRY is blocked.
18. Sheet matching SYNC_* is blocked.
19. Sheet matching DSR_* is blocked.
20. Sheet matching BAK_* is blocked.
21. Manual sync apply builds whitelist-only plan.
22. Non-whitelisted sheets are not cleared.
23. Forbidden sheets are not cleared.
24. Non-whitelisted sheets are not written.
25. Forbidden sheets are not written.
26. Destination-only sheets are preserved.
27. SOURCE spreadsheet is never written.
28. Backup guard remains enforced.
29. Diff guard remains enforced.
30. SYNC_ALLOWED guard remains enforced.
31. Logs are append-only.
32. Audits are append-only.
33. Reports include whitelist metrics.
34. No trigger is created.
35. No destructive operation is introduced.
36. Bundle is minimal and <= TARGET_BUNDLE_SIZE.
```

Create test evidence artifact:

```text
PHASE_DSR_05B_WHITELIST_SYNC_GUARD_TEST_EVIDENCE.md
```

---

## 15. REQUIRED PHASE ARTIFACTS

Create append-only phase artifacts using existing repo folder conventions.

Preferred names:

```text
PHASE_DSR_05B_WHITELIST_SYNC_GUARD_REPORT.md
PHASE_DSR_05B_WHITELIST_SYNC_GUARD_HANDOFF.md
PHASE_DSR_05B_WHITELIST_SYNC_GUARD_TEST_EVIDENCE.md
ADR_DSR_WHITELIST_SYNC_GUARD.md
SYNC_GUARD_CONTRACT.md
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
contract changes
authority changes
ADR changes
config changes
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
why full workbook sync is forbidden
how whitelist sync works
how to configure SYNC_WHITELIST
how to configure SYNC_FORBIDDEN_PATTERNS
how to verify guard behavior
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

## 16. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.
2. Create a phase handoff bundle containing ONLY files created or modified by `PHASE_DSR_05B_WHITELIST_SYNC_GUARD`.
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
0001_PHASE_DSR_05B_WHITELIST_SYNC_GUARD.zip
0002_PHASE_DSR_05B_WHITELIST_SYNC_GUARD.zip
0003_PHASE_DSR_05B_WHITELIST_SYNC_GUARD.zip
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
