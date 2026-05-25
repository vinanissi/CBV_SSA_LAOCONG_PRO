# Handoff — PHASE_RF_06 Finance + HO_SO Plugin Activation

## Summary

RF_06 activates FINANCE/HO_SO read-first plugins on RF_05 registry: sheet projections, search, alerts, timeline stub, workboard UI. No writes from WebApp.

## Verify

1. `clasp push`
2. 🧪 CBV Test Console → **Run RF_06 Finance/HO_SO Plugin Activation Test**
3. Open `/workspace/plugins/finance` and `/workspace/plugins/ho-so`
4. Test unified search at `/workspace/workboard/search?q=...`

## Key decisions

| Decision | Rationale |
|----------|-----------|
| ACTIVE_READONLY not ACTIVE | No write-safe WebApp bridge yet |
| Read FINANCE_TRANSACTION / HO_SO_MASTER | Production sheets, no schema change |
| Confirm/approve EXECUTION_LOCKED | No auto-payment or auto-approve |
| RF06 renderer for finance/ho-so routes | RF05 detail pages superseded for workboard UX |

## Next phase

**PHASE_RF_07_REAL_USAGE_UAT_AND_RUNTIME_LOCK**

## Do NOT

- Auto-confirm payment or auto-approve hồ sơ
- Change production schema
- Break RF_02–RF_05 routes
