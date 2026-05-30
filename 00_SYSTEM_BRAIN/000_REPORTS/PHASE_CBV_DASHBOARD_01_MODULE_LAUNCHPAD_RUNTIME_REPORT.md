# PHASE_CBV_DASHBOARD_01 — Module Launchpad Runtime — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

---

## Summary

CBV Dashboard chuyển từ hardcoded nav sang **Module Launchpad Runtime** — control console điều phối đa runtime (React, AppSheet iframe, external new tab) với registry config-driven và role-aware filtering từ USER_DIRECTORY.

## Module registry architecture

Single registry (`MODULE_REGISTRY`) với fields:
- `moduleId`, `moduleName`, `moduleGroup`, `runtimeType`, `openMode`
- `primaryUrl`, `mobileUrl`, `adminUrl`
- `roleRequired`, `permissionRequired`, `showInNav`

**Sources:**
- Worker: `workers/api/src/modules/moduleRegistryData.ts` → `/api/modules`
- FE fallback: `apps/workboard/src/runtime/moduleRegistry.ts`

Env-resolved URLs (Worker):
- `CBV_APPSHEET_HOSO_URL`, `CBV_APPSHEET_FINANCE_URL`, `CBV_NOCODB_URL`, `CBV_TASK_SHEET_ID`

## Runtime types

| Type | Example | Open mode |
|------|---------|-----------|
| REACT | TASK, HO_SO, FINANCE | INTERNAL_ROUTE |
| APPSHEET | HO_SO_APPSHEET | IFRAME |
| NOCODB | OBSERVATION alt | mobileUrl |
| EXTERNAL | DOCUMENT (Drive) | NEW_TAB |

## Launchpad behavior

- **Sidebar:** dynamic from registry, grouped OPERATIONS / REFERENCE / SETTINGS
- **OperationalHome (`/`):** attention surface + compact module chips + today queues
- **ModuleLaunchpad:** full cards or compact chips with runtime status dots
- **Click:** `planModuleLaunch()` → navigate | iframe route `/m/:slug` | window.open

## Role-aware navigation

`filterModulesForUser()` checks:
1. `permissionRequired` (TASK_VIEW, HO_SO_VIEW, …)
2. `roleRequired` array
3. `ADMIN_ALL` bypass

Worker API filters before response; FE re-filters local fallback.

## Runtime telemetry

- `GET /api/modules/status` — per-module connected/degraded label
- `TopRuntimeStrip` — shows TASK, HO_SO, FINANCE, OBSERVATION, DOCUMENT status
- `TopBar` — current module name + degraded indicator
- Degraded warning on OperationalHome when any module degraded

## Context switching

`operationalLinkMemory.ts` (session/local):
- `saveOperationalContext()` — moduleId, taskId, hoSoId, returnPath
- `pushRecentModule()` — last 5 modules opened
- `ModuleRuntimeContainer` — breadcrumbs + return link + context display

## Embedded strategy

`ModuleRuntimeContainer`:
- Loading / permission fallback
- iframe sandbox for AppSheet/WebApp
- "Mở tab mới" escape hatch
- Return to `returnPath` from context

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/modules` | Registry list (role-filtered) |
| GET | `/api/modules/status` | Runtime status strip |
| GET | `/api/modules/:id` | Single module detail |
| POST | `/api/modules/open-log` | Append open event (lightweight) |

## Files changed

| Area | Files |
|------|-------|
| Worker | `moduleRegistryData.ts`, `modules.ts`, `router.ts`, `contracts.ts` |
| FE runtime | `moduleRegistry.ts`, `modulePermissions.ts`, `moduleRuntime.ts`, `moduleLauncher.ts`, `operationalLinkMemory.ts`, `useModuleRegistry.ts` |
| Components | `ModuleLaunchpad.tsx`, `ModuleRuntimeContainer.tsx`, `OperationalHome.tsx` |
| Shell | `Sidebar.tsx`, `TopBar.tsx`, `TopRuntimeStrip.tsx`, `AppShell.tsx` |
| Routes | `routes.tsx`, `App.tsx` |
| API | `client.ts`, `mockApi.ts`, `contracts.ts` |
| Checks | `dashboard01Checks.ts` |

## Limitations

- Registry still JSON/TS static — Google Sheet config tab deferred
- AppSheet URLs require env vars; without them HO_SO_APPSHEET disabled
- Open-log not persisted to GAS sheet yet
- `/plugins` legacy page kept; SETTINGS module points there

## Next recommendations

1. MODULE_REGISTRY sheet tab in operational DB
2. Admin UI to edit registry without deploy
3. Deep-link context pass-through to AppSheet (taskId/hoSoId query params)
4. Module attention badges from runtime counts API
5. Keyboard module switcher (1-9)
