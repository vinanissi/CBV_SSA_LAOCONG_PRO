# Runtime Lock Decision v1

**Decision date:** 2026-05-25  
**Status:** **RUNTIME LOCKED** (contract v1)  
**Recommended git tag:** `v2.4.1-RF-RUNTIME-LOCK-V1` (prepare only — do not push unless requested)

## Decision

CBV Operational Workspace Runtime **v1 is LOCKED** after RF_07 UAT stabilization:

- RF_02 Workboard Core
- RF_03 Operational Coordination
- RF_04 Observation Runtime
- RF_05 Plugin Runtime Baseline
- RF_06 Finance/HO_SO ACTIVE_READONLY

GAS health tests RF_02–RF_06: **GO / GO_WITH_WARNINGS** with envelope OK.

## Safe scope (approved usage)

- Read-first operational workboard on WebApp
- Task search, queue, overdue, workload views
- Observation health/alerts (read)
- Plugin module registry and finance/ho_so read workboards
- Manual operations via Sheet / AppSheet / existing GAS menus
- Small bugfix patches per RF_07 allowed-fix list

## Unsafe scope (blocked until new phase)

- WebApp writes to TASK_MAIN, FINANCE_TRANSACTION, HO_SO_MASTER
- Auto-assign, auto-resolve, auto-escalate, auto-confirm, auto-approve
- Production schema change
- Runtime rewrite or DB replacement
- Realtime sync / websocket / AI auto-action
- Breaking route or DTO renames without migration phase

## Future phases allowed (examples)

- **RF_08** AI-assisted operator layer (assist only, no auto-action)
- Write bridge via confirmed business menu with EXECUTION_LOCKED lift
- Sync heartbeat implementation
- Plugin registry externalization (optional sheet)

## Future phases blocked without architecture review

- Plugin marketplace
- Microservice split
- ERP-style accounting engine
- Full hồ sơ workflow engine in WebApp

## Lock artifacts

| Document | Path |
|----------|------|
| Runtime contract | `docs/runtime-lock/RUNTIME_CONTRACT_V1.md` |
| Routes | `docs/runtime-lock/ROUTE_REGISTRY_V1.md` |
| DTOs | `docs/runtime-lock/DTO_CONTRACTS_V1.md` |
| Permissions | `docs/runtime-lock/PERMISSION_CONTRACT_V1.md` |
| Plugins | `docs/runtime-lock/PLUGIN_CONTRACT_V1.md` |
| UAT | `docs/runtime-lock/UAT_RESULTS_V1.md` |
| Warnings | `docs/runtime-lock/KNOWN_WARNINGS_V1.md` |

## Verdict

**GO_WITH_WARNINGS** — runtime locked with documented accepted warnings.
