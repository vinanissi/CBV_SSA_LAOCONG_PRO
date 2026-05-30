# RuntimeUser Schema — GS_10

**Phase:** PHASE_TASK_GS_10_RUNTIME_IDENTITY_LAYER  
**Source:** USER_DIRECTORY sheet (Google Sheets)

---

## RuntimeUser

Operational identity normalized from USER_DIRECTORY for task runtime.

```typescript
interface RuntimeUser {
  id: string;              // USER_DIRECTORY.ID
  userCode: string;        // USER_CODE (e.g. USR_005)
  displayName: string;     // DISPLAY_NAME — primary UI label
  fullName?: string;
  email?: string;
  role?: string;           // ROLE column
  directoryRole?: string;  // ROLE_CODE
  status?: string;         // ACTIVE | INACTIVE | ...
  mode: RuntimeUserMode;   // operator | supervisor | admin | viewer
  capabilities: RuntimeUserCapabilities;
  workload: RuntimeUserWorkload;
  queueDefaults: RuntimeUserQueueDefaults;
  relationships: RuntimeUserRelationships;
  flags: RuntimeUserFlags;
}
```

## RuntimeUserMode

Derived from `IS_ADMIN`, `IS_SUPERVISOR`, `IS_OPERATOR`, `ROLE`:

| Mode | Typical use |
|------|-------------|
| `admin` | Full runtime control |
| `supervisor` | Escalation / approval queues |
| `operator` | Day-to-day task execution |
| `viewer` | Read-only |

## RuntimeUserCapabilities

| Field | Sheet column | Inline actions gated |
|-------|--------------|----------------------|
| `canAssign` | CAN_ASSIGN | HANDOFF, ACCEPT |
| `canApprove` | CAN_APPROVE | WAIT_APPROVAL |
| `canEscalate` | CAN_ESCALATE | escalation queues |
| `canResolve` | CAN_RESOLVE | COMPLETE, CONFIRM, micro-update |

## RuntimeUserWorkload

| Field | Sheet column |
|-------|--------------|
| `activeQueueCount` | ACTIVE_QUEUE_COUNT |
| `workloadLimit` | WORKLOAD_LIMIT |
| `isOverloaded` | computed: activeQueueCount >= workloadLimit |

## RuntimeUserQueueDefaults

| Field | Sheet column |
|-------|--------------|
| `defaultQueue` | DEFAULT_QUEUE |
| `defaultDashboard` | DEFAULT_DASHBOARD |

## RuntimeUserRelationships

| Field | Sheet column |
|-------|--------------|
| `supervisorId` | SUPERVISOR_ID |
| `teamId` | TEAM_ID |
| `donViId` | DON_VI_ID |

## Snapshot contract

Workspace snapshot exposes:

- `runtimeUsersById: Record<string, RuntimeUser>`
- `usersById` (backward compat, same shape when enriched)
- `userDisplayMap` (flat id → displayName)

FE hydrates once via `hydrateRuntimeIdentityFromSnapshot()`.
