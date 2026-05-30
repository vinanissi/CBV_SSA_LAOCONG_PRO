# HOTFIX PHASE 88.2 — FE Architecture Safety Rule Text Gate Fix — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Context

Phase 88.1 fixed persistence and detailed logging.

Latest GAS run of `CbvFeArchitecture_TestConsole_run()`:

- `status=FAIL`
- `envelopeOk=true`
- `failedChecks=2`

Failed checks:

- `RULE_NO_AUTO_RESOLVE` — require phrase: **No auto resolve**
- `RULE_NO_AUTO_ESCALATE` — require phrase: **No auto escalate**

Root cause:

- Phase 88 rule text used a combined phrase: `No auto assign / auto resolve / auto escalate`
- Validator requires exact substring matches: `No auto resolve`, `No auto escalate`

## Mission

Docs/decision text hotfix only:

- Add the exact phrases:
  - `No auto resolve`
  - `No auto escalate`

Placement (recommended):

1. `00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md`
2. `docs/architecture/PHASE_88_FE_ARCHITECTURE_REBALANCE_CLOSEOUT.md`
3. `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md`

Constraints:

- Do not redesign Phase 88.
- Do not weaken validator.
- Do not start Phase 89.

Local checks:

- `git status --short`
- `node --check 05_GAS_RUNTIME/90_FE_ARCHITECTURE_REBALANCE_TEST_CONSOLE.js`
- `node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU.js`
- `node --check 05_GAS_RUNTIME/90_BOOTSTRAP_MENU_WRAPPERS.js`
- `Select-String -Path "00_SYSTEM_BRAIN/002_DECISIONS/022_FE_ARCHITECTURE_REBALANCE_DECISION.md","docs/architecture/*.md" -Pattern "No auto resolve","No auto escalate"`

