# OCMS Runtime Launch Manifest — Execute One Phase

## 1. RUNTIME PARAMETERS

```yaml
RCLA_VERSION: CBV-RCLA v1.1
ENTRYPOINT: 00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
PHASE: PHASE_DSR_05C_SELECTIVE_SYNC_APPLY
TARGET_BUNDLE_SIZE: <=10 files
ZIP_RETENTION: KEEP_ZIP_ONLY
```

---

## 2. EXECUTION CONTRACT

You are executing exactly one OCMS phase under the CBV Runtime Context Loading Authority.

You MUST:

1. Load the specified RCLA version: `CBV-RCLA v1.1`.
2. Load the specified Runtime Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`.
3. Execute ONLY the specified phase: `PHASE_DSR_05C_SELECTIVE_SYNC_APPLY`.
4. Do not jump phases.
5. Do not redesign unrelated architecture.
6. Preserve existing contracts, ADRs, authorities, registries, indexes, governance artifacts, and runtime boundaries.
7. Prefer additive and reversible changes.
8. Keep all changes modular, traceable, and audit-friendly.
9. Document conflicts before modifying affected files.
10. Stop and report `FAIL` if safe completion is not possible.

This phase extends `CBV_DATA_SYNC_RUNTIME v1`.

Critical context:

```text
PHASE_DSR_05B_WHITELIST_SYNC_GUARD has already forbidden FULL_WORKBOOK_SYNC and required WHITELIST_SYNC.
```

This phase adds an operator-level safety layer:

```text
SELECTIVE_SYNC_APPLY
```

Meaning:

```text
Even if a sheet is whitelisted, it must not be synced unless the operator explicitly selects/approves it.
```

Mandatory scope:

```text
PHASE_DSR_05C_SELECTIVE_SYNC_APPLY
```

Allowed work:
- Add selective sync approval layer.
- Add operator-selected sheet apply plan.
- Add `SYNC_SELECTION` sheet or equivalent selection area if not existing.
- Allow operator to mark specific whitelisted sheets as selected for apply.
- Enforce all existing guards from Phase 05 and 05B.
- Sync only selected + whitelisted + non-forbidden sheets.
- Log skipped/unselected/blocked sheets.
- Audit every apply decision.
- Update menu to add selective sync action.
- Update contracts, authority, ADR, registry as required.
- Create/update REPORT, HANDOFF, TEST EVIDENCE.
- Keep changes additive and reversible.

Forbidden work:
- Do not full-sync workbook.
- Do not sync all whitelist sheets by default.
- Do not sync unselected sheets.
- Do not sync forbidden sheets.
- Do not bypass backup guard.
- Do not bypass diff guard.
- Do not bypass `SYNC_ALLOWED`.
- Do not modify SOURCE spreadsheet content.
- Do not delete destination-only sheets.
- Do not create triggers.
- Do not implement scheduler/automation.
- Do not redesign DSR architecture.
- Do not clear/write destination sheets during static implementation/testing.
- Do not loosen existing Sync Guard Contract.

---

## 3. COMPLETION RULES

You MUST complete all deliverables required by `PHASE_DSR_05C_SELECTIVE_SYNC_APPLY`.

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

You MUST record warnings, risks, assumptions, skipped items, and follow-up actions.

Do not report `GO` if mandatory deliverables are missing.

---

## 4. PHASE OBJECTIVE

Convert DSR from:

```text
Whitelist Sync Apply
```

to:

```text
Selective Whitelist Sync Apply
```

Before this phase:

```text
Manual Sync Apply may sync all sheets in SYNC_WHITELIST if guards pass.
```

After this phase:

```text
Manual Sync Apply must sync only sheets that are:
1. in SYNC_WHITELIST
2. not matching forbidden patterns
3. selected by the operator
4. passing backup/diff/manual guard rules
```

---

## 5. REQUIRED DESIGN DECISION

Create or update ADR:

```text
ADR_DSR_SELECTIVE_SYNC_APPLY.md
```

The ADR must record:

```text
Decision ID: DSR_DECISION_002
Decision: SELECTIVE_SYNC_APPLY is required before writing destination business sheets.
Decision: Whitelisted sheets are not automatically synced.
Reason: Audit found whitelisted sheets may still have row-count differences and require operator review.
Risk: Syncing all whitelisted sheets may overwrite data unintentionally.
Status: APPROVED
Date: 2026-06-01
```

---

## 6. REQUIRED CONTRACT UPDATE

Update:

```text
SYNC_GUARD_CONTRACT.md
```

Add mandatory guard:

```text
SELECTIVE_SYNC_REQUIRED = TRUE
```

Add explicit rule:

```text
WHITELISTED does not mean SELECTED.
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
FULL_WORKBOOK_SYNC = FORBIDDEN
SELECTIVE_SYNC_REQUIRED = TRUE
target sheet is in SYNC_WHITELIST
target sheet does not match forbidden patterns
target sheet is explicitly selected by operator
target sheet selection status = APPROVED
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
DSR may write to a destination business sheet only when the sheet is whitelisted AND explicitly selected/approved by the operator.
```

Add forbidden scope:

```text
DSR must not interpret whitelist as blanket approval.
DSR must not sync all whitelisted sheets by default.
DSR must not sync sheets with selection status SKIP, BLOCKED, REVIEW_REQUIRED, or empty.
DSR must not create automatic selections.
```

---

## 8. REQUIRED SELECTION SHEET

Create or ensure:

```text
SYNC_SELECTION
```

Required headers:

```text
RUN_ID
SELECTED_AT
SHEET_NAME
IN_WHITELIST
FORBIDDEN
DIFF_STATUS
OPERATOR_DECISION
APPROVED_BY
APPROVED_AT
APPLY_STATUS
MESSAGE
DETAIL_JSON
```

Allowed `OPERATOR_DECISION` values:

```text
APPROVE
SKIP
HOLD
BLOCK
```

Allowed `APPLY_STATUS` values:

```text
PENDING
READY_TO_APPLY
APPLIED
SKIPPED
BLOCKED
FAILED
```

Rules:
- Only rows with `OPERATOR_DECISION = APPROVE` and `APPLY_STATUS = READY_TO_APPLY` may be applied.
- Historical selection rows must be append-only.
- Do not clear old selections.
- If a sheet has multiple selection rows, use the latest row for that sheet by `SELECTED_AT`/`APPROVED_AT`.

---

## 9. REQUIRED CONFIG KEYS

Update `SYNC_CONFIG` bootstrap/default config if implemented in code.

Required keys:

```text
SELECTIVE_SYNC_REQUIRED
SYNC_SELECTION_SHEET
ALLOW_SYNC_ALL_WHITELIST
```

Required values:

```text
SELECTIVE_SYNC_REQUIRED = TRUE
SYNC_SELECTION_SHEET = SYNC_SELECTION
ALLOW_SYNC_ALL_WHITELIST = FALSE
```

---

## 10. REQUIRED MENU UPDATE

Extend business runtime menu safely:

```text
🚀 CBV Runtime
└─ 🔁 Data Sync Runtime
   ├─ Build Selective Sync Plan
   ├─ Manual Selective Sync Apply
   ├─ Open Sync Selection
```

Do not remove existing items.

Do not place these under `🧪 CBV Test Console`.

---

## 11. REQUIRED RUNTIME CHANGES

Implement selective apply behavior:

```text
1. Load config.
2. Validate Phase 05/05B guards.
3. Load whitelist.
4. Load forbidden patterns.
5. Load latest diff plan.
6. Build SYNC_SELECTION candidate rows for whitelisted sheets.
7. Operator manually changes OPERATOR_DECISION to APPROVE/SKIP/HOLD/BLOCK.
8. Manual Selective Sync Apply reads latest decisions.
9. Apply only sheets where:
   - in whitelist
   - not forbidden
   - OPERATOR_DECISION = APPROVE
   - APPLY_STATUS = READY_TO_APPLY
10. For all other sheets:
   - SKIP/BLOCK
   - LOG
   - AUDIT
   - REPORT
11. After apply:
   - update new append-only result row/report
   - do not overwrite prior selection history
```

Do not remove existing guards. This phase adds stricter operator selection.

---

## 12. REQUIRED FUNCTIONS

Create or update modular functions:

```javascript
cbvDsrBuildSelectiveSyncPlan()
cbvDsrManualSelectiveSyncApply()
cbvDsrOpenSyncSelection()
cbvDsrEnsureSyncSelectionSheet_()
cbvDsrBuildSelectionCandidates_()
cbvDsrReadLatestSyncSelections_()
cbvDsrValidateSelectiveSyncConfig_(config)
cbvDsrValidateSheetSelectionPermission_(sheetName, selection, config)
cbvDsrBuildSelectiveApplyPlan_(sourceSs, destSs, config, selections)
cbvDsrAppendSelectionRows_(ss, rows)
cbvDsrLogSelectionDecision_(ss, payload)
cbvDsrAuditSelectionDecision_(ss, payload)
cbvDsrUpdateSelectionApplyResult_(ss, payload)
```

Update existing:

```javascript
cbvDsrValidateSyncGuards_()
cbvDsrManualSyncApply()
```

Recommended behavior:

```text
cbvDsrManualSyncApply() should refuse to run if SELECTIVE_SYNC_REQUIRED = TRUE and instruct operator to use cbvDsrManualSelectiveSyncApply().
```

Function names may be adapted to repo conventions, but behavior must be clear and traceable.

---

## 13. REQUIRED REPORTING

Runtime reports must include:

```text
selectionRequired
selectionSheet
candidateSheetCount
approvedSheetCount
skippedSheetCount
heldSheetCount
blockedSheetCount
appliedSheetCount
failedSheetCount
approvedSheets
skippedSheets
heldSheets
blockedSheets
failedSheets
nextStep
```

---

## 14. REQUIRED TEST REQUIREMENTS

Perform minimum tests:

```text
1. SELECTIVE_SYNC_REQUIRED = TRUE exists in config/contract.
2. ALLOW_SYNC_ALL_WHITELIST = FALSE exists in config/contract.
3. SYNC_SELECTION sheet exists or is created.
4. SYNC_SELECTION headers exist.
5. Whitelisted sheet without selection is not synced.
6. Whitelisted sheet with OPERATOR_DECISION empty is not synced.
7. Whitelisted sheet with OPERATOR_DECISION = SKIP is not synced.
8. Whitelisted sheet with OPERATOR_DECISION = HOLD is not synced.
9. Whitelisted sheet with OPERATOR_DECISION = BLOCK is not synced.
10. Whitelisted sheet with OPERATOR_DECISION = APPROVE but APPLY_STATUS != READY_TO_APPLY is not synced.
11. Whitelisted sheet with OPERATOR_DECISION = APPROVE and APPLY_STATUS = READY_TO_APPLY is eligible.
12. Forbidden sheet cannot be made eligible even if approved.
13. Non-whitelisted sheet cannot be made eligible even if approved.
14. Latest selection row is used when multiple rows exist.
15. Build Selective Sync Plan does not write business data.
16. Manual Selective Sync Apply preserves backup guard.
17. Manual Selective Sync Apply preserves diff guard.
18. Manual Selective Sync Apply preserves SYNC_ALLOWED guard.
19. Manual Selective Sync Apply preserves whitelist guard.
20. Manual Selective Sync Apply preserves forbidden-pattern guard.
21. Legacy Manual Sync Apply refuses when SELECTIVE_SYNC_REQUIRED = TRUE.
22. Destination-only sheets are preserved.
23. SOURCE spreadsheet is never written.
24. Logs are append-only.
25. Audits are append-only.
26. Reports include selection metrics.
27. No trigger is created.
28. No destructive automation is introduced.
29. Bundle is minimal and <= TARGET_BUNDLE_SIZE.
```

Create test evidence artifact:

```text
PHASE_DSR_05C_SELECTIVE_SYNC_APPLY_TEST_EVIDENCE.md
```

---

## 15. RESULT CONTRACT

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
- Selective sync is required.
- Whitelist alone cannot trigger sync.
- Operator selection/approval is required.
- Legacy Manual Sync Apply is blocked when selective mode is enabled.
- Forbidden sheets cannot be selected into eligibility.
- Non-whitelisted sheets cannot be selected into eligibility.
- Existing backup/diff/manual approval guards are preserved.
- Contract, ADR, authority, report, handoff, and test evidence are complete.
- No real sync/destructive operation is performed during implementation.

### GO_WITH_WARNINGS

Use `GO_WITH_WARNINGS` if:

- Required deliverables are completed.
- Non-blocking warnings or risks remain.
- Follow-up actions are clearly recorded.
- Example: live GAS execution pending.
- Example: operator must manually choose initial sync candidates.

### FAIL

Use `FAIL` if:

- Safe completion is not possible.
- Mandatory deliverables are missing.
- Required checks fail.
- Whitelist can trigger sync without selection.
- Full whitelist sync remains possible.
- Forbidden sheets can be approved into apply.
- Non-whitelisted sheets can be approved into apply.
- Authority, ADR, registry, or contract conflicts cannot be safely resolved.
- Code modifies SOURCE or business sheets during implementation.
- Code creates triggers or destructive automation.

---

## 16. REQUIRED PHASE ARTIFACTS

Create append-only phase artifacts using existing repo folder conventions.

Preferred names:

```text
PHASE_DSR_05C_SELECTIVE_SYNC_APPLY_REPORT.md
PHASE_DSR_05C_SELECTIVE_SYNC_APPLY_HANDOFF.md
PHASE_DSR_05C_SELECTIVE_SYNC_APPLY_TEST_EVIDENCE.md
ADR_DSR_SELECTIVE_SYNC_APPLY.md
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
selection sheet changes
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
why selective sync is required
how to build selective sync plan
how operator approves sheets
how Manual Selective Sync Apply works
how legacy Manual Sync Apply is blocked
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

## 17. AFTER COMPLETION — MINIMAL AI HANDOFF BUNDLE

After completing the phase, create a minimal AI handoff bundle.

### Bundle Rules

1. Ensure `phase_tmp/` exists.
2. Create a phase handoff bundle containing ONLY files created or modified by `PHASE_DSR_05C_SELECTIVE_SYNC_APPLY`.
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
0001_PHASE_DSR_05C_SELECTIVE_SYNC_APPLY.zip
0002_PHASE_DSR_05C_SELECTIVE_SYNC_APPLY.zip
0003_PHASE_DSR_05C_SELECTIVE_SYNC_APPLY.zip
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

## 18. FINAL RESPONSE FORMAT

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
