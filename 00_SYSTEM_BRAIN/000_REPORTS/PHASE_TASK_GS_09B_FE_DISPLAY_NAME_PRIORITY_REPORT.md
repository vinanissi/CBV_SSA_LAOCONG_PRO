# PHASE_TASK_GS_09B — FE Display Name Priority — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Phase GS_09B consolidates **FE display-name priority** into a single runtime helper so operators see human names (DISPLAY_NAME) instead of raw `USR_*` / USER_CODE across task runtime surfaces. Technical ids remain available via hover (`title`) only.

## Display rule

`resolveUserLabel` / `formatUserDisplay` priority:

```
displayName → fullName → name → userName → userCode → id
```

String refs (timeline, waiting owner, queue assignee) resolve through `userDisplayMap` from workspace snapshot (GS_09A). System tokens (`FINANCE`, `CUSTOMER`, `SUPERVISOR`) map to Vietnamese labels.

Fallback when unmapped: USER_CODE → USER_ID → `"Không rõ"` / `"Chưa giao"`.

## Unified helper

`apps/workboard/src/runtime/userDisplay.ts`:

| Function | Use |
|----------|-----|
| `resolveUserLabel` / `formatUserDisplay` | Generic user object or string ref |
| `getTaskOwnerDisplay` | Task owner / assignee on cards & panel |
| `getTaskOwnerTechnicalId` | Hover title for owner row |
| `getTimelineActorDisplay` | Timeline actor column |
| `resolveTimelineText` | Timeline message/action (ASSIGN, handoff arrows, embedded USR_*) |
| `getWaitingOwnerDisplay` | Waiting dependency owner |
| `getAssigneeDisplay` | Coordination queue items |
| `resolveHandoffLabel` | Handoff chain labels |

## FE audit coverage

| Surface | Status |
|---------|--------|
| TaskCard meta | via `signalCollapse` / `taskGrouping` / `taskSignalFiltering` |
| OperationalContextPanel | owner, waiting owner, handoff memory |
| Timeline | actor + message/action text |
| Handoff chain | labels + hover technical id |
| Queue items | CoordinationPage assignee |
| Top session bar | displayName + hover userId |
| Assignment / team pressure | TeamPressureStrip, QuickFocusFilters |
| Escalation / waiting | waiting owner resolved; escalation labels unchanged (no raw ids) |
| Recent context | title-only entries (no user ids) |
| Coordination runtime | handoff + waiting via shared helpers |
| Execution runtime | action labels only (no user id leakage) |
| Search subtitles | mockApi uses `getTaskOwnerDisplay` |

## UI cleanup

- Raw `USR_004` hidden when map or `ownerUser.displayName` exists
- Technical id on **hover** (`title`) for owner, queue assignee, team pressure, handoff steps, top bar user

## Acceptance

| # | Criterion | Result |
|---|-----------|--------|
| 1 | FE prioritizes DISPLAY_NAME runtime-wide | ✅ |
| 2 | USER_CODE not shown when displayName available | ✅ |
| 3 | Timeline/handoff readable | ✅ |
| 4 | Queue scan natural | ✅ |
| 5 | Safe fallback | ✅ |
| 6 | FE build PASS | ✅ |

## Files

| Updated |
|---------|
| `runtime/userDisplay.ts` (unified API) |
| `taskGrouping`, `handoffRuntime`, `signalCollapse`, `taskSignalFiltering`, `teamPressure` |
| `TimelineList`, `HandoffChain`, `OperationalContextPanel`, `TopBar` |
| `CoordinationPage`, `TeamPressureStrip`, `QuickFocusFilters`, `mockApi` |

## Limitations

- Map must be loaded via snapshot (`saveUserDisplayMap`) — detail-only views rely on GAS-enriched `ownerUser` / timeline
- Form assignee field still stores id for API writes (not a display surface)
- Check suites (`taskGs*Checks`) use raw USR_* fixtures intentionally for logic tests

## Depends on

GS_09A GAS enrichment + `userDisplayMap` on workspace snapshot.
