# UAT Results v1

**Date:** 2026-05-25  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Runtime lock tag (prepared):** `v2.4.1-RF-RUNTIME-LOCK-V1`

## GAS test console results (reported baseline)

| Suite | Result | Envelope |
|-------|--------|----------|
| RF_02 Workboard Core | GO | yes |
| RF_03 Operational Coordination | GO | yes |
| RF_04 Observation Runtime | GO | yes |
| RF_05 Plugin Runtime | GO_WITH_WARNINGS | yes |
| RF_06 Finance/HO_SO Activation | GO | yes |
| RF_07 Runtime Lock Verification | GO_WITH_WARNINGS (static + post-push) | yes |

## Browser walkthrough (static audit RF_07)

| Area | Routes verified in registry | Renderer dispatch | Result |
|------|----------------------------|-------------------|--------|
| Workboard | 6 canonical | RF_02 | PASS |
| Coordination | 5 canonical | RF_03 | PASS |
| Observation | 4 UAT routes | RF_04 | PASS |
| Plugins | finance + ho-so | RF_05/RF_06 | PASS |

**Note:** Live browser render requires deployed WebApp URL after `clasp push`.

## Mobile UAT

| Check | Result | Notes |
|-------|--------|-------|
| Touch targets (cbv-action-xl) | PASS | 52px min in UI contract |
| Mobile stack wrapper | PASS | `cbv-workboard-mobile-stack` on RF_02 shell |
| Nav wrap | PASS | `cbv-thumb-zone` on RF_02–RF_06 nav |
| RF_07 nav fix | PASS | Stub Hồ sơ/Tài chính → real plugin routes by permission |

## Operator workflow

| Workflow | Result |
|----------|--------|
| TASK view/search/queue/overdue | PASS (projection HOME_ALERT) |
| FINANCE read/alerts/search | PASS (ACTIVE_READONLY) |
| HO_SO read/missing docs/alerts | PASS (ACTIVE_READONLY) |
| MANAGER coordination visibility | PASS |
| Assignment / confirm / approve write | BLOCKED (EXECUTION_LOCKED) — expected |

## Usability fixes applied (RF_07)

- RF_02 workboard nav: removed misleading stub links; wired finance/ho_so/observation/coordination by permission.

## Pending live verification

- Operator sign-off on production sheet binding
- Full role-matrix browser pass on mobile device
