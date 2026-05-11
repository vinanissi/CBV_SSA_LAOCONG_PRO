---
doc: 023_PHASE_B_LIVE_STAGING_GIT_COMMANDS
phase: PHASE_B_LIVE_STAGING_GREEN_EXECUTION_PREP
purpose: Git bundle for 023 prep artefacts — push only after operator + credential confirm
generatedAt: 2026-05-11T22:30:00+07:00
---

# Git commands — Phase B live staging green execution prep

## Precheck

```bash
git status --short
git remote -v
git branch --show-current
```

## Stage explicit artefacts (023 + brain append)

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/023_PHASE_B_LIVE_STAGING_GREEN_EXECUTION_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_LIVE_STAGING_PREFLIGHT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_TASK_OBS_STAGING_RUNBOOK.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_TASK_OBS_LIVE_GREEN_RUN_REPORT_TEMPLATE.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_LIVE_STAGING_EXECUTION_GATE_CHECKLIST.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_PHASE_B_LIVE_STAGING_AI_HANDOFF.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_PHASE_B_LIVE_STAGING_GIT_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/023_PHASE_B_LIVE_STAGING_GREEN_EXECUTION_REPORT.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/RUNTIME_OBSERVATION_LOG.md
```

## Verify

```bash
git diff --cached --name-only
git diff --cached --stat
```

Confirm **no** `.clasp.json` (without `.example`), no files containing pasted spreadsheet ids or tokens.

## Commit

```bash
git commit -m "docs(test): prepare TASK_OBS live staging green execution"
```

## Tag (local)

```bash
git tag -a phase-b-live-staging-green-prep-v0.1 -m "Prepare TASK_OBS live staging green execution"
```

## Push (operator + interactive credential)

```bash
git push origin phase/t0-task-binding-brain-bootstrap
git push origin phase-b-live-staging-green-prep-v0.1
```

Do **not** push if the shell cannot authenticate or the operator has not confirmed.
