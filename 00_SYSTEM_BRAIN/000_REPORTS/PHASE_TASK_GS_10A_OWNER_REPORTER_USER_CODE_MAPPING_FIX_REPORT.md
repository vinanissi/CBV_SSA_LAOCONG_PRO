# PHASE_TASK_GS_10A — OWNER / REPORTER USER_CODE Mapping Fix — Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO  
**Build:** `npm run build` — PASS

---

## Summary

Critical contract correction: **`TASK_MAIN.OWNER_ID`** and **`TASK_MAIN.REPORTER_ID`** resolve against **`USER_DIRECTORY.USER_CODE`**, not `USER_DIRECTORY.ID`. UI surfaces render **`DISPLAY_NAME`**; raw `USR_*` codes are hidden on primary surfaces.

## A. Root rule

| Task column | Directory lookup | UI render |
|-------------|------------------|-----------|
| `OWNER_ID` | `USER_CODE` | `DISPLAY_NAME` |
| `REPORTER_ID` | `USER_CODE` | `DISPLAY_NAME` |

Example: `OWNER_ID = USR_005` → directory row `USER_CODE = USR_005`, `DISPLAY_NAME = Trần Thị B` → FE shows **Trần Thị B**.

## B. GAS fix

**`gas-runtime-api/taskDbUserDisplay.js`**

- Directory cache primary key: `lookupKey = USER_CODE || ID` (was `ID || USER_CODE`).
- `usersById` / `userDisplayMap` indexed by `USER_CODE` first; `ID` and `USER_ID` as secondary aliases only.
- `taskDbResolveUserRef_(ref)` — `ref` is treated as `USER_CODE`; returns `{ userCode, displayName, id }`.
- `taskDbEnrichTaskUserFields_()` emits:
  - `ownerUser: { userCode, displayName, id? }`
  - `reporterUser: { userCode, displayName, id? }`
  - `displayOwner` / `displayReporter` — never raw `USR_*`.

**`gas-runtime-api/taskDbService.js`**

- `taskDbMapTaskSummaryRow_` no longer seeds `displayOwner` with raw `OWNER_ID`.
- `taskDbMapTaskRow_` re-runs enrichment after `reporterId` is set (reporter fields included).

## C. Snapshot enrichment

Per task row (server-side):

```json
{
  "ownerId": "USR_005",
  "displayOwner": "Trần Thị B",
  "ownerUser": { "userCode": "USR_005", "displayName": "Trần Thị B", "id": "UD_DIR_005" },
  "reporterId": "USR_001",
  "displayReporter": "Nguyễn Văn A",
  "reporterUser": { "userCode": "USR_001", "displayName": "Nguyễn Văn A", "id": "UD_DIR_001" }
}
```

## D. FE fix

**`apps/workboard/src/api/contracts.ts`**

- `UserRef.userCode` required; `id` optional (internal directory id).
- `TaskItem.displayOwner`, `TaskItem.displayReporter` added.

**`apps/workboard/src/runtime/userDisplay.ts`**

- `indexDirectoryEntry` — `USER_CODE` indexed before internal `ID`.
- `getTaskOwnerDisplay` — prefers `displayOwner` → `ownerUser.displayName` → directory lookup by `ownerId` (USER_CODE).
- `getTaskReporterDisplay` — same priority chain for reporter.
- `getTaskOwnerTechnicalId` / `getTaskReporterTechnicalId` — return `userCode` for tooltips/debug.

Surfaces (via shared helpers): TaskCard, OperationalContextPanel, Timeline, Handoff, Escalation meta, Waiting owner, Queue grouping, Team pressure.

## E. Test case

`runTaskGs10aChecks()`:

| Input | Expected |
|-------|----------|
| `OWNER_ID = USR_005`, directory `DISPLAY_NAME = Trần Thị B` | Owner display **Trần Thị B** |
| `REPORTER_ID = USR_001`, directory `DISPLAY_NAME = Nguyễn Văn A` | Reporter display **Nguyễn Văn A** |
| Internal `ID = UD_DIR_005` ≠ `USER_CODE` | Lookup still works via `USER_CODE` |

Must NOT show `USR_005` or `USR_001` on primary surfaces.

## F. Acceptance

| # | Criterion | Status |
|---|-----------|--------|
| 1 | OWNER_ID resolves by USER_CODE | PASS |
| 2 | REPORTER_ID resolves by USER_CODE | PASS |
| 3 | DISPLAY_NAME shown on FE | PASS |
| 4 | USER_CODE hidden from primary surfaces | PASS |
| 5 | Safe fallback when mapping missing | PASS |
| 6 | FE build PASS | PASS |
| 7 | Report (this file) | PASS |
| 8 | Handoff doc | PASS |

## Out of scope (unchanged)

- No DB / column renames
- No hardcoded display names
- No mapping `OWNER_ID` → `USER_DIRECTORY.ID` first
