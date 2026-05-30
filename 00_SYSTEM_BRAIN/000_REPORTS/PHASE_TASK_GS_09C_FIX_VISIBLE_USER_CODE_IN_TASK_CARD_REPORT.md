# PHASE_TASK_GS_09C — Fix Visible USER_CODE in Task Card — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Problem

Task card scan line showed raw user code on escalation rows:

```
Escalation  USR_005
```

Root cause: `metaShort` (from `getCollapsedMetaShort`) called `getTaskOwnerDisplay`, which returned raw `USR_*` when `userDisplayMap` was empty or `task.owner` still held the id string.

## Fix

### 1. Surface-safe resolution (`runtime/userDisplay.ts`)

- Added `UserDirectoryEntry`, `usersById`, `saveUsersDirectory()` for GET `/api/users`
- `resolveUserLabel(value, { surface: true })` — **never** exposes raw `USR_*` on primary UI
- Unmapped user ref on surface → `"Chưa rõ người xử lý"`
- Raw id reserved for `title` / tooltip via `getTaskOwnerTechnicalId()`
- `getCardOwnerMetaShort()` — card-specific owner meta (max 14 chars)
- Priority unchanged: `displayName → fullName → name → userName → userCode → id`

### 2. TaskCard

- `metaShort` span gets `title={getTaskOwnerTechnicalId(task)}` for hover technical id
- Display text comes from surface-safe `collapseTaskSignals` → `getCardOwnerMetaShort`

### 3. Directory loading (`TasksPage`)

- Snapshot `userDisplayMap` applied first (GS_09A)
- If map empty → lightweight `GET /api/users` → `saveUsersDirectory()`

### 4. Downstream (via shared helper)

Timeline, handoff, panel owner, waiting owner, queue assignee already route through `resolveUserLabelForSurface` — no raw `USR_*` on primary text.

## Test

`taskGs09cChecks.ts`:

| Input | Expected |
|-------|----------|
| `ownerId=USR_005`, map `{ USR_005: "Nguyễn Văn B" }` | Card line contains **Nguyễn Văn B**, NOT `USR_005` |
| `ownerId=USR_005`, no map | meta shows **Chưa rõ người xử lý**, NOT `USR_005` |

Run: `runTaskGs09cChecks()` in browser console or import in dev.

## Acceptance

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Escalation card shows DISPLAY_NAME | ✅ |
| 2 | No raw USR_* on card when mapped | ✅ |
| 3 | Unmapped → safe label, id in tooltip | ✅ |
| 4 | Shared helper (no string replace hacks) | ✅ |
| 5 | `/api/users` fallback when map empty | ✅ |
| 6 | FE build PASS | ✅ |

## Files

| Updated | New |
|---------|-----|
| `runtime/userDisplay.ts` | `taskGs09cChecks.ts` |
| `signalCollapse.ts`, `TaskCard.tsx`, `TasksPage.tsx` | |
| `taskGs05Checks.ts` (meta line expectation) | |

## Limitations

- Card re-render after async `/api/users` requires snapshot refresh or navigation (map applied before first paint when snapshot includes map)
- Form assignee field still stores id for API (not a display surface)
