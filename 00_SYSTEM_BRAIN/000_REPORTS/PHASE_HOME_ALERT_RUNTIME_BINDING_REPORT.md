# PHASE_HOME_ALERT_RUNTIME_BINDING — Report

**Date:** 2026-05-30  
**Phase:** `PHASE_HOME_ALERT_RUNTIME_BINDING`  
**Status:** **GO_WITH_WARNINGS** (code complete; live GAS deploy required)

---

## Executive Summary

`/api/today` previously returned Worker mock projection (`getTodaySummary` from `mockData.ts`) even when task runtime was on `google_sheet_existing_db`. GAS already had `HomeAlert_claimAlert`, `HomeAlert_resolveOperational`, and related logic in `05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`, but **no gas-runtime-api Web App actions** exposed them to the Worker.

This phase adds **gas-runtime-api HOME_ALERT actions**, Worker adapter + routes, permission gates, and FE binding so OperationalHome loads live alerts when GAS is configured. Production mode **does not silently fall back to mock**.

---

## Existing HOME_ALERT Runtime Audit

### GAS (`05_GAS_RUNTIME/80_HOME_ALERT_RUNTIME.js`)

| Function | Role |
|----------|------|
| `HomeAlert_claimAlert` | Claim → `IN_PROGRESS`, `ASSIGNED_TO`, `CLAIMED_BY` |
| `HomeAlert_resolveOperational` | Resolve → `RESOLVED`, `IS_RESOLVED` |
| `HomeAlert_resolveAlert` | Status transition resolve |
| `HomeAlert_assignAlert` | Assign to userId |
| `HomeAlert_refresh` | Regenerate projection from TASK_MAIN / finance / logs |
| `HomeAlert_healthCheck` | Sheet health |

**Not exposed** to Web App before this phase (Worker could not call).

### Worker (before)

| Route | Behavior |
|-------|----------|
| `GET /api/today` | Always `mockData.getTodaySummary()` + warning |

### FE (before)

| Surface | Behavior |
|---------|----------|
| `OperationalHome` | `api.getTodaySummary()` with mock fallback |
| `AlertCard` | Display only; static `Link` |

---

## Files Changed

### gas-runtime-api (new)

| File | Purpose |
|------|---------|
| `homeAlertConfig.js` | Sheet name, statuses, action list |
| `homeAlertService.js` | Read HOME_ALERT, build today summary, claim, resolve |
| `homeAlertApi.js` | POST JSON router |
| `Code.js` | Route `cbvIsHomeAlertAction_` before task-db |

### workers/api

| File | Purpose |
|------|---------|
| `src/adapters/googleSheetHomeAlertAdapter.ts` | GAS POST client |
| `src/modules/homeAlert.ts` | `handleToday`, claim, resolve |
| `src/auth/homeAlertPermissions.ts` | Claim/resolve rules |
| `src/modules/workboard.ts` | Re-export `handleToday` |
| `src/router.ts` | `POST /api/home-alert/:id/claim|resolve` |
| `src/contracts.ts` | Extended `AlertItem` |

### apps/workboard

| File | Purpose |
|------|---------|
| `src/api/client.ts` | Live `/api/today`; `claimHomeAlert`, `resolveHomeAlert` |
| `src/api/contracts.ts` | Extended `AlertItem` |
| `src/components/ui/AlertCard.tsx` | Task/hồ sơ route resolution |
| `src/components/dashboard/OperationalHome.tsx` | Clear error when mock blocked |

---

## Worker Routes Added/Updated

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/today` | `handleToday` → GAS `getTodaySummary` when `google_sheet_existing_db` + GAS URL |
| POST | `/api/home-alert/:id/claim` | `handleHomeAlertClaim` → GAS `claimHomeAlert` |
| POST | `/api/home-alert/:id/resolve` | `handleHomeAlertResolve` → GAS `resolveHomeAlert` |

GAS actions: `health`, `getTodaySummary`, `claimHomeAlert`, `resolveHomeAlert`.

---

## FE Binding Result

- **OperationalHome:** `api.getTodaySummary()` — no mock when `isRealTaskRuntime()`.
- **AlertCard:** navigates to `/inbox/:taskId` when `taskId` set; `/hoso`, `/finance` by entity type.
- **API client:** `claimHomeAlert`, `resolveHomeAlert` exposed (UI buttons deferred to `PHASE_HOME_ALERT_CLAIM_RESOLVE_UI`).

---

## Normalized HOME_ALERT Contract (`AlertItem`)

| Field | Source (sheet / GAS) |
|-------|----------------------|
| `alertId` | `ALERT_ID` |
| `title` | `DISPLAY_TITLE` / `TITLE` |
| `message` | `DISPLAY_SUMMARY` / `MESSAGE` |
| `severity` | `SEVERITY` → info/warn/error |
| `status` | `STATUS` |
| `assignedTo` | `ASSIGNED_TO` |
| `claimedBy` | `CLAIMED_BY` |
| `relatedEntityType` | `RELATED_ENTITY_TYPE` |
| `relatedEntityId` | `RELATED_ENTITY_ID` |
| `taskId` | derived when entity type TASK |
| `href` | `RELATED_RECORD_URL` or derived `/inbox/:id` |
| `createdAt` / `updatedAt` / `dueAt` | sheet timestamps |
| `priority` | `PRIORITY_SCORE` |

`TodaySummary` also includes TASK_MAIN slices (`myTasks`, `overdueTasks`, `priorityTasks`) from same GAS call; Worker filters tasks with `canUserSeeTask`.

`missingHoSo` / `pendingFinance` remain empty until HO_SO/Finance binding phases.

---

## Claim / Resolve Behavior

### Claim (`HomeAlert_claimAlert` parity in gas-runtime-api)

- `STATUS` → `IN_PROGRESS`
- `ASSIGNED_TO`, `CLAIMED_BY`, `CLAIMED_AT`
- Audit via `taskDbAppendAudit_` when available

### Resolve (`HomeAlert_resolveOperational` parity)

- `STATUS` → `RESOLVED`
- `IS_RESOLVED` = true, `IS_ACTIVE` = false
- `RESOLVED_AT`, `RESOLVED_BY`

**Does not** call task status/complete endpoints.

---

## Security / Permission Behavior

| Rule | Implementation |
|------|----------------|
| Auth required | `resolveUserContext` on all routes |
| Module gate | `canViewModule(user, 'TASK')` on `/api/today` |
| VIEW_ONLY | Cannot claim/resolve |
| ADMIN / MANAGER | Claim/resolve any active alert |
| STAFF | Claim/resolve if unassigned or assigned to self |
| Task lists in today | Filtered with `canUserSeeTask` |

Task-linked alert visibility: full task permission join not implemented (loads alert list only); document as residual risk.

---

## Mock / Fallback Behavior

| Mode | `/api/today` |
|------|----------------|
| `google_sheet_existing_db` + `GAS_TASK_API_URL` | **Live HOME_ALERT** (warning `HOME_ALERT_LIVE`) |
| `google_sheet_existing_db` without GAS URL | **FAIL** — `HOME_ALERT_MOCK_BLOCKED` |
| Dev / no GAS mode | Mock allowed with warning `demo local` |

No silent mock success in production runtime mode.

---

## Tests Run

| Command | Result |
|---------|--------|
| `workers/api` `npm run typecheck` | **PASS** |
| `workers/api` `npm run test:permissions` | **PASS** |
| `apps/workboard` `npm run build` | **PASS** |

Live GAS smoke: **PENDING deploy** (`clasp push` + Web App redeploy).

---

## Manual Verification Checklist

- [ ] Deploy `gas-runtime-api` with `homeAlert*.js`
- [ ] `GET /api/today` returns alerts from HOME_ALERT (not `demoLabel` mock)
- [ ] OperationalHome shows real alert cards
- [ ] Alert **Mở việc** opens `/inbox/:taskId` when linked
- [ ] `POST /api/home-alert/:id/claim` → 200 or 403
- [ ] `POST /api/home-alert/:id/resolve` → 200 or 403
- [ ] Task complete does not auto-resolve alert
- [ ] No direct GAS from browser DevTools (only Worker)

---

## Remaining Risks

1. **GAS deploy required** — until redeploy, Worker returns `HOME_ALERT_RUNTIME_NOT_CONFIGURED` or GAS errors.
2. **Claim/resolve UI** — API only; operator buttons in next phase.
3. **HO_SO / Finance today sections** — still empty arrays.
4. **Alert ↔ private task** — no TASK_MAIN join on alert list filter.
5. **05_GAS_RUNTIME vs gas-runtime-api** — duplicate logic; long-term should call shared library or single deploy bundle.

---

## Next Recommended Phase

**Option A:** `PHASE_HOME_ALERT_CLAIM_RESOLVE_UI` — buttons on AlertCard / OperationalAlertHeader.

**Option B:** `PHASE_HOSO_RUNTIME_BINDING` — live `missingHoSo` in today summary.

**Option C:** `PHASE_OPERATOR_UI_DENSITY_POLISH` — UX only.

---

*Append-only. Related: `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`, `PHASE_FOCUS_RUNTIME_FIX_REPORT.md`.*
