# 013 — PHASE REF_A — OPERATIONAL_REFERENCE_LAYER_DESIGN — HANDOFF

## Phase purpose

Establish a **clean operational reference layer** so real staff, roles, modules, actions, queues, and policies can be linked consistently across HOME_ALERT, SLA, escalation, and safe automation — without mixing in ENV secrets or Phase 85 AI work.

## Reference sheets standardized

- **ENUM_DICTIONARY:** Legacy columns preserved (`ENUM_GROUP`, `ENUM_VALUE`, …); appended REF-A columns (`ENUM_CODE`, `ENUM_LABEL`, …). `ENV_*` groups are **enum labels only**, not configuration.
- **USER_DIRECTORY:** Legacy `ID`, `ROLE`, `STATUS`, etc. kept; appended `ROLE_CODE`, `USER_STATUS`, org/team links, capability flags, defaults.
- **MASTER_CODE:** Legacy `CODE` / `MASTER_GROUP` kept; appended `MASTER_CODE` (alias), `MASTER_LABEL`, `MODULE_CODE`, etc.
- **DON_VI:** Legacy `ID`/`CODE`/`NAME`/`PARENT_ID`/`STATUS` kept; appended `DON_VI_ID`/`DON_VI_CODE`/`DON_VI_NAME` and operational columns.

## New sheets added

- `TEAM_DIRECTORY` — teams under `DON_VI_ID`, supervisor, default queue.
- `ROLE_PERMISSION_MATRIX` — `ROLE_CODE` × `ACTION_CODE` × `MODULE_CODE` with boolean gates.
- `FEATURE_FLAG` — feature toggles including `ENABLE_AI_SUGGESTION` default **off**.
- `SYSTEM_REGISTRY` — resource index (`SHEET`, `MODULE`, `MENU`, `TEST_CONSOLE`, `WEBHOOK`, `TRIGGER`, `APPSHEET_VIEW`, `APPSHEET_ACTION`).

## Helpers added

File: `05_GAS_RUNTIME/83_OPERATIONAL_REFERENCE_RUNTIME.js`  
Bootstrap hook: `HomeAlert_bootstrap()` → `CbvRef_ensureSheets()` + `CbvRef_seedDefaults()`.

## Seed behavior

- **Idempotent:** Inserts rows only when composite key is missing (enum group+value; master group+code; feature code; permission triple; registry type+code).
- **Non-destructive:** Does not delete or overwrite user-edited cells; does not remove legacy columns.
- Calls existing `seedEnumDictionary()` once from `CbvRef_seedDefaults()` to keep legacy enum groups in sync (still idempotent).

## What not to store in the reference layer

- API keys, tokens, private keys, webhook secrets, raw `CBV_ENV_*` payloads, bearer JWTs, or production connection strings.

## Remaining gaps

- Real **USER_DIRECTORY** / **TEAM_DIRECTORY** population and HR-driven processes.
- Dedicated **CBV_ENV_*** sheets or secret store for environment configuration.
- Optional: expand `ROLE_PERMISSION_MATRIX` to full role matrix per module.

## Next recommended phase

**CBV_ENV / configuration plane** — isolated from reference identity data; optional KMS/Script Properties for true secrets.

## What AI / Cursor must not break next time

- **TASK_MAIN** baseline: `SHARED_WITH`, `IS_PRIVATE`, security filters (see workspace rule).
- **Phase 82/83/84** functions and test consoles must remain callable.
- **OPERATOR_*** display and assignment UX contracts on `HOME_ALERT`.
- **No triggers** from REF-A; no auto assign/resolve/escalate from REF-A.
- **Append-only** migrations: never drop reference columns that production sheets may still use.
