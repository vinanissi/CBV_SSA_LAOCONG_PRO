# Pilot screen matrix (Phase 85)

## Source of truth

Runtime: `CbvUiContract_generatePilotMatrix()` groups enabled rows (`CbvUiContract_getAll()`) into:

- `appSheetDaily` — `CHANNEL = APPSHEET`
- `webAppAdvanced` — `CHANNEL = WEBAPP`
- `both` — `CHANNEL = BOTH`
- `notPilotReady` — `IS_PILOT_READY` false (may overlap channel buckets)

## Baseline intent (seeded rows)

| SCREEN_CODE | CHANNEL | Pilot-ready (seed) |
|-------------|---------|-------------------|
| HOME_ALERT_OPERATOR_DASHBOARD | BOTH | yes |
| HOME_ALERT_MY_QUEUE | BOTH | yes |
| HOME_ALERT_UNASSIGNED_QUEUE | APPSHEET | yes |
| HOME_ALERT_ESCALATED_QUEUE | BOTH | yes |
| HOME_ALERT_BLOCKED_QUEUE | BOTH | yes |
| HOME_ALERT_SLA_DASHBOARD | BOTH | yes |
| HOME_ALERT_TIMELINE | WEBAPP | no (advanced) |
| HOME_ALERT_KANBAN | WEBAPP | no (advanced) |
| RUNTIME_HEALTH_DASHBOARD | WEBAPP | no |
| CBV_TEST_CONSOLE | WEBAPP | no |
| REPORT_HANDOFF_VIEWER | WEBAPP | no |
| ADMIN_REFERENCE_VIEWER | WEBAPP | no |

Toggle `IS_PILOT_READY` as screens pass acceptance; never delete historical contract rows—disable with `IS_ENABLED` if a screen retires.

---

## Phase 85.3 pilot readiness result

**Closeout date:** 2026-05-13

| Gate | Result |
|------|--------|
| Bootstrap | **PASS** (`ok=true`, `seeded=3`, `skipped=9`, sheet already existed) |
| Validate | **PASS** (`ok=true`, `errors=0`) |
| Health Check | **GO** (`CBV_UI_CONTRACT health: GO (OK)`) |
| Envelope | **PASS** |
| Pilot readiness (`CBV_UI_CONTRACT` + GAS QA) | **GO** |
| Production readiness (bound AppSheet + WebApp, org sign-off) | **NOT YET** |

This section records evidence from the bound spreadsheet Test Console; it does not replace runtime `CbvUiContract_generatePilotMatrix()` for live grouping.
