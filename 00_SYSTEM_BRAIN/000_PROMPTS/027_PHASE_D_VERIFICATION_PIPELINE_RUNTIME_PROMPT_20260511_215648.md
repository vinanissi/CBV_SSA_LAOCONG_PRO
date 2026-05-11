# PHASE D — CBV Verification Pipeline Runtime (archived prompt)

Repo: D:\Workspace\projects\CBV_SSA_LAOCONG_PRO

## CBV_AI_WORK_BRAIN — SHORT EXECUTION CONTEXT

- Memory-first, runtime-first, append-only
- Persist: prompt, report, decision, trace, handoff
- No overwrite/delete audit history; no fake DONE/PRODUCTION READY

## REQUIRED FLOW

1. Read existing repo/runtime
2. Save prompt archive: `00_SYSTEM_BRAIN/000_PROMPTS`
3. Analyze impact/boundaries
4. Implement
5. Self-test + runtime verification
6. Append-only report: `00_SYSTEM_BRAIN/000_REPORTS`
7. Git add/commit/push/tag if needed
8. AI handoff summary

## PHASE GOAL

Operational Verification Runtime:

SUITE → VERIFY → GOVERNANCE CHECK → RISK CHECK → REPORT → DRIVE EXPORT → AI HANDOFF → DECISION GATE

## FILES (main-control)

- `327_CBV_TEST_CONSOLE_VERIFICATION_RUNTIME.js`
- `328_CBV_TEST_CONSOLE_GOVERNANCE_RULES.js`
- `329_CBV_TEST_CONSOLE_RISK_ENGINE.js`
- `330_CBV_TEST_CONSOLE_DECISION_GATE.js`
- `331_CBV_TEST_CONSOLE_ARTIFACT_REGISTRY.js`
- `332_CBV_TEST_CONSOLE_RUNTIME_BOUNDARY.js`
- `333_CBV_TEST_CONSOLE_RUNTIME_VIEWER.html`

Canonical sync: `apps-script/production-core/src/` (mirrors).

## VERIFICATION

`CBV_TestConsole_verifyReport_(report, boundaryResult?)` → ok, verificationChecks, verificationWarnings, verificationErrors, governanceOk, runtimeSafe, riskScore

## GOVERNANCE

`CBV_TEST_GOVERNANCE_RULES` + `CBV_TestConsole_runGovernanceRules_(ctx)`

Default rules: NO_DELETEALLPROPERTIES, NO_DELETE_SHEET, NO_CLEAR_SHEET, NO_OVERWRITE_REPORT, NO_UNCONTROLLED_TRIGGER_INSTALL, NO_AUTO_MIGRATION, NO_RUNTIME_SCHEMA_REWRITE, NO_DESTRUCTIVE_BATCH, NO_SILENT_PRODUCTION_MUTATION

## RISK ENGINE

`CBV_TestConsole_calculateRiskScore_(report)` → riskScore, riskLevel (SAFE/REVIEW/HIGH_RISK/BLOCKED), blocked, reasons

## DECISION GATE

`CBV_TestConsole_buildDecisionGate_(report)` → allowNextPhase, allowProductionDeploy, requireManualReview, blockedBy, decisionSummary

## ARTIFACT REGISTRY

Sheet `CBV_TEST_ARTIFACT_REGISTRY` append-only columns: CREATED_AT, PROMPT_FILE, REPORT_FILE, DRIVE_FILE_ID, DRIVE_URL, TRACE_ID, SUITE_CODE, COMMIT_HASH, TAG, HANDOFF_ID, DECISION_SUMMARY, RISK_SCORE

## RUNTIME BOUNDARY

`CBV_TestConsole_enforceRuntimeBoundary_(suite, traceIdHint)` — destructive / productionSafe false require ScriptProperties unlock; optional admin trace match when `CBV_TC_ADMIN_TRACE_ID` is set.

## MENU

Update 🧪 CBV Test Console from registry + add Verification (Phase D) submenu items.

## SELF-TESTS

Verification, governance, risk, decision gate, artifact registry, runtime boundary, viewer render, non-destructive path.

## GIT

Commit message: `phase: implement verification pipeline runtime`  
Tag: `phase-d-verification-pipeline-runtime`
