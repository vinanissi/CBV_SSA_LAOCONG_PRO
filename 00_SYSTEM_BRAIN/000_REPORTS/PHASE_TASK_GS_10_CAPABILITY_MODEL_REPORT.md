# PHASE_TASK_GS_10 — Capability Model Report

**Date:** 2026-05-25

---

## Design principles

- **No enterprise IAM** — capabilities come from USER_DIRECTORY boolean columns + mode flags
- **No auth redesign** — session `UserContext.permissions` unchanged; runtime identity is additive
- **Fail-open for viewers** — unmapped users get `canResolve: true` fallback in `getUserCapabilities` only when no identity record

## Capability derivation (GAS + FE normalize)

```
IF IS_ADMIN OR mode=admin:
  canAssign, canApprove, canEscalate, canResolve = true

IF IS_SUPERVISOR OR mode=supervisor:
  canAssign, canApprove, canEscalate, canResolve = true

IF IS_OPERATOR OR mode=operator:
  canAssign, canResolve = true (unless sheet overrides)

Sheet columns CAN_* override when explicitly TRUE
```

## Inline execution gate

| QuickActionId | Capability | Behavior when denied |
|---------------|------------|----------------------|
| HANDOFF | canAssign | Hidden from InlineQuickActions |
| ACCEPT | canAssign | Hidden |
| WAIT_APPROVAL | canApprove | Hidden |
| COMPLETE | canResolve | Hidden |
| CONFIRM | canResolve | Hidden |
| CALL, FOLLOW, WAIT_CUSTOMER | — | Always shown (execution, not assignment) |

Implementation: `filterQuickActionsByIdentity()` in `runtimeIdentity.ts`

## Runtime mode effects

| Mode | Queue bias (landing) | Overload |
|------|---------------------|----------|
| admin | sheet DEFAULT_QUEUE | WORKLOAD_LIMIT |
| supervisor | escalation if no default | WORKLOAD_LIMIT |
| operator | sheet / all | WORKLOAD_LIMIT |
| viewer | all | N/A |

Team pressure uses `isOwnerOverloadedByIdentity()` combining:
- Sheet `ACTIVE_QUEUE_COUNT >= WORKLOAD_LIMIT`
- Runtime pending count >= per-user WORKLOAD_LIMIT
- Overdue >= 4 (unchanged baseline)

## API surface

```typescript
resolveRuntimeUser(ref) → RuntimeUser | null
getUserCapabilities(user) → RuntimeUserCapabilities
getUserRuntimeMode(user) → RuntimeUserMode
canPerformInlineAction(actionId, user) → boolean
filterQuickActionsByIdentity(actions, user) → QuickAction[]
getIdentityLandingDefaults(user) → { quickFocus?, filter? }
```

## Out of scope (GS_10)

- Role-permission matrix sheet integration
- Dynamic capability grants at runtime
- Cross-tenant identity federation
