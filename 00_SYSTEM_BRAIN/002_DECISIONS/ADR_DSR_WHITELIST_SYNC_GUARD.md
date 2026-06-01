# ADR — DSR Whitelist Sync Guard

**Status:** APPROVED  
**Date:** 2026-06-01  
**Phase:** `PHASE_DSR_05B_WHITELIST_SYNC_GUARD`

---

## Context

Audit found SOURCE and DESTINATION spreadsheet schemas have diverged. Prior manual sync apply could evaluate all SOURCE business sheets, risking overwrite of destination-only runtime, governance, AppSheet, dashboard, and master-data structures.

---

## Decision

| Field | Value |
|-------|--------|
| **Decision ID** | `DSR_DECISION_001` |
| **Decision** | `FULL_WORKBOOK_SYNC` is **forbidden**. |
| **Decision** | `WHITELIST_SYNC` is **required**. |
| **Reason** | SOURCE and DESTINATION schema divergence detected. |
| **Risk** | Full workbook sync may destroy destination runtime/governance/master data. |
| **Status** | APPROVED |
| **Date** | 2026-06-01 |

---

## Consequences

- `SYNC_CONFIG` gains `FULL_WORKBOOK_SYNC`, `WHITELIST_SYNC_REQUIRED`, `SYNC_WHITELIST`, `SYNC_FORBIDDEN_PATTERNS`.
- `cbvDsrManualSyncApply` uses `cbvDsrBuildWhitelistApplyPlan_` — never all SOURCE sheets.
- `SYNC_GUARD_CONTRACT.md` updated with whitelist guards.
- GAS: `84_DATA_SYNC_RUNTIME_WHITELIST_SYNC_GUARD.js`; manual sync apply delegates to whitelist validators.
- Diff preview enriches plan rows via `MESSAGE` / action (`NOT_WHITELISTED`, `FORBIDDEN`).
- Existing backup, diff, `SYNC_ALLOWED`, and manual-only guards **unchanged** (additive stricter policy).

---

## Alternatives rejected

- **Full workbook sync with operator flag** — rejected; explicit FORBIDDEN policy.
- **Implicit allow-list from diff only** — rejected; explicit `SYNC_WHITELIST` config required.

---

*Append-only. Amend via new ADR addendum.*
