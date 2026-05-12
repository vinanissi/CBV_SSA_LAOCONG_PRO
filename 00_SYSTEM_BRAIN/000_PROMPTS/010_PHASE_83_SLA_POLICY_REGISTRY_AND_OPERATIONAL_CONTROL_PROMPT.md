# PHASE 83 — SLA_POLICY_REGISTRY_AND_OPERATIONAL_CONTROL (Prompt Archive)

**Repo:** CBV_SSA_LAOCONG_PRO  
**Prerequisite:** Phase 82 SLA/Escalation runtime (GO_WITH_WARNINGS acceptable).  
**Standard:** CBV Operational Ecosystem Standard V1

## Goal

Promote SLA/Escalation from ad-hoc runtime math to an **administered policy registry**, **coverage validation**, **metrics snapshots**, and **manual operational controls** — still runtime-first, append-only, manual-first, no AppSheet Bot, no auto production triggers.

## Deliverables (summary)

- New sheets: `HOME_ALERT_SLA_POLICY`, `HOME_ALERT_SLA_METRICS` (manifest + ensure + seed defaults).
- Resolver: `HomeAlert_getSlaPolicy_`, `HomeAlert_resolveSlaPolicyCode_`, cache + `HomeAlert_clearSlaPolicyCache_`.
- Integrate registry thresholds into `HomeAlert_enrichSlaEscalationRuntime_` without breaking Phase 82 actions or `OPERATOR_*` / dashboard contract.
- Manual ops: upsert/deactivate/list/validate/recompute + metrics refresh.
- Test console: `HomeAlertSlaPolicy_TestConsole_run()` under **🧪 CBV Test Console**.
- Append-only report + handoff in `00_SYSTEM_BRAIN`.

*(Full task text was supplied in the Cursor request for execution.)*
