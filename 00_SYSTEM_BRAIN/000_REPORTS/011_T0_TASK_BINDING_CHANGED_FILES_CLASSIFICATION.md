---
doc: 011_T0_TASK_BINDING_CHANGED_FILES_CLASSIFICATION
phase: T0_TASK_BINDING
purpose: Classify working tree changes for safe T0 TASK / TASK_OBS commit scope
generatedAt: 2026-05-11T20:05:00+07:00
---

# Changed files classification

Legend: **NHÓM** 1 = allowed for T0 TASK binding commit scope; 2 = review first; 3 = never commit; 4 = unclassified.

| File | Git | NHÓM | Lý do | Recommended action |
|------|-----|------|--------|---------------------|
| `apps-script/task/.clasp.json.example` | M | 1 | Example binding + `filePushOrder` for TASK/OBS; no secrets | STAGE |
| `apps-script/task/src/250_CBV_OBS_CORE_SCHEMA.js` | ?? | 1 | TASK_OBS baseline (schema) | STAGE |
| `apps-script/task/src/251_CBV_OBS_CORE_WRITER.js` | ?? | 1 | TASK_OBS baseline (writer) | STAGE |
| `apps-script/task/src/255_CBV_OBS_CORE_MENU_HELPERS.js` | ?? | 1 | TASK_OBS baseline (menu helpers) | STAGE |
| `apps-script/task/src/300_TASK_OBS_CONFIG.js` | ?? | 1 | TASK_OBS baseline (config) | STAGE |
| `apps-script/task/src/301_TASK_OBS_ADAPTER.js` | ?? | 1 | TASK_OBS baseline (adapter) | STAGE |
| `apps-script/task/src/307_TASK_OBS_MENU.js` | ?? | 1 | TASK_OBS baseline (menu) | STAGE |
| `docs/TASK_MODULE_CURRENT_STATE_AND_ROADMAP.md` | ?? | 1 | T0 / TASK module roadmap doc | STAGE |
| `docs/TASK_OBS_IMPLEMENTATION.md` | ?? | 1 | TASK_OBS implementation doc | STAGE |
| `docs/TASK_OBS_RUNTIME_VENDORING.md` | ?? | 1 | Runtime mirror / vendoring doc | STAGE |
| `docs/TASK_T0_DEPLOYMENT_BINDING_AUDIT.md` | ?? | 1 | T0 deployment binding audit | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF.md` | ?? | 1 | System brain handoff / audit artifact | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/AI_DEVELOPMENT_RULES.md` | ?? | 1 | Handoff package rules | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/AI_HANDOFF_SUMMARY.md` | ?? | 1 | Handoff summary | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/CURSOR_CONTINUE_PROMPT.md` | ?? | 1 | Continue prompt | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/MODULE_REGISTRY.md` | ?? | 1 | Module registry | STAGE |
| `00_SYSTEM_BRAIN/AI_HANDOFF_PACKAGE/NEXT_PHASE_BACKLOG.md` | ?? | 1 | Phase backlog | STAGE |
| `00_SYSTEM_BRAIN/ARCHITECTURE.md` | ?? | 1 | Architecture note (brain) | STAGE |
| `00_SYSTEM_BRAIN/CHANGELOG.md` | ?? | 1 | Changelog (brain) | STAGE |
| `00_SYSTEM_BRAIN/PHASE_REPORT.md` | ?? | 1 | Phase report | STAGE |
| `00_SYSTEM_BRAIN/README.md` | ?? | 1 | Brain README | STAGE |
| `00_SYSTEM_BRAIN/REPO_DESIGN_RECOMMENDATION.md` | ?? | 1 | Repo design recommendation | STAGE |
| `00_SYSTEM_BRAIN/REPO_INVENTORY.md` | ?? | 1 | Repo inventory | STAGE |
| `00_SYSTEM_BRAIN/SYSTEM_MAP.md` | ?? | 1 | System map | STAGE |
| `00_SYSTEM_BRAIN/_inventory_rows.csv` | ?? | 1 | Inventory extract (data-light) | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/ARCHITECTURE_OVERVIEW.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/CODE_INVENTORY.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/CURSOR_NEXT_ACTION_PROMPT.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/GAP_AND_NEXT_PHASE_PLAN.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/MODULE_MAP.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/REPO_FULL_SUMMARY.md` | ?? | 1 | Summary RUN report | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/REPO_SUMMARY_REPORT.json` | ?? | 1 | Summary RUN JSON (no secrets by design) | STAGE |
| `00_SYSTEM_BRAIN/REPO_FULL_SUMMARY_REPORT/RUN_20260511_182715/RUNTIME_AND_TEST_CONSOLE_AUDIT.md` | ?? | 1 | Summary RUN report | STAGE |
| `tools/repo-audit/.gitignore` | ?? | 1 | Repo audit tooling (supporting visibility) | STAGE |
| `tools/repo-audit/README.md` | ?? | 1 | Repo audit README | STAGE |
| `tools/repo-audit/out/smoke-cbv-pro.md` | !! (ignored) | 1 → skip | Under `out/` per `tools/repo-audit/.gitignore` — **Git will not stage** without `-f` | SKIP _(gitignore)_ |
| `tools/repo-audit/repo-audit-report-template.md` | ?? | 1 | Report template | STAGE |
| `tools/repo-audit/repo-audit.ps1` | ?? | 1 | Audit script (read-only scan) | STAGE |
| `00_SYSTEM_BRAIN/000_PROMPTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_PROMPT.md` | ?? | 1 | This phase prompt archive | STAGE |
| `00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_CHANGED_FILES_CLASSIFICATION.md` | ?? | 1 | Classification report | STAGE |
| `00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMANDS.md` | ?? | 1 | Command bundle (to be written) | STAGE |
| `00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md` | ?? | 1 | Prep report (to be written) | STAGE |

## Summary

- **NHÓM 1:** 43 paths committed (task example + 6 OBS + 4 TASK docs + 22 brain + 4 tools + 4×011 artifacts + **2** updates to tracked `CBV_AI_WORK_BRAIN/*` logs); `tools/repo-audit/out/*.md` excluded by `.gitignore`.
- **NHÓM 2:** _(none in current working tree — no modified `20_TASK_*`, main-control, `05_GAS_RUNTIME`, or AppSheet paths)._
- **NHÓM 3:** _(none detected in listed changes)._
- **NHÓM 4:** _(none — all current `git status` entries mapped to NHÓM 1)._

## Notes

- No `20_TASK_SERVICE.js` / repository / router edits appear in `git status`; TASK business runtime is untouched in this tree snapshot.
- Real `.clasp.json` remains git-ignored elsewhere; only `.clasp.json.example` is modified.
