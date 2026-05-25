# Handoff — PHASE_RF_04 Observation Runtime Core

## Summary

RF_04 adds operational observation layer on RF_03: health cards, projection/queue probes, sync stub, audit feed, alerts, and CBV_TCS test. Read-first only — no auto-fix, no auto-escalate.

## Key decisions

| Decision | Rationale |
|----------|-----------|
| Sync = STUB / NOT_CONFIGURED | No sync engine in RF_04 |
| Audit read-first | ADMIN_AUDIT_LOG + TASK_UPDATE_LOG if present; else empty |
| Queue health wraps RF_03 | No new queue engine |
| Alerts aggregate existing signals | Overdue, queue overload, projection warnings, permission fallback |
| Separate `/workspace/observation/*` | Does not replace legacy `/runtime/health` placeholder |

## Verify

1. `clasp push`
2. 🧪 CBV Test Console → **Run RF_04 Observation Runtime Health Test**
3. Open `/workspace/observation` (ADMIN/MANAGER) or `/workspace/observation/alerts`
4. Confirm `/workspace/coordination/*` and `/workspace/workboard/*` still work

## Permissions

| Action | ADMIN/MANAGER | STAFF | VIEW_ONLY |
|--------|---------------|-------|-----------|
| OBSERVATION_VIEW | ✓ | ✓ | ✓ |
| OBSERVATION_ALERT_VIEW | ✓ | ✓ | ✓ |
| OBSERVATION_AUDIT_VIEW | ✓ | ✗ | ✗ |

## Next phase

**PHASE_RF_05_PLUGIN_RUNTIME_BASELINE** — plugin registry, module plugin contract, TASK/FINANCE/HO_SO skeletons

## Do NOT

- Auto-resolve or auto-escalate alerts
- Change TASK_MAIN schema
- Fake audit or sync status
- Break RF_02/RF_03 routes

## Open questions

1. When to wire real sync heartbeat (AppSheet ↔ Sheet)?
2. Consolidate legacy Phase 92 observability with RF_04 routes?
3. Expand audit feed to RF_03 coordination event DTO persistence?
