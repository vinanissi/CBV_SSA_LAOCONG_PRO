# Operational reference layer (REF-A)

## What this layer is

The **operational reference layer** is sheet-backed metadata that answers: *which values are valid*, *who exists in the runtime*, *which codes mean what*, *how orgs and teams are structured*, *which features are on*, and *where important resources are registered*. GAS and AppSheet read these sheets; they do not replace runtime computation for HOME_ALERT, SLA metrics, or automation execution.

## Four core sheets

| Sheet | Purpose |
|--------|---------|
| **ENUM_DICTIONARY** | Canonical lists of allowed values by `ENUM_GROUP` (e.g. `SLA_STATUS`, `ENV_TYPE`). Storage column remains `ENUM_VALUE`; newer columns `ENUM_CODE` / `ENUM_LABEL` mirror and extend for documentation and AppSheet. |
| **USER_DIRECTORY** | People: identity, org (`DON_VI_ID`), team (`TEAM_ID`), role (`ROLE` legacy + `ROLE_CODE`), flags (`IS_OPERATOR`, …), capability booleans (`CAN_ASSIGN`, …). |
| **MASTER_CODE** | Stable codes by `MASTER_GROUP` (`MODULE_CODE`, `ACTION_CODE`, `QUEUE_CODE`, policies, …). Legacy `CODE` remains; `MASTER_CODE` / `MASTER_LABEL` / `MODULE_CODE` columns extend the same rows. |
| **DON_VI** | Organizational units. Legacy `ID` / `CODE` / `NAME` remain; `DON_VI_ID` / `DON_VI_CODE` / `DON_VI_NAME` are additive aliases for newer integrations. |

## New sheets

| Sheet | Purpose |
|--------|---------|
| **TEAM_DIRECTORY** | Teams under a `DON_VI_ID`, supervisor, default queue, workload hints. |
| **ROLE_PERMISSION_MATRIX** | Fine-grained permission rows: `ROLE_CODE` × `ACTION_CODE` × `MODULE_CODE` with boolean capability columns. |
| **FEATURE_FLAG** | Toggle features (`ENABLE_HOME_ALERT`, `ENABLE_SLA`, …) with `ENABLED`, `STATUS`, `ROLLOUT_SCOPE`. |
| **SYSTEM_REGISTRY** | Index of resources: sheets, modules, menus, test consoles, webhooks, triggers, AppSheet views/actions — `RESOURCE_REF` is a **logical** pointer (e.g. `ref:SHEET`), not a secret. |

## Where real ENV config must live

- **Not** in `ENUM_DICTIONARY`, `USER_DIRECTORY`, `MASTER_CODE`, `DON_VI`, or the four new sheets above.
- **Planned:** dedicated env sheets or secure storage (e.g. `CBV_ENV_*` phase). `ENV_TYPE` / `ENV_STATUS` in enums are **labels for valid states only**, not configuration payloads.

## Runtime usage (GAS)

- After bootstrap (`HomeAlert_bootstrap` or full `ensureAllSchemasImpl`), call **`CbvRef_ensureSheets()`** then **`CbvRef_seedDefaults()`** (idempotent; seeds only missing rows by group/code).
- Resolvers: `CbvRef_getEnum`, `CbvRef_listEnums`, `CbvRef_getUserByEmail` / `CbvRef_getUserById`, `CbvRef_getMasterCode` / `CbvRef_listMasterCodes`, `CbvRef_getDonVi`, `CbvRef_getTeam`, `CbvRef_can`, `CbvRef_isFeatureEnabled`.
- Integrity: `CbvRef_validateReferenceIntegrity()` (includes heuristic scan for secret-like substrings).
- Health: `CbvRef_healthCheck()`.

## AppSheet usage

- Use slices/virtual columns that **read** `ENUM_DICTIONARY` / `MASTER_CODE` for dropdowns and labels.
- Use `FEATURE_FLAG` to drive visibility of views or actions (expression: lookup feature row, check `ENABLED` + `STATUS`).
- Use `USER_DIRECTORY` + `TEAM_DIRECTORY` + `DON_VI` for filters and display names; keep row-level security filters consistent with existing `OPERATOR_*` contracts.

## Mapping to HOME_ALERT / SLA / automation

| Concept | Reference source | Runtime sheet / behavior |
|---------|------------------|---------------------------|
| Alert / queue / action semantics | `MASTER_CODE` (`MODULE_CODE`, `ALERT_CODE`, `QUEUE_CODE`, `ACTION_CODE`) | `HOME_ALERT` columns e.g. `MODULE_CODE`, `QUEUE_LABEL`, operator UX fields |
| SLA / escalation labels | `ENUM_DICTIONARY` groups `SLA_STATUS`, `ESCALATION_STATUS`, … | `HOME_ALERT` `SLA_*`, `ESCALATION_*` columns updated by Phase 82/83 runtimes |
| Automation catalog | `MASTER_CODE` `AUTOMATION_CODE` + `FEATURE_FLAG` | Phase 84 `HOME_ALERT_AUTOMATION_CONFIG` (execution config stays on automation sheet) |

## Admin checklist

1. Run **Ensure sheet schemas** (or `HomeAlert_bootstrap`) once per spreadsheet after deploy.
2. Run **🧪 CBV Test Console → REF-A — Operational Reference Layer** and confirm `status` is `GO` or acceptable `GO_WITH_WARNINGS`.
3. Fill real `USER_DIRECTORY` and `TEAM_DIRECTORY` rows; keep `ROLE_PERMISSION_MATRIX` aligned with actual roles.
4. Never paste API keys, tokens, or `CBV_ENV_*` payloads into reference sheets.
5. Do not install triggers from this phase; Phase 84 trigger install remains a separate, explicit decision.
