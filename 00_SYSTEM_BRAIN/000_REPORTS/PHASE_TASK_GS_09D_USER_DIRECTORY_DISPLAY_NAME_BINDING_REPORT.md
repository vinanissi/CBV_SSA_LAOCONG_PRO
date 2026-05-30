# PHASE_TASK_GS_09D — USER_DIRECTORY Display Name Binding — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Phase GS_09D binds **USER_DIRECTORY** sheet (`USER_CODE` → `DISPLAY_NAME`) as the single source-of-truth for user labels across the task runtime. GAS loads the directory once per snapshot build; Worker passes through; FE hydrates memory once — no per-card sheet queries.

## A. USER_DIRECTORY contract

Sheet columns used:

| Column | Usage |
|--------|--------|
| `ID` | Primary key (optional if `USER_CODE` present) |
| `USER_CODE` | Lookup key (matches `OWNER_ID` on tasks) |
| `DISPLAY_NAME` | Primary display label |
| `FULL_NAME` | Fallback if `DISPLAY_NAME` empty |
| `ROLE`, `EMAIL` | Optional metadata in `usersById` |
| `IS_DELETED` | Skipped when true |

## B. GAS / Worker snapshot contract

`gas-runtime-api/taskDbUserDisplay.js`:

- `taskDbLoadUserDirectory_()` — single read, builds both:
  - `userDisplayMap`: `{ "USR_005": "Trần Thị B" }`
  - `usersById`: `{ "USR_005": { id, userCode, displayName, role?, email? } }`

Workspace snapshot includes:

```json
{
  "usersById": { "USR_005": { "userCode": "USR_005", "displayName": "Trần Thị B" } },
  "userDisplayMap": { "USR_005": "Trần Thị B" },
  "tasks": [{ "ownerUser": { "id": "USR_005", "displayName": "Trần Thị B" }, "owner": "Trần Thị B" }]
}
```

Worker adapter passes `usersById` through unchanged.

## C. Snapshot enrichment

Each task row enriched server-side:

- `ownerUser: { id, displayName }`
- `owner` / `displayOwner` = `DISPLAY_NAME` (not raw `USR_*`)
- Timeline `actor` resolved from directory
- No FE-side raw string lookup required when enrichment present

## D. FE runtime (load once)

`runtime/userDisplay.ts`:

- `hydrateUserDirectoryFromSnapshot(snapshot)` — called once in `TasksPage` on snapshot load
- `saveUsersById()` / `saveUserDisplayMap()` — in-memory cache
- `resolveUserDisplay(user)` — unified helper (displayName → … → id)
- `hasUserDirectoryLoaded()` — gates lightweight `GET /api/users` fallback only when snapshot empty

Performance: **1 directory load per snapshot**, cached in GAS + Worker + FE memory.

## E. Display surfaces

All surfaces use shared helpers (GS_09B/C foundation + GS_09D binding):

TaskCard · OperationalContextPanel · Timeline · Handoff · Escalation meta · Waiting owner · Queue · Top bar

## Tests

`runTaskGs09dChecks()`:

| Input | Expected |
|-------|----------|
| `USR_005` + directory `Trần Thị B` | Render **Trần Thị B**, NOT `USR_005` |
| `ownerUser.displayName` on task | Card escalation line uses display name |

## Acceptance

| # | Criterion | Result |
|---|-----------|--------|
| 1 | USER_DIRECTORY source-of-truth | ✅ |
| 2 | FE renders DISPLAY_NAME | ✅ |
| 3 | No raw USER_CODE on card | ✅ |
| 4 | Timeline/handoff readable | ✅ |
| 5 | Snapshot enrichment | ✅ |
| 6 | FE build PASS | ✅ |

## Files

| Updated | New |
|---------|-----|
| `gas-runtime-api/taskDbUserDisplay.js`, `taskDbService.js` | `taskGs09dChecks.ts` |
| `workers/.../googleSheetTaskDbAdapter.ts` | |
| `apps/workboard/.../contracts.ts`, `userDisplay.ts`, `TasksPage.tsx` | |

## Deploy

After merge: `clasp push` GAS → manual Web App deploy if needed.

## Limitations

- USER_DIRECTORY must live in same spreadsheet as TASK_MAIN (existing task DB binding)
- Directory cache TTL follows GAS snapshot cache (30s default)
- `/api/users` fallback only when snapshot carries no directory payload
