---
doc: 023_TASK_OBS_LIVE_GREEN_RUN_REPORT_TEMPLATE
purpose: Copy this file per RUN (e.g. into RUN_<timestamp>/ ) and fill — never commit real IDs
---

# TASK_OBS — live green run report (TEMPLATE)

**Copy file before filling.** Store filled copy under `00_SYSTEM_BRAIN/.../RUN_<timestamp>/` or operator vault per policy. **Redact** if sharing.

## Metadata

- **checkedAt:** _ISO-8601_
- **operator:** _email or handle_
- **environment:** `STAGING`
- **staging spreadsheet id:** `VAULT_ONLY_DO_NOT_WRITE`
- **script project:** `VAULT_ONLY_DO_NOT_WRITE` _(Apps Script project label or internal ref — not secret id in shared repo)_

## Execution

- **functions run:** _e.g. TaskObs_bootstrapDryRun, TaskObs_bootstrap, TaskObs_healthCheck, TaskObs_runSelfTest_
- **RUN_ID:** _from self-test / TASK_OBS_TEST_RUN_
- **health result:** _ok / code / summary_
- **self-test result:** _ok / counts / final status_

## Verification

- **OBS sheets created:** _list tab names observed — no ids_
- **row count before/after:** _e.g. TEST_RUN: n → m_
- **TASK_MAIN mutation check:** `PASS` / `FAIL` _(must PASS for green)_
- **append-only check:** `PASS` / `FAIL` _(new rows only, no mass clear)_
- **envelope contract check:** `PASS` / `SKIP` _(see 020_TEST_RUNTIME_CONTRACT.md)_

## Outcome

- **status:** `GO` | `GO_WITH_WARNINGS` | `FAIL`
- **nextStep:** _one line_

## Operator attestation

- I confirm this run was against **staging** only: _______________________
