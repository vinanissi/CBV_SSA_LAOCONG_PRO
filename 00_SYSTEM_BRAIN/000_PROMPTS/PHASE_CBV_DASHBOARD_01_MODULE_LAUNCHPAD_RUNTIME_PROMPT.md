# PHASE_CBV_DASHBOARD_01 — Module Launchpad Runtime — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

**Phase ID:** `PHASE_CBV_DASHBOARD_01_MODULE_LAUNCHPAD_RUNTIME`  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

## Definition

CBV Dashboard = **Operational Control Console** = **Module Launchpad Runtime**

Not a monolithic ERP. Control layer coordinating React, AppSheet, WebApp, Google Sheet, NocoDB, external tools.

## Goals

1. Config-driven MODULE_REGISTRY
2. Dynamic sidebar / launchpad UI
3. USER_DIRECTORY role-aware navigation
4. Runtime context switching (session/local)
5. Module status telemetry (lightweight)
6. ModuleRuntimeContainer (INTERNAL / IFRAME / NEW_TAB)
7. Operational Home (attention surface)
8. User session bar from real auth
9. Lightweight `/api/modules` API

## Constraints

- No AppSheet rewrite
- No giant analytics dashboard
- No microservice orchestration
- TASK runtime unchanged

## Deliverables

| Item | Path |
|------|------|
| Registry (Worker) | `workers/api/src/modules/moduleRegistryData.ts` |
| API | `GET /api/modules`, `/status`, `/:id`, `POST open-log` |
| FE runtime | `apps/workboard/src/runtime/*` |
| UI | `ModuleLaunchpad`, `ModuleRuntimeContainer`, `OperationalHome` |
| Shell | Dynamic `Sidebar`, `TopBar`, `TopRuntimeStrip` |
| Checks | `dashboard01Checks.ts` |
| Docs | prompt, report, handoff |

## Acceptance

1. Dashboard uses module registry
2. Sidebar dynamic + role-filtered
3. Multi-runtime coexistence (React + iframe + new tab)
4. Runtime telemetry visible
5. User session bar real data
6. FE build PASS
