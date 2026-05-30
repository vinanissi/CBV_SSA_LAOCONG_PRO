# PHASE_TASK_GS_10B — Fix USER_DIRECTORY Lookup Miss — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Problem

FE showed **"Chưa rõ người xử lý"** instead of `USER_DIRECTORY.DISPLAY_NAME` even when `TASK_MAIN.OWNER_ID` matched `USER_CODE`.

## Root causes addressed

| # | Cause | Fix |
|---|--------|-----|
| 1 | Directory not applied to tasks after snapshot | `enrichTasksUserFieldsFromDirectory()` in `TasksPage` |
| 2 | Map keys not normalized (case/whitespace) | `normalizeUserLookupKey()` — trim + uppercase `USR_*` |
| 3 | `usersById` indexed by internal ID | Index by `USER_CODE` first; FE uses `record.userCode` not object key |
| 4 | Field alias mismatch | `OWNER_ID` / `ownerId` / `owner_id` resolved in GAS + FE |
| 5 | `displayOwner` seeded with raw code | GAS enrichment sets display fields from map |
| 6 | FE skipped `userDisplayMap` in owner chain | Priority: `ownerUser.displayName` → `displayOwner` → map → `ownerId` |
| 7 | Premature "Chưa rõ" fallback | When `ownerId` exists, never return unknown label; use map or code |

## GAS changes (`taskDbUserDisplay.js`)

- `taskDbNormalizeUserCode_()` — trim + uppercase `USR_*`
- `taskDbIndexUserCache_()` — primary index by normalized `USER_CODE`
- `taskDbLookupUserMap_()` / `taskDbLookupUserEntry_()` — multi-key lookup
- `taskDbResolveOwnerIdFromTask_()` / `taskDbResolveReporterIdFromTask_()` — field aliases
- Enrichment writes `ownerUser`, `displayOwner`, `reporterUser`, `displayReporter`

## FE changes (`runtime/userDisplay.ts`)

- `normalizeUserLookupKey`, `resolveTaskOwnerId`, `resolveTaskReporterId`
- Normalized keys in `saveUserDisplayMap` / `saveUsersById`
- `getTaskOwnerDisplay` / `getTaskReporterDisplay` — spec priority chain
- `enrichTaskUserFieldsFromDirectory` — local enrichment safety net
- DEV-only `console.warn('[USER_LOOKUP_MISS]', …)` when lookup fails

## TasksPage

After `hydrateUserDirectoryFromSnapshot`, all task arrays pass through `enrichTasksUserFieldsFromDirectory`.

## Test case (`runTaskGs10bChecks`)

| Input | Expected |
|-------|----------|
| `USER_CODE = USR_005`, `DISPLAY_NAME = Nguyễn Văn A` | Render **Nguyễn Văn A** |
| `OWNER_ID = USR_005` | NOT "Chưa rõ người", NOT raw code when map loaded |

## Acceptance

| Criterion | Status |
|-----------|--------|
| USER_CODE primary lookup | PASS |
| Trim / uppercase keys | PASS |
| Field aliases | PASS |
| Snapshot enrichment | PASS |
| FE display priority | PASS |
| DEV lookup miss warn | PASS |
| FE build | PASS |

## Out of scope

- No DB / column changes
- No hardcoded names
- No `OWNER_ID` → `USER_DIRECTORY.ID` first mapping
