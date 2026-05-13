# Appendix — Phase 85 original full prompt

**Hotfix time:** 2026-05-13

## Verbatim availability

The **full verbatim** Phase 85 Cursor user prompt (multi-section mission with all acceptance criteria) was **not** stored inside the git repository at hotfix time. File `016_PHASE_85_UNIFIED_UI_CONTRACT_PROMPT.md` intentionally held a **summary** plus pointer to the Cursor session.

This appendix records:

1. That gap explicitly.  
2. A **reconstructed outline** of the original Phase 85 mission (from implementation memory), for traceability—not a legal verbatim archive.

## Reconstructed outline (Phase 85 — not verbatim)

- Introduce **CBV_UI_CONTRACT** as metadata-driven UI contract for **AppSheet** and **GAS WebApp** (hybrid: operational shell vs advanced WebApp).  
- Schema fields: `UI_CONTRACT_ID`, `SCREEN_CODE`, `SCREEN_NAME`, `MODULE_CODE`, `DOMAIN_CODE`, `USER_ROLE`, `TEAM_CODE`, `CHANNEL` (APPSHEET | WEBAPP | BOTH), `SCREEN_TYPE`, data source and display mapping fields, `WEBAPP_ROUTE`, `APPSHEET_VIEW`, `APPSHEET_DEEPLINK_EXPR`, `ALLOWED_ACTIONS_JSON`, permission/security hints, SLA/status/priority fields, flags, notes, provenance, `CONTRACT_VERSION`.  
- **Operator deck:** always `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`, `OPERATOR_DASHBOARD_GROUP`, `OPERATOR_DASHBOARD_SORT` for HOME_ALERT screens; forbid legacy `DISPLAY_*`, `CARD_*`, `UX_*`, `DESKTOP_*` as **mapping targets** in contract fields.  
- AppSheet: expressions **without** leading `=`; no `_THISUSER` (use `USEREMAIL()`, `USERSETTINGS("Role")`).  
- Runtime: `84_UNIFIED_UI_CONTRACT_RUNTIME.js`; test console: `85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js`; bootstrap idempotent; validate; healthCheck; pilot matrix; WebApp route map; AppSheet guide data; standard test envelope.  
- Seed twelve baseline `SCREEN_CODE` rows (HOME_ALERT queues/dashboards, WebApp-only advanced screens, etc.).  
- Docs under `docs/ui-contract/`; brain prompt/report/handoff with numeric prefix; git commit/tag as delivered.

For the **Phase 85.1 hotfix** full text, see `017_PHASE_85_1_UI_CONTRACT_COMPILE_AUDIT_FIX_PROMPT.md` in this folder.
