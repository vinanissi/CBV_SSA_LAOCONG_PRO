# Phase Report — CASE_REFACTOR_00 Repository Audit

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-01 |
| **Branch** | `phase/case-centric-runtime-refactor` |
| **RCLA** | CBV-RCLA v1.1 |
| **RUNTIME_STATE** | NOT_WIRED (per `003_RUNTIME_STATE.md` stub rule) |

---

## Scope audited

- Full repo structure (top-level + runtime paths)
- Frontend: `apps/workboard` (inbox, focus, OCMS, task detail)
- Backend: `workers/api` (router, task GS DB, work-inbox modules, adapters)
- GAS: `05_GAS_RUNTIME`, `gas-runtime-api`
- Data: `90_BOOTSTRAP_SCHEMA.js`, `06_DATABASE` exports
- Governance: OCMS ADRs, phase registry, OCMS roadmap, prior OCMS_03A–03E reports
- Build tooling: `apps/workboard/package.json` scripts

---

## Files inspected (representative)

- `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION.md` (+ OCMS ADR set)
- `00_SYSTEM_BRAIN/OCMS/OCMS_ROADMAP.md`, `OCMS_READ_MODEL_CONTRACT.md`
- `apps/workboard/src/modules/task/**`, `apps/workboard/src/modules/ocms/**`
- `workers/api/src/router.ts`, `modules/*`, `adapters/*`
- `gas-runtime-api/40_TaskDbService.js`, `46_WorkInboxOperationalService.js`
- `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`
- `.clasp.json`, `gas-runtime-api/.clasp.json`

---

## Deliverables created

| # | Artifact | Path |
|---|----------|------|
| 9.1 | Current architecture map | `00_SYSTEM_BRAIN/CASE/CURRENT_ARCHITECTURE_MAP.md` |
| 9.2 | Module inventory | `00_SYSTEM_BRAIN/CASE/MODULE_INVENTORY.md` |
| 9.3 | Data model map | `00_SYSTEM_BRAIN/CASE/DATA_MODEL_MAP.md` |
| 9.4 | UI runtime map | `00_SYSTEM_BRAIN/CASE/UI_RUNTIME_MAP.md` |
| 9.5 | Task dependency map | `00_SYSTEM_BRAIN/CASE/TASK_DEPENDENCY_MAP.md` |
| 9.6 | Keep/Drop/Rewrite matrix | `00_SYSTEM_BRAIN/CASE/KEEP_DROP_REWRITE_MATRIX.md` |
| 9.7 | Case target architecture | `00_SYSTEM_BRAIN/CASE/CASE_TARGET_ARCHITECTURE.md` |
| 9.8 | Extraction plan | `00_SYSTEM_BRAIN/CASE/CASE_RUNTIME_EXTRACTION_PLAN.md` |
| 9.9 | This report | `000_REPORTS/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_REPORT.md` |
| 9.10 | Handoff | `001_HANDOFF/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_HANDOFF.md` |
| 9.11 | Test evidence | `005_TEST_EVIDENCE/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT_TEST_EVIDENCE.md` |
| — | Phase charter | `006_PHASES/PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT.md` |
| — | Case roadmap | `00_SYSTEM_BRAIN/CASE/CASE_ROADMAP.md` |
| — | Case phase registry | `00_SYSTEM_BRAIN/CASE/CASE_PHASE_REGISTRY.md` |

---

## Findings (executive)

1. **Refactor is feasible** without rebuilding from scratch — OCMS already provides read-model Case context on Task-centric execution.
2. **No `CASE_MAIN`** exists; grep confirms only negative assertions in OCMS checks — correct for this phase.
3. **Task remains root** for routes, APIs, and persistence (`TASK_ID` on checklist/timeline/attachments).
4. **OCMS strip** is flag-gated (`VITE_OCMS_CASE_STRIP_ENABLED`, default off) — safe rollout path for Case workspace evolution.
5. **Dual GAS projects** (`05_GAS_RUNTIME` + `gas-runtime-api`) — worker production path uses gas-runtime-api for task/inbox ops.
6. **HO_SO / FINANCE** modules provide case anchors via `RELATED_ENTITY_*` — discovery logic already in FE.

---

## Audit questions answered

| # | Answer |
|---|--------|
| 1 What exists? | Task-centric Work Inbox V3 + worker + gas-runtime-api + OCMS read strip |
| 2 What is used at runtime? | Paths in MODULE_INVENTORY marked CRITICAL |
| 3 Dead/obsolete? | `taskWrite` PATCH, RF12 GET stubs — DEPRECATED |
| 4 Duplicated? | Task detail vs focus tabs (partial overlap) |
| 5 Task-centric should remain? | TASK_MAIN mutations, inbox rows, assign/complete |
| 6 Should move under Case? | Checklist concept, federated timeline, workspace shell |
| 7 Reuse as-is? | OCMS derive/discovery/key, adapters, schema |
| 8 Adapters? | Operational bundle, timeline merge, future case-scoped reads |
| 9 Rewrite? | None recommended in early phases — ADAPTER pattern |
| 10 Drop? | Legacy taskWrite when verified unused |
| 11 Target architecture? | `CASE_TARGET_ARCHITECTURE.md` |
| 12 Safest next phase? | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |

---

## Governance compliance

- Tier 1 entrypoint load performed
- No conflict with accepted OCMS ADRs — Case refactor **extends** foundation
- No schema/API/UI runtime code changed **by this phase**
- Append-only registry update planned
- `RUNTIME_STATE: NOT_WIRED` reported (not inferred)

---

## Risks

| Risk | Level |
|------|-------|
| Big-bang Case table | HIGH if rushed — mitigated by phase 05 eval |
| Route/taskId bookmark break | MEDIUM — use additive routes |
| Pre-existing unstaged workboard edits on branch | MEDIUM — verify before next IMPLEMENT phase |
| Flag naming drift (OCMS vs VITE_) | LOW |

---

## Warnings

1. **Feature flag naming:** docs reference `OCMS_CASE_STRIP_ENABLED`; runtime uses `VITE_OCMS_CASE_STRIP_ENABLED` — align in phase 01.
2. **Unstaged workboard changes** on branch (`FocusTaskWorkspace`, etc.) predate this audit — not introduced by phase 00; reconcile before IMPLEMENT.
3. **`npm run build`** not executed in audit window (optional) — documented in test evidence.
4. **OCMS_04 federated timeline** not implemented — Case timeline remains task-scoped until phase 04.

---

## Blockers

None blocking phase 01 authority work.

---

## Recommended next phase

**`PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`** — DOC-ONLY; formalize Case as operational root; boundaries for Checklist/Task/Document/Timeline/Handoff; no `CASE_MAIN`.

---

## Bundle

See `phase_tmp/0001_PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT.zip` and `PHASE_BUNDLE_INDEX.md` inside archive.

---

*Audit-only phase complete.*
