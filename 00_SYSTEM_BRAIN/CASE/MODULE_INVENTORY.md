# Module Inventory — Case-Centric Refactor Audit

**Phase:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Date:** 2026-06-01

Runtime Criticality: `CRITICAL` | `IMPORTANT` | `OPTIONAL` | `DEPRECATED` | `UNKNOWN`

---

## Frontend — Work Inbox / Focus

| Module/File | Layer | Purpose | Current Usage | Dependencies | Criticality | Notes |
|-------------|-------|---------|---------------|--------------|-------------|-------|
| `apps/workboard/src/modules/task/TasksPage.tsx` | FE | Inbox orchestration, snapshot, detail | Active `/inbox` | API client, loaders | CRITICAL | Task-root selection |
| `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` | FE | Group list, focus entry | Active | V3 feature flags | CRITICAL | |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusTaskWorkspace.tsx` | FE | Single-task focus shell | Active when focus runtime on | OCMS strip, checklist, attachments | CRITICAL | Mount point for Case strip |
| `apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` | FE | Focus container | Active | Action host | CRITICAL | |
| `apps/workboard/src/modules/task/inbox/actionRuntime/WorkInboxFocusActionHost.tsx` | FE | Actions + operational bundle | Active | GAS via worker | CRITICAL | |
| `apps/workboard/src/modules/task/inbox/workInboxGroupsFeature.ts` | FE | V3/focus feature flags | Active | env | IMPORTANT | |
| `apps/workboard/src/modules/task/inbox/checklist/*` | FE | Checklist CRUD UI | Active in focus | `wiOp*` GAS actions | CRITICAL | Task-scoped |
| `apps/workboard/src/modules/task/inbox/attachments/*` | FE | Attachment UI | Active in focus | GAS | CRITICAL | Task-scoped |
| `apps/workboard/src/components/ui/TaskDetailContent.tsx` | FE | Legacy detail panel | Partial (non-focus routes) | Task detail API | IMPORTANT | May overlap focus tabs |
| `apps/workboard/src/components/layout/DetailPanel.tsx` | FE | Right panel shell | Active | Routes | IMPORTANT | Suppressed when focus runtime |

---

## Frontend — OCMS

| Module/File | Layer | Purpose | Current Usage | Dependencies | Criticality | Notes |
|-------------|-------|---------|---------------|--------------|-------------|-------|
| `apps/workboard/src/modules/ocms/deriveCaseReadModel.ts` | FE | Task+bundle → CaseReadModel | When strip enabled | contracts, discovery | IMPORTANT | Core case derivation |
| `apps/workboard/src/modules/ocms/caseDiscovery.ts` | FE | Anchor scan HO_SO/FINANCE/ALERT/TASK | When strip enabled | TaskItem fields | IMPORTANT | |
| `apps/workboard/src/modules/ocms/caseKeyResolver.ts` | FE | Logical caseKey | When strip enabled | ADR OCMS_02D | IMPORTANT | No DB |
| `apps/workboard/src/modules/ocms/WorkInboxCaseContextStrip.tsx` | FE | Strip UI | Flag-gated | buildCaseContextStripView | IMPORTANT | Default OFF |
| `apps/workboard/src/modules/ocms/ocmsFeature.ts` | FE | `VITE_OCMS_CASE_STRIP_ENABLED` | Active | env | IMPORTANT | Name differs from doc `OCMS_CASE_STRIP_ENABLED` |
| `apps/workboard/src/modules/ocms/ocmsCaseContextStripChecks.ts` | FE | Static contract tests | CI/dev | — | OPTIONAL | Asserts no CASE_MAIN |

---

## Worker API

| Module/File | Layer | Purpose | Current Usage | Dependencies | Criticality | Notes |
|-------------|-------|---------|---------------|--------------|-------------|-------|
| `workers/api/src/router.ts` | API | HTTP routing | Production path | env, adapters | CRITICAL | |
| `workers/api/src/modules/taskGsDb.ts` | API | TASK_MAIN snapshot/detail/mutations | Sheet mode | googleSheetTaskDbAdapter | CRITICAL | |
| `workers/api/src/modules/workInboxOperational.ts` | API | Bundle, notes, timeline, docs | Active | wiOp GAS | CRITICAL | Task-scoped URLs |
| `workers/api/src/modules/workInboxChecklist.ts` | API | Checklist REST | Active | GAS | CRITICAL | |
| `workers/api/src/modules/workInboxAttachments.ts` | API | Attachments REST | Active | GAS | CRITICAL | |
| `workers/api/src/modules/tasks.ts` | API | Legacy/mock task list | Mode-dependent | mockData | OPTIONAL | Fallback |
| `workers/api/src/modules/taskWrite.ts` | API | PATCH task (legacy) | Blocked in sheet mode | — | DEPRECATED | |
| `workers/api/src/adapters/googleSheetTaskDbAdapter.ts` | Adapter | GAS POST bridge | Sheet mode | GAS_TASK_API_URL | CRITICAL | |
| `workers/api/src/adapters/mockData.ts` | Adapter | Offline dev | Dev only | — | OPTIONAL | |

---

## GAS — gas-runtime-api

| Module/File | Layer | Purpose | Current Usage | Dependencies | Criticality | Notes |
|-------------|-------|---------|---------------|--------------|-------------|-------|
| `gas-runtime-api/60_TaskDbApi.js` | GAS | Action router | Production | Config | CRITICAL | |
| `gas-runtime-api/40_TaskDbService.js` | GAS | Task CRUD, snapshot | Active | TASK_MAIN | CRITICAL | Maps RELATED_ENTITY_* |
| `gas-runtime-api/46_WorkInboxOperationalService.js` | GAS | Timeline, notes, bundle | Active | TASK_TIMELINE, etc. | CRITICAL | |
| `gas-runtime-api/49_WorkInboxChecklist.js` | GAS | Checklist persistence | Active | TASK_CHECKLIST | CRITICAL | |
| `gas-runtime-api/50_WorkInboxAttachments.js` | GAS | Attachments | Active | TASK_ATTACHMENT | CRITICAL | |
| `gas-runtime-api/47_WorkInboxCombinedAction.js` | GAS | record-action | Active | audit log | IMPORTANT | |

---

## GAS — 05_GAS_RUNTIME

| Module/File | Layer | Purpose | Current Usage | Dependencies | Criticality | Notes |
|-------------|-------|---------|---------------|--------------|-------------|-------|
| `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` | GAS | Schema manifest | Bootstrap | Sheets | CRITICAL | TASK_MAIN columns |
| `05_GAS_RUNTIME/20_TASK_SERVICE.js` | GAS | Task domain service | AppSheet/webapp | Repository | CRITICAL | |
| `05_GAS_RUNTIME/45_SHARED_WITH_SERVICE.js` | GAS | Privacy/sharing | PRO baseline | TASK_MAIN | CRITICAL | v2.2.4+ |
| `05_GAS_RUNTIME/999Y_RF12_GAS_RUNTIME_API.js` | GAS | Legacy GET API | Partial | — | DEPRECATED | Stubs remain |

---

## Governance / specs (no runtime)

| Module/File | Layer | Purpose | Current Usage | Criticality |
|-------------|-------|---------|---------------|-------------|
| `00_SYSTEM_BRAIN/OCMS/*.md` | Gov | Case models, strip authority | Phase reference | IMPORTANT |
| `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_*.md` | Gov | Accepted decisions | Binding | CRITICAL |
| `04_APPSHEET/TASK_MAIN_PRO_SPEC.md` | Gov | AppSheet task spec | Parallel UX | IMPORTANT |
| `02_MODULES/TASK_CENTER/*` | Spec | Task system reference | Design | OPTIONAL |

---

## Modules with no Case persistence (verified)

No `CASE_MAIN`, `CaseService`, `CaseRepository`, or Case worker routes in production runtime paths. OCMS checks explicitly guard against `CASE_MAIN` in workspace source.

---

*Major runtime modules reviewed. Satellite pages (finance, hoso, home) remain module projections — see TASK_DEPENDENCY_MAP.md.*
