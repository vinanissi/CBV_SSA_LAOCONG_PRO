---
doc: DECISION_LOG
module: CBV_AI_WORK_BRAIN
purpose: Record decisions affecting architecture, binding, or operations
doctrine: Append-only — each entry is immutable once written; add corrections as new entries
updated: 2026-05-11
---

# DECISION_LOG

## Template (copy for new entries)

```
### YYYY-MM-DD — <short title>
- **Context:**
- **Decision:**
- **Alternatives considered:**
- **Consequences:**
- **Links:**
```

## 2026-05-11 — Establish CBV_AI_WORK_BRAIN

- **Context:** Phase T0 requires a neutral brain workspace separate from production runtime.
- **Decision:** Create `00_SYSTEM_BRAIN/CBV_AI_WORK_BRAIN/` with append-only logs and prompt/context folders.
- **Alternatives considered:** Relying solely on ad-hoc chat exports (rejected: poor traceability).
- **Consequences:** Operators maintain pointers in `MEMORY_INDEX.md`; secrets remain forbidden here.
- **Links:** `00_SYSTEM_BRAIN/PHASE_T0_TASK_BINDING_BRAIN_BOOTSTRAP/RUN_2026-05-11_185824/BRAIN_BOOTSTRAP_REPORT.md`

## 2026-05-11 — T0 TASK binding Git scope

- **Context:** T0_TASK_BINDING phase; working tree contained TASK_OBS sources, TASK docs, brain inventory, and audit tooling.
- **Decision:** Only **classified NHÓM 1** paths may be committed for this slice; no real `.clasp.json`, no PAT in remote, no push without operator confirmation.
- **Alternatives considered:** Single mega-commit including NHÓM 2 runtime (rejected for this phase).
- **Consequences:** Local tag `t0-task-binding-v0.1` documents the slice; mirror drift with `05_GAS_RUNTIME` remains a follow-up concern, not hidden by this commit.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/011_T0_TASK_BINDING_GIT_COMMIT_TAG_PUSH_PREP_REPORT.md`

## 2026-05-11 — T0 branch/tag remote checkpoint (push audit)

- **Context:** Post–T0 binding commit `ddde81b92ddfffc7bad298826671386e108b8c30`; operator requested push branch + tag after clean precheck.
- **Fact (read-only):** `git ls-remote` showed `refs/heads/phase/t0-task-binding-brain-bootstrap` at `ddde81b…` and `refs/tags/t0-task-binding-v0.1` (annotated) peeling to the same commit.
- **Fact (automation):** `git push` from the non-interactive agent shell **failed** (exit 128, no GitHub username / no TTY) — **no force push** was used; **no Apps Script deploy** in this step.
- **Decision:** Treat remote as already aligned unless operator needs a fresh write confirmation; re-run `git push` locally with normal credentials if desired. Do **not** auto-push follow-up documentation commits without operator approval.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_REPORT.md`, `00_SYSTEM_BRAIN/000_REPORTS/012_T0_TASK_BINDING_PUSH_BRANCH_TAG_COMMANDS.md`

## 2026-05-11 — Phase B test runtime baseline (docs only)

- **Context:** Maturity path L3.8→L4 prep; operational workspace governance; Phase B establishes test/OBS **contract and audit docs** without changing TASK business runtime.
- **Decision:** **TEST RUNTIME** artefacts (contracts, templates, staging risk, test-console design) must remain **separate** from TASK business runtime mutations; **no auto-deploy** of Apps Script; **staging-first** for any future self-test execution.
- **Alternatives considered:** Implementing `🧪 CBV Test Console` menu in production script immediately (deferred — design captured in `020_TEST_CONSOLE_BASELINE.md` only).
- **Consequences:** Next phase `phase/t0-task-obs-green-baseline` owns live smoke/health on staging; follow-up Git commit/tag for Phase B docs uses `020_PHASE_B_GIT_COMMANDS.md` and requires operator push confirmation.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/020_PHASE_B_TEST_RUNTIME_REPORT.md`, `00_SYSTEM_BRAIN/000_REPORTS/020_TEST_RUNTIME_CONTRACT.md`

## 2026-05-11 — TEST RUNTIME green baseline (staging-first)

- **Context:** Phase B extension toward **green baseline** on staging; planning docs and checklists added (`021_*`).
- **Decision:** Green baseline work is **staging-first**; **no production Apps Script deploy** during baseline phase; **no `TASK_MAIN` business mutation** as part of OBS health/self-test acceptance.
- **Alternatives considered:** Running self-test against production spreadsheet “because it’s faster” (rejected — governance violation).
- **Consequences:** Operator executes `021_TASK_OBS_GREEN_BASELINE_CHECKLIST.md` on a dedicated staging file; Git commit for docs follows `021_PHASE_B_GREEN_BASELINE_GIT_COMMANDS.md` with operator-controlled push.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/021_STAGING_RUNTIME_PLAN.md`, `00_SYSTEM_BRAIN/000_REPORTS/021_PHASE_B_TEST_RUNTIME_GREEN_BASELINE_REPORT.md`

## 2026-05-11 — Live staging green execution prep (operator-confirmed)

- **Context:** Phase B extension — **live staging** TASK_OBS runbook, preflight, RUN template, execution gate checklist; no real RUN_ID in repo yet.
- **Decision:** Live staging green execution is **operator-confirmed** only; **`CBV_TASK_DB_ID` must never be written into Git**; **production deploy is forbidden** during this prep phase; real **`.clasp.json` stays local-only** (gitignored), never committed.
- **Alternatives considered:** Agent-run `clasp push` / Script Property injection (rejected — no credentials, no ids in repo).
- **Consequences:** Operator follows `023_TASK_OBS_STAGING_RUNBOOK.md` and fills run report from template outside secret-bearing paths; Git commit/tag/push for docs uses `023_PHASE_B_LIVE_STAGING_GIT_COMMANDS.md` when ready.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/023_PHASE_B_LIVE_STAGING_GREEN_EXECUTION_REPORT.md`, `00_SYSTEM_BRAIN/000_REPORTS/023_LIVE_STAGING_PREFLIGHT.md`

## 2026-05-11 — Operator run governance (runtime evidence classification)

- **Context:** Phase **LIVE STAGING OPERATOR RUN** prep — second-operator execution package, evidence retention, sanitized Git flow, post-run governance.
- **Decision:** **Runtime evidence** must be classified **Git-safe** vs **Vault-only** before commit; a real **RUN_ID is not required in Git** — sanitized summary or vault pointer is sufficient; **production planning** proceeds **only** after a **real staging green baseline** is signed off under `024_POST_RUN_GOVERNANCE.md` rules.
- **Alternatives considered:** Committing full RUN report with spreadsheet id for “traceability” (rejected — violates secret/id policy).
- **Consequences:** Operators use `024_OPERATOR_EXECUTION_PACKAGE.md` + `024_SANITIZED_RUNTIME_GIT_FLOW.md`; AI/session tools never paste ids into repo files.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/024_PHASE_B_LIVE_STAGING_OPERATOR_RUN_REPORT.md`, `00_SYSTEM_BRAIN/000_REPORTS/024_RUNTIME_EVIDENCE_FLOW.md`

## 2026-05-11 — Phase E Operational Workflow Runtime (code + sheets contract)

- **Context:** Evolve Verification Pipeline (Phase D) into an operational workflow layer: explicit states, guarded transitions, append-only timeline/incident/approval sheets, HTML workflow viewer, Test Console menu surface; no auto-deploy, no auto-approve.
- **Decision:** Ship `334`–`340` + `339` HTML under `apps-script/main-control/src/` with mirrored copies under `apps-script/production-core/src/`; `READY_FOR_DEPLOY` → `DEPLOYED` requires `ScriptProperties.CBV_OPERATIONAL_DEPLOY_UNLOCK=I_UNDERSTAND` only for **non–validate-only** transitions; `validateOnly` may confirm graph legality without unlock; verification pipeline calls `CBV_OperationalIncident_hookFromVerificationReport_` when incident conditions match.
- **Alternatives considered:** Auto-approve or silent deploy hooks (rejected); requiring unlock even for `validateOnly` (rejected — blocks honest transition validation UX).
- **Consequences:** Operators must run GAS self-tests in a bound spreadsheet; production readiness remains **not** asserted until live workflow verification passes; Git push/tag may still fail without remote credentials (recorded in phase report, not hidden).
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/028_PHASE_E_OPERATIONAL_WORKFLOW_RUNTIME_REPORT_20260511_221125.md`, `00_SYSTEM_BRAIN/000_PROMPTS/028_PHASE_E_OPERATIONAL_WORKFLOW_RUNTIME_PROMPT_20260511_221125.md`

## 2026-05-11 — Phase F WebApp FE Runtime prompt boundary

- **Context:** Next phase must refactor CBV Test Console Runtime so Google Apps Script WebApp becomes the primary operator Frontend, while Sheet menu remains only a launcher/bootstrap/health surface.
- **Decision:** Archive a dedicated Phase F execution prompt before implementation. The prompt requires add-only/idempotent WebApp FE files, `google.script.run` server APIs, Dashboard/Test Console/Report Library screens, explicit manual suite runs only, append-only `CBV_TEST_CONSOLE_REPORT` writes, Drive Markdown export with `000`-`999` prefix allocation, Copy AI Handoff Prompt, and self-test/runtime verification.
- **Alternatives considered:** Direct implementation without prompt/report trace (rejected: violates memory-first workflow); replacing existing `doGet(e)` wholesale (rejected: must preserve Main Control JSON WebApp actions).
- **Consequences:** Implementation remains a separate Phase F step; production readiness is not asserted until live Apps Script WebApp verification proves FE, Sheet append, Drive export, and AI handoff behavior.
- **Links:** `00_SYSTEM_BRAIN/000_PROMPTS/029_PHASE_F_WEBAPP_FE_RUNTIME_PROMPT_20260511_223100.md`, `00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_F_WEBAPP_FE_RUNTIME_PROMPT_REPORT_20260511_223100.md`

## 2026-05-11 — Phase F WebApp FE Runtime implementation

- **Context:** Execute Phase F prompt so the CBV Test Console operator surface moves from Sheet menu suite actions to an independent Google Apps Script WebApp FE.
- **Decision:** Add WebApp route/API/model/self-test/HTML files under `apps-script/main-control/src/`, wire existing `doGet(e)` with a guarded Test Console UI branch, reduce the Sheet menu to WebApp launcher/bootstrap/health/self-test/report sheet, and mirror the WebApp runtime files/menu in `apps-script/production-core/src/`.
- **Alternatives considered:** Keeping registry suite run slots in the Sheet menu (rejected: WebApp must be primary FE); adding a second `doGet(e)` (rejected: Apps Script supports one entry and existing JSON WebApp actions must remain intact).
- **Consequences:** Operators must deploy/push GAS and verify in a bound Apps Script runtime before any production-ready claim. WebApp suite runs are manual-only, append reports after Drive export so Sheet rows include Drive metadata, and old report rows/files are not overwritten.
- **Links:** `00_SYSTEM_BRAIN/000_REPORTS/029_PHASE_F_WEBAPP_FE_RUNTIME_REPORT_20260511_223900.md`, `00_SYSTEM_BRAIN/000_PROMPTS/029_PHASE_F_WEBAPP_FE_RUNTIME_PROMPT_20260511_223100.md`

## 2026-05-11 — Phase G Guided Runtime Session layer

- **Context:** Move CBV Test Console WebApp from a manual runtime console toward a guided operational runtime with sessions, state machine, timeline, guidance, recovery, and runtime lock.
- **Decision:** Add Phase G runtime layers as append-only sheet-backed logs (`CBV_TC_RUNTIME_SESSION`, `CBV_TC_RUNTIME_TIMELINE`, `CBV_TC_RUNTIME_LOCK_LOG`) plus current active session/lock properties for operation. Extend WebApp APIs and FE with a Guidance screen while keeping suite execution manual-only.
- **Alternatives considered:** Encoding guidance only in FE state (rejected: loses operational memory); auto-running recovery or verification after failures (rejected: violates manual-first and production-safe rules).
- **Consequences:** Runtime history is auditable through append-only logs, but live Apps Script verification is still required. Active session/lock properties are operational cursors, not audit history; Sheet logs are the source for continuity.
- **Links:** `00_SYSTEM_BRAIN/000_PROMPTS/030_PHASE_G_RUNTIME_SESSION_GUIDANCE_LAYER_PROMPT_20260511_230200.md`, `00_SYSTEM_BRAIN/000_REPORTS/030_PHASE_G_RUNTIME_SESSION_GUIDANCE_LAYER_REPORT_20260511_231000.md`
