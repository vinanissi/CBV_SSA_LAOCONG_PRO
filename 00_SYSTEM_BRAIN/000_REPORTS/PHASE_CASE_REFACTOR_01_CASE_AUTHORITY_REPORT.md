# Phase Report — CASE_REFACTOR_01 Case Authority

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-01 |
| **Branch** | `phase/case-centric-runtime-refactor` |
| **RUNTIME_STATE** | NOT_WIRED |

---

## Authority decisions made

| # | Topic | Decision |
|---|--------|----------|
| 1 | Case definition | Primary operational memory container for one real matter |
| 2 | Case vs Task | Case = matter; Task = work item under Case; Task stays persistence root |
| 3 | Checklist | Case steps; promote to Task only on explicit criteria |
| 4 | Document | Primarily Case-owned; task links allowed |
| 5 | Timeline | Case append-only history; federated read later |
| 6 | Comment | **Timeline entry type** (not separate entity) |
| 7 | Handoff | Case-level summary; task handoff is projection |
| 8 | WorkflowState | Case lifecycle stage; **not** workflow engine |
| 9 | Lifecycle codes | NEW, TRIAGE, ACTIVE, WAITING, REVIEW, BLOCKED, RESOLVED, CLOSED, ARCHIVED, REOPENED |
| 10 | Responsibility | Responsible / Support / Reviewer / Escalation / Watcher — no fabrication |
| 11 | Case identity | Logical caseKey; not operator-editable; multi-task per Case |
| 12 | Persistence | **NO CASE_MAIN** until phase 05 decision |
| 13 | Refactor strategy | Controlled refactor per `ADR_CASE_CENTRIC_RUNTIME` |
| 14 | Feature flags | `VITE_OCMS_CASE_STRIP_ENABLED` canonical; `OCMS_CASE_STRIP_ENABLED` doc alias |
| 15 | Workspace | Layout authority defined; not implemented |

---

## Files created/updated

### Created

- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_CASE_CENTRIC_RUNTIME.md`
- `00_SYSTEM_BRAIN/CASE/CASE_RUNTIME_AUTHORITY_V1.md`
- `00_SYSTEM_BRAIN/CASE/CASE_ENTITY_BOUNDARY_CONTRACT.md`
- `00_SYSTEM_BRAIN/CASE/CASE_READ_MODEL_AUTHORITY.md`
- `00_SYSTEM_BRAIN/CASE/CASE_WORKSPACE_LAYOUT_AUTHORITY.md`
- `00_SYSTEM_BRAIN/006_PHASES/PHASE_CASE_REFACTOR_01_CASE_AUTHORITY.md`
- `000_REPORTS/PHASE_CASE_REFACTOR_01_CASE_AUTHORITY_REPORT.md`
- `001_HANDOFF/PHASE_CASE_REFACTOR_01_CASE_AUTHORITY_HANDOFF.md`
- `005_TEST_EVIDENCE/PHASE_CASE_REFACTOR_01_CASE_AUTHORITY_TEST_EVIDENCE.md`

### Updated

- `006_PHASES/PHASE_REGISTRY.md`
- `CASE/CASE_PHASE_REGISTRY.md`
- `CASE/CASE_ROADMAP.md`
- `OCMS/OCMS_ROADMAP.md` (cross-link addendum)

---

## Conflicts

| Conflict | Resolution |
|----------|------------|
| OCMS vs Case refactor naming | **No conflict** — Case V1 **extends** OCMS; OCMS contracts remain normative for CaseReadModel fields |
| Task-centric URL vs Case UX root | **Documented transition** — taskId loader until workspace phase; additive routes later |
| Physical checklist on TASK vs logical Case owner | **GO_WITH_WARNINGS** — logical Case ownership; physical migration deferred |

No blocking ADR conflicts. **FAIL not required.**

---

## Warnings

1. Checklist rows remain `TASK_CHECKLIST` physically — operators may still perceive checklist as “part of task” until phase 03 UI.
2. `VITE_CASE_WORKSPACE_ENABLED` reserved but not in `.env.example` yet — add in phase 03.
3. AI Summary region in workspace is optional — no AI runtime bound in this phase.
4. Pre-existing unstaged workboard edits on branch — reconcile before phase 02 IMPLEMENT.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Developers conflate TASK.STATUS with WorkflowState | Boundary contract + OCMS orthogonality |
| Early CASE_MAIN pressure | Phase 05 gate in ADR |
| Dual header (strip + workspace) | Strip merges into Header per layout authority |

---

## Skipped items

- `npm run build` — authority-only phase
- OCMS ADR amendments — not required; relationship documented in authority §15

---

## Recommended next phase

**`PHASE_CASE_REFACTOR_02_CASE_READ_MODEL`** — IMPLEMENT read-model hardening; derive Case from task runtime; no CASE_MAIN, no Case API.

Do **not** start `PHASE_CASE_REFACTOR_03_CASE_WORKSPACE` until phase 02 accepted.

---

## Bundle

`phase_tmp/0001_PHASE_CASE_REFACTOR_01_CASE_AUTHORITY.zip`

---

*Authority phase complete.*
