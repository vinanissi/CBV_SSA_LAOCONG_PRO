# CBV Route Registry v1 (Frozen)

Canonical routes use `/workspace/...` prefix. `/workboard/...` aliases preserved for mobile shortcuts.

## Workboard (RF_02)

| Canonical | Alias | Page |
|-----------|-------|------|
| `/workspace/workboard` | `/workboard` | Shell |
| `/workspace/workboard/tasks` | `/workboard/tasks` | Task list |
| `/workspace/workboard/task-detail` | `/workboard/task-detail` | Task detail |
| `/workspace/workboard/search` | `/workboard/search` | Unified search |
| `/workspace/workboard/notifications` | `/workboard/notifications` | Notifications |
| `/workspace/workboard/files` | `/workboard/files` | Files stub |

## Coordination (RF_03)

| Canonical | Alias |
|-----------|-------|
| `/workspace/coordination` | `/workboard/coordination` |
| `/workspace/coordination/manager` | — |
| `/workspace/coordination/queue` | `/workboard/queue` |
| `/workspace/coordination/overdue` | `/workboard/overdue` |
| `/workspace/coordination/workload` | `/workboard/workload` |
| `/workspace/coordination/assignment` | `/workboard/assignment` |

## Observation (RF_04)

| Canonical | Alias |
|-----------|-------|
| `/workspace/observation` | `/workboard/observation` |
| `/workspace/observation/health` | `/workboard/health` |
| `/workspace/observation/projections` | — |
| `/workspace/observation/queues` | — |
| `/workspace/observation/sync` | — |
| `/workspace/observation/audit` | `/workboard/audit` |
| `/workspace/observation/alerts` | `/workboard/alerts` |

## Plugins (RF_05 / RF_06)

| Canonical | Alias |
|-----------|-------|
| `/workspace/plugins` | `/workboard/plugins` |
| `/workspace/plugins/task` | `/workboard/plugin-task` |
| `/workspace/plugins/finance` | `/workboard/plugin-finance` |
| `/workspace/plugins/finance/items` | — |
| `/workspace/plugins/finance/alerts` | — |
| `/workspace/plugins/finance/search` | — |
| `/workspace/plugins/ho-so` | `/workboard/plugin-ho-so` |
| `/workspace/plugins/ho-so/items` | — |
| `/workspace/plugins/ho-so/alerts` | — |
| `/workspace/plugins/ho-so/search` | — |
| `/workspace/plugins/health` | — |

## Legacy (preserved, not RF core)

| Route | Notes |
|-------|-------|
| `/runtime/health` | Phase 92 placeholder — not replaced by RF_04 |
| `/home-alert/*` | HOME_ALERT pilot routes |
| `/workspace`, `/staff/*`, `/sop` | Pre-RF workspace routes |

## Alias rules

1. Canonical = `/workspace/...` for documentation and new links.
2. Aliases must map to same `pageType` in `92_WEBAPP_WORKSPACE_ROUTES.js`.
3. Do not remove aliases in v1 lock without migration note.

## Source of truth

`05_GAS_RUNTIME/92_WEBAPP_WORKSPACE_ROUTES.js` — `CbvWebAppWorkspace_routeRegistry()`
