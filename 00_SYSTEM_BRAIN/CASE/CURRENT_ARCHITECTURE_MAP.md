# Current Architecture Map — Repository Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01  
**Status:** Evidence-based snapshot (audit-only)

---

## High-level repository structure

```text
CBV_SSA_LAOCONG_PRO/
├── 00_META/                    # Constitution, service contracts
├── 00_SYSTEM_BRAIN/            # Phases, ADRs, OCMS/DSR/CASE authority packs
├── 02_MODULES/                 # TASK_CENTER, HO_SO, FINANCE deep specs
├── 03_SHARED/                  # Dictionaries, module map
├── 04_APPSHEET/                # AppSheet slices, TASK_MAIN_PRO_SPEC
├── 05_GAS_RUNTIME/             # Main GAS (clasp rootDir) — bootstrap, task/hoso services
├── 06_DATABASE/                # schema_manifest.json, _generated_schema/*.csv
├── 07_TEST/, 09_AUDIT/         # Test fixtures, audits
├── apps/workboard/             # Vite/React operator UI (sole app/)
├── workers/api/                # Cloudflare Worker REST bridge
├── gas-runtime-api/            # Separate clasp: Task DB + Work Inbox POST API
├── docs/, DEPLOYMENT/, scripts/
└── phase_tmp/                  # Phase handoff ZIP archives
```

---

## Runtime entrypoints

| Entry | Path | Role |
|-------|------|------|
| AI context | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` | Tiered load order (authority → registry → ADR → handoff) |
| Operator UI | `apps/workboard` → Vite dev/build → `/inbox`, `/tasks`, modules | Primary operator surface |
| API Worker | `workers/api/src/index.ts` → `router.ts` | REST → GAS adapters |
| Task DB GAS | `gas-runtime-api/90_DoGetDoPost.js` | POST `{ action, payload }` for tasks + work-inbox ops |
| Legacy GAS webapp | `05_GAS_RUNTIME/999Y_RF12_GAS_RUNTIME_API.js`, HTML shells | RF-12 GET bridge, webapp pilots |
| AppSheet | `04_APPSHEET/` | Parallel operator path on same sheets |

**Clasp:** `.clasp.json` → `05_GAS_RUNTIME/`; `gas-runtime-api/.clasp.json` → `gas-runtime-api/`.

---

## Frontend modules (`apps/workboard`)

| Area | Key paths |
|------|-----------|
| Routes | `src/app/routes.tsx`, `src/shared/routes/inboxRoutes.ts` |
| Work Inbox | `TasksPage.tsx`, `WorkInboxShell.tsx`, `WorkInboxGroupsPanel.tsx` |
| Focus Mode | `WorkInboxFocusRuntime.tsx`, `FocusTaskWorkspace.tsx`, `WorkInboxFocusActionHost.tsx` |
| OCMS strip | `src/modules/ocms/*` (derive read model, discovery, strip UI) |
| Task detail (legacy panel) | `TaskDetailContent.tsx`, `DetailPanel.tsx` |
| Checklist / attachments | `inbox/checklist/*`, `inbox/attachments/*` |
| Handoff UX | `HandoffDialog.tsx`, `InlineHandoffStrip.tsx`, `focusLayoutShared.ts` |
| API contracts | `src/api/contracts.ts` (`TaskItem`, operational bundle types) |

**Feature flags:** `VITE_OCMS_CASE_STRIP_ENABLED` (default off), Work Inbox V3 flags in `workInboxGroupsFeature.ts`.

---

## Backend / worker modules

| Area | Key paths |
|------|-----------|
| Router | `workers/api/src/router.ts` |
| Task GS DB | `modules/taskGsDb.ts` |
| Work Inbox ops | `workInboxOperational.ts`, `workInboxChecklist.ts`, `workInboxAttachments.ts` |
| Adapters | `googleSheetTaskDbAdapter.ts`, `googleSheetWorkInboxOperationalAdapter.ts`, `gasAdapter.ts`, `mockData.ts` |
| Auth | `auth/authHandlers.ts`, `googleSheetAuthAdapter.ts` |

**No Case API routes** — case context is FE-derived only.

---

## GAS / Sheets modules

| Project | Responsibility |
|---------|----------------|
| `05_GAS_RUNTIME` | Schema manifest, `20_TASK_SERVICE.js`, `20_TASK_REPOSITORY.js`, `45_SHARED_WITH_SERVICE.js`, HO_SO/FINANCE services, webapp HTML |
| `gas-runtime-api` | `40_TaskDbService.js`, `46_WorkInboxOperationalService.js`, checklist/attachments/combined action |

**Source of truth for tasks:** `TASK_MAIN` sheet per `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` and `90_BOOTSTRAP_SCHEMA.js`.

---

## Data flow overview

```text
Operator Browser (workboard)
    │ GET/POST REST
    ▼
Cloudflare Worker (workers/api)
    │ POST { action, payload, token }  OR  legacy GET ?action=
    ▼
gas-runtime-api (GAS)
    │ read/write rows
    ▼
Google Sheets (TASK_MAIN, TASK_CHECKLIST, TASK_TIMELINE, TASK_ATTACHMENT, …)
```

**OCMS Case Context Strip (flag-gated):** reads `TaskItem` + operational bundle in browser → `deriveCaseReadModel()` → strip UI. **No sheet write for Case.**

---

## Task-centric runtime summary

- **Root entity:** `taskId` / `TASK_MAIN.ID` drives inbox selection, focus workspace, checklist, attachments, timeline append, handoff.
- **Routes:** `/inbox/:taskId` and `/tasks/:taskId` are task-scoped deep links.
- **Worker:** All work-inbox operational paths are `/api/work-inbox/tasks/:taskId/...`.
- **Persistence:** Checklist, timeline, notes, documents keyed by `TASK_ID`.

---

## OCMS additions summary (completed phases)

| Capability | Location | Persistence |
|------------|----------|-------------|
| Case read model contract | `00_SYSTEM_BRAIN/OCMS/OCMS_READ_MODEL_CONTRACT.md` | None |
| Case discovery / key | `apps/workboard/src/modules/ocms/caseDiscovery.ts`, `caseKeyResolver.ts` | None |
| Case Context Strip UI | `WorkInboxCaseContextStrip.tsx` in Focus | None |
| Operator validation / UAT | `ocms*Checks.ts` | None |
| ADRs OCMS_00–02D, 03* | `002_DECISIONS/ADR_OCMS_*.md` | None |

**Strategic position:** OCMS established **read-model-first Case context on top of Task-centric execution**. Case-Centric Refactor branch asks whether to **invert the mental model** (Case as operational root) without breaking production inbox.

---

## Governance chain (audit)

```text
000_RUNTIME_ENTRYPOINT.md
  → 900_AUTHORITY/*
  → PHASE_REGISTRY.md
  → ADR_OCMS_* + ADR_TASK_* + ADR_001 Work Inbox
  → OCMS authority pack (00_SYSTEM_BRAIN/OCMS/)
  → Implementation (workboard + worker + gas-runtime-api)
```

**Runtime state:** `003_RUNTIME_STATE.md` — treat as `NOT_WIRED` unless operator-updated (per entrypoint rule).

---

*Audit artifact — no runtime code. Append-only references.*
