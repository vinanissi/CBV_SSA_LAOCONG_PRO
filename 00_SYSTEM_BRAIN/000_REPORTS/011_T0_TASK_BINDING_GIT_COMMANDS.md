---
doc: 011_T0_TASK_BINDING_GIT_COMMANDS
phase: T0_TASK_BINDING
purpose: Proposed Git commands for NHÓM 1 only (no push until operator confirms)
generatedAt: 2026-05-11T20:05:00+07:00
---

# T0 TASK binding — Git commands (NHÓM 1)

If tag `t0-task-binding-v0.1` already exists locally, use `t0-task-binding-v0.2` (or delete/recreate only before any share/push).

## 1. Kiểm tra trước commit

```bash
git status --short
git remote -v
git branch --show-current
```

Confirm: branch `phase/t0-task-binding-brain-bootstrap`, remote URLs contain **no** `ghp_` / `github_pat_` / embedded passwords.

## 2. Stage đúng phạm vi T0 TASK binding (NHÓM 1)

Explicit paths (matches classification table):

```bash
git add apps-script/task/.clasp.json.example
git add apps-script/task/src/250_CBV_OBS_CORE_SCHEMA.js
git add apps-script/task/src/251_CBV_OBS_CORE_WRITER.js
git add apps-script/task/src/255_CBV_OBS_CORE_MENU_HELPERS.js
git add apps-script/task/src/300_TASK_OBS_CONFIG.js
git add apps-script/task/src/301_TASK_OBS_ADAPTER.js
git add apps-script/task/src/307_TASK_OBS_MENU.js
git add docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md
git add docs/TASK_OBS_IMPLEMENTATION.md
git add docs/TASK_OBS_RUNTIME_VENDORING.md
git add docs/TASK_T0_DEPLOYMENT_BINDING_AUDIT.md
git add 00_SYSTEM_BRAIN/AI_HANDOFF.md
git add 00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/
git add 00_SYSTEM_BRAIN/ARCHITECTURE.md
git add 00_SYSTEM_BRAIN/CHANGELOG.md
git add 00_SYSTEM_BRAIN/PHASE_REPORT.md
git add 00_SYSTEM_BRAIN/README.md
git add 00_SYSTEM_BRAIN/REPO_DESIGN_RECOMMENDATION.md
git add 00_SYSTEM_BRAIN/REPO_INVENTORY.md
git add 00_SYSTEM_BRAIN/SYSTEM_MAP.md
git add 00_SYSTEM_BRAIN/_inventory_rows.csv
git add 00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/
git add tools/repo-audit/
git add 00_SYSTEM_BRAIN/000_PROMPTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_CHANGED_FILES_CLASSIFICATION.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md
```

**Shortcut (equivalent if tree matches classification):**

```bash
git add apps-script/task/.clasp.json.example apps-script/task/src/250_CBV_OBS_CORE_SCHEMA.js apps-script/task/src/251_CBV_OBS_CORE_WRITER.js apps-script/task/src/255_CBV_OBS_CORE_MENU_HELPERS.js apps-script/task/src/300_TASK_OBS_CONFIG.js apps-script/task/src/301_TASK_OBS_ADAPTER.js apps-script/task/src/307_TASK_OBS_MENU.js
git add docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md docs/TASK_OBS_IMPLEMENTATION.md docs/TASK_OBS_RUNTIME_VENDORING.md docs/TASK_T0_DEPLOYMENT_BINDING_AUDIT.md
git add 00_SYSTEM_BRAIN/AI_HANDOFF.md 00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/ 00_SYSTEM_BRAIN/ARCHITECTURE.md 00_SYSTEM_BRAIN/CHANGELOG.md 00_SYSTEM_BRAIN/PHASE_REPORT.md 00_SYSTEM_BRAIN/README.md 00_SYSTEM_BRAIN/REPO_DESIGN_RECOMMENDATION.md 00_SYSTEM_BRAIN/REPO_INVENTORY.md 00_SYSTEM_BRAIN/SYSTEM_MAP.md 00_SYSTEM_BRAIN/_inventory_rows.csv 00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/
git add tools/repo-audit/
git add 00_SYSTEM_BRAIN/000_PROMPTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_PROMPT.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_CHANGED_FILES_CLASSIFICATION.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMANDS.md
git add 00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md
```

## 3. Kiểm tra staged files

```bash
git diff --cached --name-only
git diff --cached --stat
```

Verify: **no** `apps-script/**/.clasp.json` (real), no `WEBHOOK_URL.txt`, no `.clasprc.json`.

## 4. Commit theo ngữ cảnh

```bash
git commit -m "chore(task): prepare T0 binding and TASK_OBS baseline"
```

## 5. Tạo tag local theo ngữ cảnh

```bash
git tag -a t0-task-binding-v0.1 -m "T0 TASK binding prep and TASK_OBS baseline"
```

If tag exists:

```bash
git tag -a t0-task-binding-v0.2 -m "T0 TASK binding prep and TASK_OBS baseline"
```

## 6. Push branch sau khi operator xác nhận

```bash
git push origin phase/t0-task-binding-brain-bootstrap
```

## 7. Push tag sau khi operator xác nhận

```bash
git push origin t0-task-binding-v0.1
```

(or `t0-task-binding-v0.2` if you bumped the tag)

## Notes

- Không tự chạy push nếu chưa được operator xác nhận.
- Không tự chạy tag nếu commit chưa thành công.
- Không push tag nếu branch chưa push ổn.
