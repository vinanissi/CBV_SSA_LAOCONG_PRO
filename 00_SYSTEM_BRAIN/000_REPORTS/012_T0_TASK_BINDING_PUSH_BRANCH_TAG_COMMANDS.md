---
doc: 012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS
purpose: Command bundle for verifying remote + pushing T0 branch and tag
generatedAt: 2026-05-11T20:45:00+07:00
---

# T0 TASK binding — push branch + tag

Run prechecks first; do not push if remote URL contains credentials.

## 1. Kiểm tra remote sạch

```bash
git remote -v
```

Expected (both fetch and push):

`https://github.com/vinanissi/CBV_SSA_LAOCONG_PRO.git`

## 2. Kiểm tra branch

```bash
git branch --show-current
```

Expected: `phase/t0-task-binding-brain-bootstrap`

## 3. Kiểm tra HEAD

```bash
git log --oneline --decorate -n 3
```

Expected HEAD subject includes: `chore(task): prepare T0 binding and TASK_OBS baseline`

## 4. Kiểm tra tag point tới HEAD

```bash
git rev-list -n 1 t0-task-binding-v0.1
git rev-parse HEAD
```

The two lines must print the **same** commit object id.

## 5. Push branch

```bash
git push origin phase/t0-task-binding-brain-bootstrap
```

## 6. Push tag

```bash
git push origin t0-task-binding-v0.1
```

Run **only** after branch push succeeds.

## 7. Verify remote refs

```bash
git ls-remote --heads origin phase/t0-task-binding-brain-bootstrap
git ls-remote --tags origin t0-task-binding-v0.1
```

## Follow-up (record push + brain — local only, operator confirms push)

```bash
git add 00_SYSTEM_BRAIN/000_PROMPTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/DECISION_LOG.md
git add 00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/RUNTIME_OBSERVATION_LOG.md

git commit -m "docs(git): record T0 binding branch and tag push"
git tag -a t0-task-binding-push-record-v0.1 -m "Record T0 TASK binding branch/tag push"
```

Do **not** push the follow-up commit/tag until the operator explicitly requests it.
