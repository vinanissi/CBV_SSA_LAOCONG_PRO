# PHASE F — CBV Test Console WebApp FE Runtime (execution prompt)

**Archived at:** 2026-05-11T22:31:00+07:00  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
**Phase intent:** Refactor CBV Test Console Runtime so Google Apps Script WebApp becomes the primary Frontend, while Google Sheet menu becomes a thin launcher/bootstrap/health surface only.

## Role

You are the CBV System Architect. Execute this phase in a memory-first, runtime-first, append-only way. Do not claim production readiness unless live GAS runtime verification has actually passed.

## CBV_AI_WORK_BRAIN — SHORT EXECUTION CONTEXT

### CORE RULES

- Memory-first, runtime-first, append-only.
- Khong chi code: phai luu prompt, report, decision, trace, handoff.
- Khong overwrite/xoa audit history.
- Khong fake DONE / PRODUCTION READY.
- Manual-first, guided-operation-first, AI-assisted operation.
- Production-safe, auditable, incremental automation.

### REQUIRED FLOW

1. Read existing repo/runtime.
2. Save/confirm this prompt archive in `00_SYSTEM_BRAIN/000_PROMPTS`.
3. Analyze impact/boundaries before editing.
4. Implement add-only/idempotent WebApp FE runtime.
5. Self-test + runtime verification.
6. Generate append-only report in `00_SYSTEM_BRAIN/000_REPORTS`.
7. Git add/commit/push/tag only if explicitly requested/possible and record failures honestly.
8. Create AI handoff summary.

### REQUIRED OUTPUT

- FILES CREATED
- FILES UPDATED
- TEST RESULT
- WARNINGS
- NEXT STEP
- PRODUCTION READINESS
- AI HANDOFF SUMMARY

## Existing Runtime Baseline To Read First

Read these files before implementation:

- `apps-script/main-control/src/200_MAIN_CONTROL_WEBAPP.js`
- `apps-script/main-control/src/318_CBV_TEST_CONSOLE_REPORT_CONTRACT.js`
- `apps-script/main-control/src/320_CBV_TEST_CONSOLE_DRIVE_EXPORTER.js`
- `apps-script/main-control/src/321_CBV_TEST_CONSOLE_REPORT_SHEET.js`
- `apps-script/main-control/src/322_CBV_TEST_CONSOLE_AI_HANDOFF.js`
- `apps-script/main-control/src/323_CBV_TEST_CONSOLE_RUNTIME.js`
- `apps-script/main-control/src/325_CBV_TEST_CONSOLE_MENU.js`
- `apps-script/main-control/src/326_CBV_TEST_CONSOLE_SUITE_REGISTRY.js`
- `apps-script/main-control/src/327_CBV_TEST_CONSOLE_VERIFICATION_RUNTIME.js`
- `apps-script/main-control/src/333_CBV_TEST_CONSOLE_RUNTIME_VIEWER.html`
- Phase reports/prompts `025` through `028` under `00_SYSTEM_BRAIN/000_PROMPTS` and `00_SYSTEM_BRAIN/000_REPORTS`.

Confirm mirrored canonical files under `apps-script/production-core/src/` and keep parity where this repo currently expects parity.

## Phase Goal

Create an independent Google Apps Script WebApp Frontend for **CBV Test Console Runtime**.

The WebApp is the primary UI for operators. Google Sheet menus must no longer be the main operating console. Sheet menu remains only for:

- Open Test Console WebApp.
- Bootstrap / ensure runtime prerequisites.
- Health check / self-test entry point.

Do not mix Test Console runtime UI into business menus.

## Required WebApp FE Screens

Implement one independent FE with three screens:

1. **Dashboard**
   - Show runtime health, latest report summary, latest traceId, available suites, report folder status, and readiness status.
   - No automatic continuous polling.
   - Refresh only when operator clicks a button.

2. **Test Console**
   - Operator selects a suite from registry.
   - Operator clicks Run once.
   - Server runs existing Test Runtime via `google.script.run`.
   - Display status, severity, checks, warnings, errors, Drive file URL, report sheet write status, traceId.
   - Include a visible **Copy AI Handoff Prompt** button.

3. **Report Library**
   - List recent append-only `CBV_TEST_CONSOLE_REPORT` rows and Drive export metadata.
   - Open Drive report link if present.
   - Copy report JSON / AI handoff text for selected report.
   - Do not delete, rewrite, compact, or overwrite older reports.

## Server/API Requirements

Expose internal server APIs for HTMLService using `google.script.run`. Use public top-level functions callable from client code; avoid trailing underscore for client-callable API functions.

Recommended public API names:

- `cbvTestConsoleWebAppGetDashboard()`
- `cbvTestConsoleWebAppListSuites()`
- `cbvTestConsoleWebAppRunSuite(payload)`
- `cbvTestConsoleWebAppListReports(payload)`
- `cbvTestConsoleWebAppGetAiHandoff(payload)`
- `cbvTestConsoleWebAppBootstrap()`
- `cbvTestConsoleWebAppHealthCheck()`
- `cbvTestConsoleWebAppSelfTest()`

Recommended private/internal helpers may use existing local style and trailing underscore.

Return envelopes should be structured and explicit:

```json
{
  "ok": true,
  "code": "CBV_TEST_CONSOLE_WEBAPP_OK",
  "message": "OK",
  "data": {},
  "errors": [],
  "warnings": []
}
```

Reuse existing runtime functions rather than duplicating business logic:

- `CBV_TestConsole_runFullOperationalFlow_`
- `CBV_TestConsole_runTestSuite_`
- `CBV_TestConsole_buildReportEnvelope_`
- `CBV_TestConsole_appendReportSheet_`
- `CBV_TestConsole_exportReportToDrive_`
- `CBV_TestConsole_buildAiHandoffPrompt_`
- `CBV_TestConsole_listSuites_`
- `CBV_TestConsole_registerDefaultSuites_`

## WebApp Routing Requirements

There is already a `doGet(e)` in `200_MAIN_CONTROL_WEBAPP.js` that returns JSON through `MC_webAppServe_`.

Implement WebApp FE routing without creating a second `doGet`:

- Add a guarded branch in the existing `doGet(e)` path for Test Console FE, for example query params `?app=TEST_CONSOLE` or `?ui=TEST_CONSOLE`.
- That branch must return `HtmlService.HtmlOutput` for the WebApp FE.
- Existing JSON GET actions (`ping`, `health`, `getConnectionPackage`, control-plane actions) must continue to work.
- Do not break `doPost(e)` API behavior.

## File/Code Shape

Use add-only files where possible. Do not delete legacy runtime files. Recommended new files under `apps-script/main-control/src/`:

- `341_CBV_TEST_CONSOLE_WEBAPP_ENTRY.js` — route helpers, WebApp URL helpers, menu launcher functions.
- `342_CBV_TEST_CONSOLE_WEBAPP_API.js` — `google.script.run` API functions.
- `343_CBV_TEST_CONSOLE_WEBAPP_MODEL.js` — dashboard/report/suite model builders.
- `344_CBV_TEST_CONSOLE_WEBAPP_SELFTEST.js` — idempotent self-test for API/model/report append behavior.
- `345_CBV_TEST_CONSOLE_WEBAPP_FE.html` — standalone FE with Dashboard, Test Console, Report Library.

Mirror canonical copies under `apps-script/production-core/src/` if production-core is the deployment mirror for this runtime.

Minimal allowed updates:

- `200_MAIN_CONTROL_WEBAPP.js` — add route branch only.
- `325_CBV_TEST_CONSOLE_MENU.js` — convert Test Console menu surface into thin launcher/bootstrap/health entries, while keeping existing callable functions for compatibility unless there is a documented migration decision.
- `production-core` equivalents — parity updates only.
- `00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md` — append Phase F decision.
- `00_SYSTEM_BRAIN/000_REPORTS/029_*` — append-only implementation report.

## FE Behavior Constraints

- No auto-run loop.
- No interval-based continuous polling.
- No destructive actions.
- No hidden mutation.
- Run buttons must be explicit operator actions.
- Show warnings before running suites that may append rows.
- Use `withSuccessHandler` / `withFailureHandler` and display all failure messages.
- Escape user/runtime data before injecting into DOM.
- Keep UI self-contained in the GAS HTML file; do not require external CDN/network assets.
- Provide a one-click copy button for AI handoff prompt.

## Report Requirements

Every Test Runtime run launched from the WebApp must:

- Produce a standard `CBV_TEST_CONSOLE` report envelope.
- Append a row to Google Sheet `CBV_TEST_CONSOLE_REPORT`.
- Create a Google Drive Markdown file in the configured report folder.
- Use file prefix `000` to `999` in monotonically increasing order based on existing report file names.
- Never delete or overwrite old reports.
- Return report metadata to FE: `traceId`, `status`, `severity`, `driveFileId`, `driveFileUrl`, `exportFileName`, `checkedAt`, `testSuite`.

If Drive export or Sheet append fails, return honest warning/error state. Do not mark production-ready.

## Self-Test Requirements

Add an idempotent self-test that verifies:

- WebApp route helper returns the expected template/route decision.
- API dashboard model can build without throwing.
- Suite list API returns a stable array.
- Report library API reads without mutating.
- Run API can execute a safe self-test suite only when explicitly invoked.
- Sheet append and Drive export are tested through existing Test Console runtime, not by overwriting any old report.
- AI handoff prompt can be generated and copied/displayed.

Self-test must not auto-run continuously.

## Menu Requirements

Google Sheet menu is not the primary FE. Keep it small:

- Open CBV Test Console WebApp.
- Bootstrap WebApp/Test Console Runtime.
- Health Check.
- Optional: Run WebApp Self-Test.

Do not add Test Console suite execution entries to business menus.

## Acceptance Criteria

- WebApp opens as standalone Test Console FE.
- Dashboard, Test Console, Report Library screens render.
- `google.script.run` APIs are the only FE-to-server path inside the WebApp.
- Operator can run one suite manually from FE.
- Run produces append-only Sheet report and Drive Markdown file.
- Drive report filename has next `000`-`999` prefix.
- Copy AI Handoff Prompt works.
- No auto-run, no continuous polling, no report deletion/overwrite.
- Existing Main Control WebApp JSON actions still work.
- Idempotent self-test exists and is callable.
- Implementation report is saved under `00_SYSTEM_BRAIN/000_REPORTS`.

## Runtime Verification Plan

After `clasp push` to the target Apps Script project:

1. Open spreadsheet and run menu **Health Check**.
2. Open **CBV Test Console WebApp** from menu.
3. Verify Dashboard loads.
4. Open Test Console screen.
5. Run safe suite `TEST_CONSOLE_RUNTIME_SELF_TEST` or an equivalent non-destructive registered self-test.
6. Confirm new row appended to `CBV_TEST_CONSOLE_REPORT`.
7. Confirm Drive Markdown report file created in report folder with next prefix.
8. Click **Copy AI Handoff Prompt** and paste into a scratch note to verify content.
9. Open Report Library and confirm the new report appears.
10. Re-run Health Check; record warnings/errors honestly.

## Required Final Report

Create an append-only report file:

`00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_F_WEBAPP_FE_RUNTIME_REPORT_<timestamp>.md`

Report must include:

- FILES CREATED
- FILES UPDATED
- TEST RESULT
- WARNINGS
- NEXT STEP
- PRODUCTION READINESS
- AI HANDOFF SUMMARY
- Runtime verification status
- Git status/commit/push/tag status if attempted

## Non-Goals

- Do not migrate business modules.
- Do not change TASK_MAIN visibility/schema.
- Do not make AppSheet changes.
- Do not remove historical reports.
- Do not auto-deploy.
- Do not auto-run tests on page load.
- Do not claim production-ready from static review only.

