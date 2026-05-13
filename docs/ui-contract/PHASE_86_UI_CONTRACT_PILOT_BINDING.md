# Phase 86 — UI Contract pilot binding

**Reference:** CBV Operational Ecosystem Standard V1  
**Depends on:** Phase 85 `CBV_UI_CONTRACT` sheet + `84_UNIFIED_UI_CONTRACT_RUNTIME.js`  
**Runtime:** `05_GAS_RUNTIME/86_UI_CONTRACT_PILOT_BINDING_RUNTIME.js`, `87_UI_CONTRACT_PILOT_BINDING_TEST_CONSOLE.js`

## Why Phase 86 exists

Phase 85 delivered the **metadata contract** and GAS validation. Phase 86 **binds** that contract to a **real pilot**: structured AppSheet binding plans, WebApp route skeletons, and human-run checklists—without new HOME_ALERT business logic or large new runtimes.

## Roles in the pilot

| Surface | Role in pilot |
|---------|----------------|
| **AppSheet** | Daily operator shell: queues, dashboards, CRUD aligned to `APPSHEET_VIEW`, `SECURITY_FILTER_HINT`, and `ALLOWED_ACTIONS_JSON`. |
| **WebApp** | Advanced / read-first experiences aligned to `WEBAPP_ROUTE` and `SCREEN_TYPE` (timeline, Kanban, health, test console, reports). |

## How `CBV_UI_CONTRACT` drives both

- **AppSheet:** `CbvUiPilotBinding_buildAppSheetBindingPlan()` groups contracts into operator vs supervisor buckets and lists **missing** `APPSHEET_VIEW` names and suggested actions.
- **WebApp:** `CbvUiPilotBinding_buildWebAppRoutePlan()` lists routes, screen codes, data sources, and **missing** `WEBAPP_ROUTE` metadata.
- **People:** `CbvUiPilotBinding_buildPilotChecklist()` returns admin / supervisor / operator / security / SLA / route / deeplink sections.

## In scope

- Read-only plans from the contract sheet; Test Console under **🧪 CBV Test Console → Phase 86 — Pilot Binding**.
- Validation extensions: `APPSHEET_VIEW` required when `CHANNEL` is `APPSHEET` or `BOTH`; `WEBAPP_ROUTE` required when `CHANNEL` is `WEBAPP` or `BOTH` (in addition to Phase 85 rules).

## Out of scope

- ENV-A, AI runtime, queue intelligence, AppSheet Bot.
- Auto assign / resolve / escalate; destructive migration.
- Rewriting HOME_ALERT transition rules or TASK_MAIN policies.

## Pilot vs production readiness

| Gate | Meaning |
|------|---------|
| **Pilot binding readiness** | `CbvUiPilotBinding_validate` + health can **GO** or **GO_WITH_WARNINGS** once sheet rows and views/routes are aligned. |
| **Production readiness** | **NOT** claimed here—requires org sign-off, security review, and stable AppSheet/WebApp binding in production tenants. |

## QA

After `clasp push`, use Phase 86 Test Console items; optional full suite: `CbvUiPilotBinding_TestConsole_run()` in the script editor.
