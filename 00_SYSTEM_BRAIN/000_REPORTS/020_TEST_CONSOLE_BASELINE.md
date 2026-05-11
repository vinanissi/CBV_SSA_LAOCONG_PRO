---
doc: 020_TEST_CONSOLE_BASELINE
phase: PHASE_B_TEST_RUNTIME
purpose: Design-only thin wrapper for a unified test console menu (no implementation)
---

# Test console baseline — design only

## Current menus (reference)

| Surface | Location | Label (indicative) |
|---------|----------|-------------------|
| TASK OBS | `307_TASK_OBS_MENU.js` | `🛡️ TASK OBS` |
| MAIN_CONTROL OBS | `307_MC_OBS_MENU.js` | `🛡️ MAIN_CONTROL OBS` |
| Core v2 tests | `90_CBV_CORE_V2_TESTS.js` | (bound in MC project) |

## Proposed thin wrapper (no business mutation)

**Top-level menu:** `🧪 CBV Test Console`

**Principle:** Each item delegates to an **existing** public menu handler or runner — no new business mutations; no direct `TASK_MAIN` writes.

### Menu map (design)

| Menu item | Delegate target | Notes |
|-----------|-----------------|-------|
| Open TASK OBS | `buildTaskObsMenu_` already installs child; optional sub: “Health” → `TaskObs_menuHealthCheck` | Requires TASK script bound to spreadsheet. |
| TASK OBS — Self test | `TaskObs_menuRunSelfTest` | OBS append only. |
| TASK OBS — Bootstrap (dry) | `TaskObs_menuBootstrapDryRun` | Safe pre-check. |
| (Future) Link to MC OBS | `MC_Obs_menuRunHealthCheck` etc. | **Only** when running inside MAIN_CONTROL project or via documented cross-script pattern — do not duplicate MC code in TASK. |

### Delegate functions (skeleton — not added to repo in Phase B)

```javascript
// DESIGN ONLY — do not paste into production without binding review.
function cbvTestConsole_menuTaskObsHealth() {
  return TaskObs_menuHealthCheck();
}
```

### Non-goals

- No redesign of `97_TASK_SYSTEM_TEST_RUNNER.js` in this phase.
- No merge of monolith `05_GAS_RUNTIME` test harness into TASK clasp in this phase.

## Next implementation gate

Implement wrapper in **one** chosen script project (TASK **or** MC **or** new thin library) only after `phase/t0-task-obs-green-baseline` sign-off — staging first.
