# Checklist Runtime v1 Lock

**Runtime name:** Checklist Runtime  
**Runtime version:** v1  
**Locked by phase:** `PHASE_CHECKLIST_RUNTIME_LOCK`  
**Locked at (UTC):** 2026-06-02  
**Lock status:** `CONDITIONAL_LOCK`

> **Not** `PRODUCTION_LOCK`: prerequisite UX phases are `GO_WITH_WARNINGS`; operator browser UAT is documented but not fully executed in CI.

---

## Prerequisite phases (01–10 UX runtime)

| Phase | Registry status | Report |
|-------|-----------------|--------|
| `PHASE_CHECKLIST_01_INTERACTION_FEEDBACK` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_01_INTERACTION_FEEDBACK_REPORT.md` |
| `PHASE_CHECKLIST_02_TOAST_NOTIFICATION` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_02_TOAST_NOTIFICATION_REPORT.md` |
| `PHASE_CHECKLIST_03_FOCUS_STEP_MODE` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_03_FOCUS_STEP_MODE_REPORT.md` |
| `PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION_REPORT.md` |
| `PHASE_CHECKLIST_05_COPY_LINK_UX` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_05_COPY_LINK_UX_REPORT.md` |
| `PHASE_CHECKLIST_06_COMMENT_SIGNALING` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_06_COMMENT_SIGNALING_REPORT.md` |
| `PHASE_CHECKLIST_07_OPERATOR_POLISH` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_07_OPERATOR_POLISH_REPORT.md` |
| `PHASE_CHECKLIST_08_COMPACT_ROW_MODE` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_08_COMPACT_ROW_MODE_REPORT.md` |
| `PHASE_CHECKLIST_09_FOCUS_WORKSPACE` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_09_FOCUS_WORKSPACE_REPORT.md` |
| `PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME` | GO_WITH_WARNINGS | `000_REPORTS/PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME_REPORT.md` |

Related runtime (must remain compatible):

| Runtime | Status |
|---------|--------|
| LINK Runtime v1 | GO (see `LINK/LINK_RUNTIME_V1_LOCK.md`) |
| `PHASE_LINK_04_STEP_ANCHOR_ACCURACY_FIX` | GO |
| `PHASE_LINK_04A_REAL_DOM_TRACE` | GO |
| `PHASE_SHEET_RUNTIME_LATENCY_WARNING_FIX` | GO |

---

## Locked capabilities

- Interaction feedback (pending / saved / failed per row)
- Toast notification (non-blocking, throttled)
- Focus step mode (single focused row, dim others)
- Progress visualization (count, %, bar from checklist state)
- Copy link UX (clipboard success/failure, guard while copying)
- Comment signaling (count-based only; no fabricated unread)
- Operator polish (hover/focus rings, copy-link styling)
- Compact row mode (tighter rows; focused row prominent)
- Focus workspace (enter/exit, prev/next, minimized navigator)
- Dual pane runtime (navigator left, focused-step detail right)
- Deep link integration (`/inbox/<taskId>?step=<checklistItemId>` via LINK Runtime v1)
- Sheet runtime latency warning compatibility (non-blocking warnings)

---

## Locked contracts

- `CHECKLIST_INTERACTION_FEEDBACK_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_TOAST_NOTIFICATION_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_FOCUS_STEP_MODE_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_PROGRESS_VISUALIZATION_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_COPY_LINK_UX_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_COMMENT_SIGNALING_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_OPERATOR_POLISH_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_COMPACT_ROW_MODE_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_FOCUS_WORKSPACE_CONTRACT.md` / `_AUTHORITY.md`
- `CHECKLIST_DUAL_PANE_RUNTIME_CONTRACT.md` / `_AUTHORITY.md`

Foundation contracts (smart checklist, attachments, links, etc.) remain in force; this lock certifies the **operator UX runtime stack** above.

---

## Regression baseline

See `CHECKLIST_RUNTIME_V1_REGRESSION_BASELINE.md`.

Primary gate:

```bash
npx tsx 00_SYSTEM_BRAIN/CHECKLIST/checklistRuntimeLockChecks.ts
```

---

## Known limitations

- Right-pane step detail in dual-pane mode is display-first; add/edit via checklist inline actions on navigator rows.
- No deterministic CI fixture for live Google Sheet slow-load / abort / retry.
- Dossier aggregate panel remains **task-level**; step filter is via focus + dual-pane detail panel.
- Multi-user sync, Sheet/Drive bridge, and template runtime are separate phase families—not re-certified by this lock unless listed in unlock conditions.

---

## Open warnings

- All prerequisite UX phases completed as `GO_WITH_WARNINGS` (partial manual browser UAT).
- Operator UAT checklist exists (`CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md`) but is **not** marked complete in automation.
- Visual scroll/highlight for deep links requires operator confirmation in production-like Sheet latency.

---

## Allowed changes after lock

- Bug fixes that restore locked behavior without contract change (new phase + regression update still recommended).
- Documentation, diagnostics, and test evidence updates tied to a named phase.
- Non-checklist runtime changes outside Checklist Runtime v1 boundary.

---

## Forbidden changes after lock

- Direct edits to locked UX behavior without a new phase, report, handoff, and regression baseline update.
- Checklist / task / dossier **data model** or **Sheet schema** changes without unlock.
- Deep link URL format or `data-checklist-step-id` anchor contract changes without unlock.
- Fabricated unread/new comment markers without data support.
- Persistence or workflow changes presented as “small UI tweaks.”

---

## Unlock conditions

See `CHECKLIST_RUNTIME_V1_GOVERNANCE_LOCK.md` (full list). Summary:

- Checklist data model change
- Task workflow change
- Sheet/Drive runtime change affecting checklist load/write
- Dossier runtime contract change
- Deep link contract change
- Mobile runtime introduction
- Permission model change
- Operator UAT failure or production incident
- New persistence requirement

---

## Recommended next phases

- Complete operator UAT using `CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md`; promote to `PRODUCTION_LOCK` if all blocking items pass.
- `PHASE_CHECKLIST_11*` or successor only via new RCLA manifest (out of scope for v1 lock).
- LINK_05 / automation / mobile only after explicit phase approval.

---

## Operator UAT checklist

See `CHECKLIST_RUNTIME_V1_OPERATOR_UAT.md`.
