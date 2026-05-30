# PHASE_TASK_GS_09A — Display Name & Theme Mode — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Phase GS_09A resolves raw `USER_ID` (e.g. `USR_004`) to **DISPLAY_NAME** from `USER_DIRECTORY` across task snapshot, detail, timeline, handoff chain, and card meta — with safe fallback to ID when unmapped. Adds **light/dark theme toggle** persisted in `localStorage` (`cbv_theme_mode`), default dark.

## A. User display name mapping

### Data source

- Sheet: `USER_DIRECTORY`
- Keys: `ID`, `USER_CODE` → value: `DISPLAY_NAME` (fallback `FULL_NAME`, then code/id)

### GAS enrichment

New `gas-runtime-api/taskDbUserDisplay.js`:

- `taskDbLoadUserDisplayMap_()` — cached map from USER_DIRECTORY
- `taskDbResolveUserDisplay_(ref, map)` — fallback to raw id
- `taskDbResolveUserRef_(ref, map)` → `{ id, displayName }`
- `taskDbEnrichTaskUserFields_(task, map)` — sets `owner`, `displayOwner`, `ownerUser`
- `taskDbEnrichTimelineActor_(event, map)` — sets `actorId` + resolved `actor`

Wired in `taskDbService.js`:

- Summary/detail mapping (`taskDbMapTaskSummaryRow_`, `taskDbMapTaskRow_`)
- Workspace snapshot includes `userDisplayMap`
- Timeline events enriched on read
- Write paths (create/update/assign) re-map with user map

### Contracts

```typescript
interface UserRef { id: string; displayName: string; }
// TaskItem: ownerUser?, reporterUser?
// TaskWorkspaceSnapshot: userDisplayMap?
// TimelineItem: actorId?
```

### FE runtime

`apps/workboard/src/runtime/userDisplay.ts`:

- `saveUserDisplayMap()` on snapshot load (TasksPage)
- `getTaskOwnerDisplay()`, `getTimelineActorDisplay()`, `resolveUserDisplay()`

Applied in:

| Surface | Change |
|---------|--------|
| OperationalContextPanel | "3 · Người xử lý" uses display name |
| TaskCard meta | signalCollapse / taskSignalFiltering |
| TimelineList | actor display |
| HandoffChain | owner + ASSIGN arrows resolved |
| TeamPressureStrip | owner labels |

## B. Theme mode

- `themeRuntime.ts` — load/apply/toggle, key `cbv_theme_mode`
- `ThemeToggle.tsx` — top bar **☀ Sáng / ☾ Tối**
- `initThemeRuntime()` in `main.tsx` before render
- Root classes: `theme-dark` (default) | `theme-light`
- Light overrides in `styles/index.css` — shell surfaces only, no layout redesign

## Acceptance

| # | Criterion | Result |
|---|-----------|--------|
| 1 | No raw USER_ID at "Người xử lý" when mapped | ✅ |
| 2 | Timeline/handoff show DISPLAY_NAME | ✅ |
| 3 | Fallback USER_ID when unmapped | ✅ |
| 4 | Light/dark toggle in top bar | ✅ |
| 5 | Theme persists after reload | ✅ |
| 6 | FE build PASS | ✅ |
| 7 | Report + handoff docs | ✅ |

## Files

| New | Updated |
|-----|---------|
| `gas-runtime-api/taskDbUserDisplay.js` | `taskDbService.js`, `taskDbConfig.js` |
| `runtime/userDisplay.ts`, `runtime/themeRuntime.ts` | `contracts.ts` (FE) |
| `components/ThemeToggle.tsx` | `TopBar.tsx`, `main.tsx`, `styles/index.css` |
| | `OperationalContextPanel`, `TimelineList`, `handoffRuntime`, `signalCollapse`, `taskSignalFiltering`, `teamPressure`, `TasksPage` |
| | `workers/api/.../googleSheetTaskDbAdapter.ts` |

## Limitations

- USER_DIRECTORY must exist in same spreadsheet as TASK_MAIN (task DB binding)
- User map cached per GAS request; invalidate on directory change requires cache TTL or redeploy
- Light theme covers primary shell classes — not every tertiary chip color
- `clasp deploy` may still require manual Web App deploy (domain restriction)

## Deploy note

After merge: `clasp push` GAS runtime, manual Web App deploy if needed.
