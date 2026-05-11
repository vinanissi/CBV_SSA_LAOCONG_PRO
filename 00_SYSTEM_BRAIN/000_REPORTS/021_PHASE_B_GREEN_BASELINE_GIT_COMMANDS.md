---
doc: 021_PHASE_B_GREEN_BASELINE_GIT_COMMANDS
purpose: Git bundle for Phase B green baseline docs — push only after operator confirm
generatedAt: 2026-05-11T22:00:00+07:00
---

# Phase B green baseline — Git commands

## Stage (021 artefacts + brain append)

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/021_PHASE_B_TEST_RUNTIME_GREEN_BASELINE_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_STAGING_RUNTIME_PLAN.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_TASK_OBS_GREEN_BASELINE_CHECKLIST.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_TEST_RUNTIME_EXECUTION_FLOW.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_TASK_OBS_SHEET_MAP.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_TEST_CONSOLE_IMPLEMENTATION_PLAN.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_PHASE_B_GREEN_BASELINE_AI_HANDOFF.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_PHASE_B_GREEN_BASELINE_GIT_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/021_PHASE_B_TEST_RUNTIME_GREEN_BASELINE_REPORT.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/RUNTIME_OBSERVATION_LOG.md
```

Optional — include prior uncommitted Phase B / push-record docs in the same commit:

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT.md
git add 00_SYSTEM_BRAIN/000_PROMPTS/020_PHASE_B_TEST_RUNTIME_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_*.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_*.json
```

## Verify

```bash
git diff --cached --name-only
git diff --cached --stat
```

## Commit

```bash
git commit -m "docs(test): define TASK_OBS green baseline staging flow"
```

## Tag (local)

```bash
git tag -a phase-b-green-baseline-v0.1 -m "Phase B green baseline staging flow"
```

## Push (operator confirms)

```bash
git push origin phase/t0-task-binding-brain-bootstrap
git push origin phase-b-green-baseline-v0.1
```

Do **not** run `git push` without interactive credential confirmation.
