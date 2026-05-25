# CBV Permission Contract v1 (Frozen)

Source: `05_GAS_RUNTIME/46_CBV_PERMISSION_RUNTIME.js`

## Target roles

`ADMIN`, `MANAGER`, `STAFF`, `FINANCE`, `HO_SO`, `VIEW_ONLY`

Legacy map: `OPERATOR→STAFF`, `ACCOUNTANT→FINANCE`, `VIEWER→VIEW_ONLY`. Unknown → **VIEW_ONLY** fallback.

## Core actions (RF_02–RF_06)

| Domain | Actions |
|--------|---------|
| Workboard | `WORKBOARD_ACCESS`, `TASK_*`, `SEARCH_RUN`, `NOTIFICATION_VIEW`, `FILE_*` |
| Coordination | `COORDINATION_VIEW`, `COORDINATION_TEAM_VIEW`, `COORDINATION_ASSIGN` |
| Observation | `OBSERVATION_VIEW`, `OBSERVATION_AUDIT_VIEW`, `OBSERVATION_ALERT_VIEW` |
| Finance plugin | `FINANCE_VIEW`, `FINANCE_SEARCH`, `FINANCE_CONFIRM_PAYMENT`, `FINANCE_FILE_VIEW` |
| HO_SO plugin | `HO_SO_VIEW`, `HO_SO_SEARCH`, `HO_SO_FILE_VIEW`, `HO_SO_APPROVAL` |
| Plugin system | `PLUGIN_VIEW`, `PLUGIN_ADMIN`, `PLUGIN_OBSERVATION_VIEW` |

## Role summary

| Role | Workboard | Coordination team | Finance | HO_SO | Audit |
|------|-----------|-------------------|---------|-------|-------|
| ADMIN | full | full | full | full | yes |
| MANAGER | full | full | view | view | no |
| STAFF | task scope | own queue | no | no | no |
| FINANCE | limited | view | full | no | no |
| HO_SO | task scope | view | no | full | no |
| VIEW_ONLY | read | view | read | read | no |

## Server-side rules

1. `CBV_Permission_assertCan(ctx, action)` before data APIs.
2. `CBV_Permission_filterActions` for quick actions — no permission → hidden.
3. Task visibility: `canUserSeeTask` when row context available.
4. VIEW_ONLY: no write actions in matrix.

## Hidden action rules

- UI must not show actions user cannot perform.
- EXECUTION_LOCKED actions may show with disabled/locked affordance only.
