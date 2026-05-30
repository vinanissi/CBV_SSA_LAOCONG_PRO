# PHASE_TASK_GS_02A — Runtime Action Router Fix Report

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** FIX APPLIED — deploy required

---

## Symptom

FE/Worker error when calling workspace snapshot:

```
Action không được phép: getTaskWorkspaceSnapshot
```

## Root Cause

POST request hit **RF_12 `doPost` default branch** (`Code.js` line ~168) instead of **task-db router** (`taskDbDoPost_`).

This happens when:

1. Deployed GAS Web App is **older** than local repo (no `taskDbApi.js` / `taskDbConfig.js` on server), so `taskDbIsTaskDbAction_` is undefined → routing skipped.
2. Action not normalized (whitespace) — mitigated by trim.

Worker action name was **correct**: `getTaskWorkspaceSnapshot` (verified in `googleSheetTaskDbAdapter.ts`).

## Audit Results

| Check | Result |
|-------|--------|
| `CBV_TASK_DB_ACTIONS` includes `getTaskWorkspaceSnapshot` | YES — `taskDbConfig.js` |
| `taskDbHandleAction_` case mapping | YES → `CBV_TaskDb_getTaskWorkspaceSnapshot` |
| Public function `CBV_TaskDb_getTaskWorkspaceSnapshot()` | ADDED — `taskDbService.js` |
| Worker adapter action string | EXACT match `getTaskWorkspaceSnapshot` |
| Typos (`SnapShot`, `getWorkspaceSnapshot`) | NONE in repo |

## Fixes Applied

### 1. `taskDbConfig.js`
- Canonical whitelist `CBV_TASK_DB_ACTIONS` (single source of truth)

### 2. `taskDbService.js`
- `CBV_TaskDb_getTaskWorkspaceSnapshot(payload)`
- `CBV_TaskDb_getAllowedActions()`
- `CBV_TaskDb_isRegisteredAction(action)`

### 3. `taskDbApi.js`
- Normalize action with trim
- `UNKNOWN_ACTION` response: `{ ok, code, action, allowedActions, errors }`
- `cbvIsTaskDbAction_()` + `cbvRouteTaskDbPost_()` fallback

### 4. `Code.js`
- Route task-db POST **before** RF_12 write switch via `cbvIsTaskDbAction_`
- RF_12 default returns `UNKNOWN_ACTION` + merged `allowedActions`
- Second-chance route in default if action is task-db

### 5. Test Console
- `CBV_TCS_GS_02A_snapshotActionRegistered()` in `taskDbTestConsoleGs02a.js`

## Deploy Steps (required)

```bash
cd gas-runtime-api
clasp push
clasp deploy --description "TASK_GS_02A action router fix"
```

Update Worker `GAS_TASK_API_URL` if deployment URL changes.

Verify in Apps Script:

```javascript
CBV_TCS_GS_02A_snapshotActionRegistered()
```

## Expected Response After Fix

POST `{ "action": "getTaskWorkspaceSnapshot", "payload": { "filters": { "limit": 10 } } }`

```json
{
  "ok": true,
  "code": "OK",
  "action": "getTaskWorkspaceSnapshot",
  "data": { "tasks": [], "runtime": { "mode": "google_sheet_existing_db" } }
}
```

## Unknown Action Format (defensive)

```json
{
  "ok": false,
  "code": "UNKNOWN_ACTION",
  "action": "badAction",
  "allowedActions": ["health", "getTaskWorkspaceSnapshot", "..."]
}
```

---

*Append-only report — PHASE_TASK_GS_02A*
