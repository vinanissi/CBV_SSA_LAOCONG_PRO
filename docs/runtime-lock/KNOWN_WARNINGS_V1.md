# Known Warnings v1 (Accepted at Runtime Lock)

These warnings are **documented and accepted** for v1 lock. They do not block operational read-first usage.

## RF_05 / Plugin baseline

- Plugin registry is **hardcoded in GAS** (no sheet registry).
- FINANCE/HO_SO coordination bindings remain **PARTIAL / STUB**.

## Sync / observation

- Sync health: **NOT_CONFIGURED / STUB** only (RF_04).
- Plugin observation not fully merged into RF_04 dashboard (adapter at `/workspace/plugins/health`).
- Legacy `/runtime/health` placeholder still exists (Phase 92).

## EXECUTION_LOCKED actions

- Task assignment from WebApp (RF_03).
- Finance payment confirm (RF_06).
- HO_SO approval (RF_06).

## Data / projection

- Timeline may be **empty** if FINANCE_LOG / HO_SO_UPDATE_LOG have no rows.
- Missing sheet fields produce **warnings** in projection DTO (not fake values).
- HO_SO document completeness uses heuristic required set (CCCD, GPLX, DANG_KIEM) — not full DOC_REQUIREMENT engine in WebApp path.
- Finance amount/status **UNKNOWN** when column blank.

## Permission / roles

- STAFF does not see FINANCE/HO_SO plugin nav unless role grants.
- OPERATOR legacy role maps to STAFF — may need explicit MANAGER mapping for team views.

## Infrastructure

- GAS tests require **clasp push** + Sheet binding.
- Runtime lock **git tag not pushed** unless explicitly requested.

## RF_05 test expectation

- GO_WITH_WARNINGS is normal (hardcoded registry, partial coordination for finance/ho_so).
