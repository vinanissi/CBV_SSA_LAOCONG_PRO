# PHASE_CBV_DASHBOARD_01 — Handoff

**From:** Module Launchpad Runtime  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Status:** GO

## Delivered

1. **Module registry** — config-driven, Worker + FE mirror
2. **Dynamic sidebar** — role-filtered launchpad nav
3. **Operational Home** — attention surface + module chips at `/`
4. **Multi-runtime open** — React routes, iframe `/m/:slug`, new tab external
5. **ModuleRuntimeContainer** — embed wrapper with return context
6. **Runtime telemetry** — `/api/modules/status` + TopRuntimeStrip
7. **User session bar** — DISPLAY_NAME, ROLE, current module from USER_DIRECTORY
8. **Context memory** — session return path + recent modules

## Verify locally

```bash
cd workers/api && npm run dev
cd apps/workboard && npm run dev
```

Optional env (`workers/api/.dev.vars` / `apps/workboard/.env`):
```
VITE_CBV_APPSHEET_HOSO_URL=https://...
CBV_APPSHEET_HOSO_URL=https://...
```

Open app:
- Sidebar shows modules per role (login as different USER_DIRECTORY users)
- `/` shows launchpad chips + today attention
- Click Tài liệu → opens Drive in new tab
- Configure AppSheet URL → HO_SO iframe at `/m/ho-so-appsheet`

## Checks

`apps/workboard/src/runtime/dashboard01Checks.ts` → `runDashboard01Checks()`

## Do NOT

- Revert to hardcoded PRIMARY_NAV only
- Force all modules into React pages
- Remove `/api/plugins` (legacy compat)

## Next

- Sheet-backed MODULE_REGISTRY
- Module attention counts on launchpad cards
- Wire open-log to observation sheet
