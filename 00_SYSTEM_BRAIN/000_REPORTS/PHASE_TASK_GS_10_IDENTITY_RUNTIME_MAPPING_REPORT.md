# PHASE_TASK_GS_10 — Identity Runtime Mapping Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

---

## USER_DIRECTORY → RuntimeUser

| USER_DIRECTORY column | RuntimeUser field | Notes |
|----------------------|-------------------|-------|
| ID | `id` | Primary key |
| USER_CODE | `userCode` | Lookup alias (OWNER_ID) |
| DISPLAY_NAME | `displayName` | UI label |
| FULL_NAME | `fullName` | Fallback |
| EMAIL | `email` | |
| ROLE | `role` | ADMIN / OPERATOR / … |
| ROLE_CODE | `directoryRole` | |
| STATUS | `status` | ACTIVE filter in GAS |
| IS_OPERATOR | `flags.isOperator` | → mode operator |
| IS_SUPERVISOR | `flags.isSupervisor` | → mode supervisor |
| IS_ADMIN | `flags.isAdmin` | → mode admin |
| CAN_ASSIGN | `capabilities.canAssign` | |
| CAN_APPROVE | `capabilities.canApprove` | |
| CAN_ESCALATE | `capabilities.canEscalate` | |
| CAN_RESOLVE | `capabilities.canResolve` | |
| DEFAULT_QUEUE | `queueDefaults.defaultQueue` | Landing quickFocus |
| DEFAULT_DASHBOARD | `queueDefaults.defaultDashboard` | Landing filter |
| ACTIVE_QUEUE_COUNT | `workload.activeQueueCount` | |
| WORKLOAD_LIMIT | `workload.workloadLimit` | Overload threshold |
| SUPERVISOR_ID | `relationships.supervisorId` | |
| TEAM_ID | `relationships.teamId` | |
| DON_VI_ID | `relationships.donViId` | |

## Pipeline

```
USER_DIRECTORY (sheet)
  → GAS taskDbLoadUserDirectory_() [1 read / snapshot]
  → snapshot.runtimeUsersById + usersById + userDisplayMap
  → Worker pass-through
  → FE hydrateRuntimeIdentityFromSnapshot() [memory cache]
  → resolveRuntimeUser(id) / getCurrentRuntimeUser()
```

## Task enrichment

`OWNER_ID` → `ownerUser: { id, displayName }` + `owner` string (GAS, unchanged GS_09D).

FE does **not** re-query sheet per card.

## Session binding

`bindSessionIdentity(UserContext)` on login → `getCurrentRuntimeUser()` for inline actions and landing defaults.

## Landing state mapping

| DEFAULT_QUEUE | FE quickFocus |
|---------------|---------------|
| escalation | escalation |
| wait_response | wait_response |
| overload | overload |

| DEFAULT_DASHBOARD | FE filter |
|-------------------|-----------|
| tasks / my_tasks | mine |
| overdue | overdue |

Supervisor default (no DEFAULT_QUEUE): `escalation`  
Operator default: `all`
