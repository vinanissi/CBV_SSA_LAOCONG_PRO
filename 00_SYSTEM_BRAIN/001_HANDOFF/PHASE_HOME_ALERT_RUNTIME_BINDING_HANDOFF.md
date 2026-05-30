# PHASE HOME_ALERT Runtime Binding — AI Handoff

**To:** Next agent (`PHASE_HOME_ALERT_CLAIM_RESOLVE_UI` or `PHASE_HOSO_RUNTIME_BINDING`)  
**From:** `PHASE_HOME_ALERT_RUNTIME_BINDING`  
**Date:** 2026-05-30  
**Report:** `00_SYSTEM_BRAIN/000_REPORTS/PHASE_HOME_ALERT_RUNTIME_BINDING_REPORT.md`  
**ADR:** `00_SYSTEM_BRAIN/002_DECISIONS/ADR_HOME_ALERT_RUNTIME_BINDING.md`

---

## What was delivered

1. **GAS actions** in `gas-runtime-api`: `getTodaySummary`, `claimHomeAlert`, `resolveHomeAlert`.
2. **Worker** live `/api/today` + `POST /api/home-alert/:id/claim|resolve`.
3. **No silent mock** when `CBV_TASK_RUNTIME_MODE=google_sheet_existing_db`.
4. **FE** OperationalHome + AlertCard routing; client `claimHomeAlert` / `resolveHomeAlert`.
5. **Permissions** `homeAlertPermissions.ts`.

---

## Deploy required

```bash
cd gas-runtime-api
clasp push
# Redeploy Web App — same URL as GAS_TASK_API_URL
```

Until deploy, `/api/today` returns explicit error in production mode.

---

## Read first

1. `000_REPORTS/PHASE_HOME_ALERT_RUNTIME_BINDING_REPORT.md`
2. `gas-runtime-api/homeAlertService.js`
3. `workers/api/src/modules/homeAlert.ts`
4. `apps/workboard/src/api/client.ts`

---

## WIRED trace

```text
OperationalHome
  → api.getTodaySummary()
  → GET /api/today
  → gsGetHomeAlertTodaySummary
  → GAS action getTodaySummary
  → HOME_ALERT sheet (+ TASK_MAIN slice)
```

```text
api.claimHomeAlert(id)
  → POST /api/home-alert/:id/claim
  → GAS claimHomeAlert
  → HOME_ALERT patch (not TASK_MAIN)
```

---

## Do NOT redo

- Task security / Focus wiring
- Mock blocking policy for `/api/today` in GS_01 mode

---

## Next phase options

| Phase | Scope |
|-------|--------|
| `PHASE_HOME_ALERT_CLAIM_RESOLVE_UI` | AlertCard claim/resolve buttons + refresh |
| `PHASE_HOSO_RUNTIME_BINDING` | `missingHoSo` live data |
| `PHASE_OPERATOR_UI_DENSITY_POLISH` | Visual density |

---

## Test commands

```bash
cd workers/api && npm run typecheck && npm run test:permissions
cd apps/workboard && npm run build
```

---

*Append-only handoff.*
