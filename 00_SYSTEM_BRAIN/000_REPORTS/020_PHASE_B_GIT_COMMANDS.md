---
doc: 020_PHASE_B_GIT_COMMANDS
phase: PHASE_B_TEST_RUNTIME
purpose: Staging commands for Phase B docs — no push until operator confirms
generatedAt: 2026-05-11T21:30:00+07:00
---

# Phase B — Git command bundle

## Stage (explicit paths)

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/020_PHASE_B_TEST_RUNTIME_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_TASK_OBS_RUNTIME_AUDIT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_TEST_RUNTIME_CONTRACT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_TEST_RUNTIME_REPORT_TEMPLATE.json
git add 00_SYSTEM_BRAIN/000_REPORTS/020_TEST_RUNTIME_APPEND_ONLY_POLICY.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_STAGING_RUNTIME_RISK_REPORT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_TEST_CONSOLE_BASELINE.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_PHASE_B_AI_HANDOFF.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_PHASE_B_GIT_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/020_PHASE_B_TEST_RUNTIME_REPORT.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/RUNTIME_OBSERVATION_LOG.md
```

If committing prior **012** push-record artefacts in the same commit, add:

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md
```

## Verify staged

```bash
git diff --cached --name-only
git diff --cached --stat
```

## Commit

```bash
git commit -m "docs(test): establish phase B test runtime baseline"
```

## Tag (local)

```bash
git tag -a phase-b-test-runtime-v0.1 -m "Phase B test runtime baseline"
```

## Push (operator confirms)

```bash
git push origin phase/t0-task-binding-brain-bootstrap
git push origin phase-b-test-runtime-v0.1
```

**Do not** run `git push` from automation without credential confirmation.
