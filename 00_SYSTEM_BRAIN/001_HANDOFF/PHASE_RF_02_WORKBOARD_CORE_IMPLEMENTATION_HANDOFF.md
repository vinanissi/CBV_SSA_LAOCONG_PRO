# Handoff — PHASE_RF_02 Workboard Core Implementation

## Summary

RF_02 delivered Workboard Core v1 on `phase/from-v2.4.1-TASK-FIN-runtime-freeze`: permission runtime, RF02 routes/pages, read-first adapters (HOME_ALERT + optional TASK_UPDATE_LOG), and CBV_TCS_V1 health test. M06 workboard preserved; wrapped with RF02 header/nav.

## Architecture decisions

| Decision | Rationale |
|----------|-----------|
| Keep HOME_ALERT as task list source | Production-safe; no TASK_MAIN list API rewrite |
| Permission v1 maps legacy roles | No ENUM production change |
| RF02 routes under `/workspace/workboard/*` | Matches repo doGet convention |
| M06 body retained | Incremental hardening, not rewrite |
| Search/notification/file stubs for non-TASK | RF_02 scope; honest empty states |

## Verification

1. `clasp push`
2. Open Sheet → 🧪 CBV Test Console → **Run RF_02 Workboard Core Health Test**
3. Expect `GO` or `GO_WITH_WARNINGS`, `envelopeOk: true`
4. Manual: `/exec?route=/workspace/workboard/tasks`, task-detail with `taskId`, search with `q`

## Next phase

**PHASE_RF_03_OPERATIONAL_COORDINATION_CORE**

- Assignment runtime
- Manager queue / overdue monitor
- Staff workload
- No automation-first

## Do NOT do list

- Change TASK_MAIN schema
- Replace HOME_ALERT with new DB
- Remove AppSheet
- Deploy Cloudflare Worker as required gate
- Auto assign / auto resolve

## Open questions

1. When to wire TASK_MAIN list alongside HOME_ALERT for managers?
2. HO_SO / FINANCE search — which sheet columns canonical for phone?
3. Should RF02 routes join Phase 96 frozen set (998H) or stay registry-only?

## Recommended Cursor prompt for RF_03

See `docs/refactor/ROADMAP.md` Mốc 2 + `PERMISSION_MATRIX.md` MANAGER actions.
