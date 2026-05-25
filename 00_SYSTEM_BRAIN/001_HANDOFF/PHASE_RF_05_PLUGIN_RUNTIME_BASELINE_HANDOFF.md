# Handoff — PHASE_RF_05 Plugin Runtime Baseline

## Summary

RF_05 adds modular plugin contract layer: read-only hardcoded registry, TASK plugin ACTIVE (binds existing RF_02/03/04), FINANCE and HO_SO STUB skeletons, plugin workboard UI, CBV_TCS test. No marketplace. No auto-execute.

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Hardcoded registry | No sheet migration in RF_05 |
| TASK = ACTIVE | Reuses existing runtimes via capability bindings |
| FINANCE/HO_SO = STUB | No fake WebApp read model |
| `CBV_PluginObservation_getHealth` | Adapter for RF_04 without heavy RF_04 rewrite |
| Quick actions `autoExecute: false` | Production safety |

## Verify

1. `clasp push`
2. 🧪 CBV Test Console → **Run RF_05 Plugin Runtime Health Test**
3. Open `/workspace/plugins` and `/workspace/plugins/task`
4. Confirm RF_04 `/workspace/observation` still works

## Permissions added

- TASK: `TASK_SEARCH`, `TASK_TIMELINE_VIEW`, `TASK_FILE_VIEW`
- FINANCE: `FINANCE_VIEW`, `FINANCE_SEARCH`, `FINANCE_CONFIRM_PAYMENT`, `FINANCE_FILE_VIEW`
- HO_SO: `HO_SO_VIEW`, `HO_SO_SEARCH`, `HO_SO_FILE_VIEW`, `HO_SO_APPROVAL`
- SYSTEM: `PLUGIN_VIEW`, `PLUGIN_ADMIN`, `PLUGIN_OBSERVATION_VIEW`

## Next phase

**PHASE_RF_06_FINANCE_HOSO_PLUGIN_ACTIVATION** — activate FINANCE/HO_SO read models, extend search, bind notifications

## Do NOT

- Auto-execute plugin actions
- Mark STUB capabilities as ACTIVE
- Change TASK_MAIN schema
- Break RF_02/03/04 routes

## Open questions

1. When to move registry from hardcoded GAS to optional config sheet?
2. Merge plugin health into RF_04 observation dashboard?
3. Unlock FINANCE_CONFIRM_PAYMENT via confirmed menu bridge only?
