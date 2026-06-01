# ADR — DSR Selective Sync Apply

**Status:** APPROVED  
**Date:** 2026-06-01  
**Phase:** `PHASE_DSR_05C_SELECTIVE_SYNC_APPLY`

---

## Context

Phase 05B required whitelist-only sync. Audit found whitelisted sheets may still have row-count differences; syncing all whitelist tabs risks unintentional overwrites.

---

## Decision

| Field | Value |
|-------|--------|
| **Decision ID** | `DSR_DECISION_002` |
| **Decision** | `SELECTIVE_SYNC_APPLY` is required before writing destination business sheets. |
| **Decision** | Whitelisted sheets are not automatically synced. |
| **Reason** | Whitelisted sheets may differ; operator review required per sheet. |
| **Risk** | Syncing all whitelisted sheets may overwrite data unintentionally. |
| **Status** | APPROVED |
| **Date** | 2026-06-01 |

---

## Consequences

- `SYNC_SELECTION` sheet with append-only operator decisions.
- `cbvDsrManualSelectiveSyncApply` applies only `APPROVE` + `READY_TO_APPLY` rows.
- `cbvDsrManualSyncApply` refuses when `SELECTIVE_SYNC_REQUIRED=TRUE`.
- `ALLOW_SYNC_ALL_WHITELIST=FALSE` enforced.
- Phase 05/05B guards preserved (additive).

---

*Append-only. Amend via new ADR addendum.*
