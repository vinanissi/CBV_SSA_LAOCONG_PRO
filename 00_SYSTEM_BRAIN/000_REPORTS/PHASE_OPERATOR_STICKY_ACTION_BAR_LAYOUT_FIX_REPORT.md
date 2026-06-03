# Phase Report — OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_OPERATOR_STICKY_ACTION_BAR_LAYOUT_FIX` |
| **RCLA** | CBV-RCLA v1.1 |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Runtime parameters

- Entrypoint: `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md`
- Target bundle: ≤10 files, `KEEP_ZIP_ONLY`

---

## Read-first

- `00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md`
- `00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_CONTRACT.md`
- `apps/workboard/src/modules/task/inbox/focusRuntime/FocusActionBar.tsx`
- `apps/workboard/src/styles/index.css` (focus action bar + more-menu)

---

## Observed layout issue

**Thao tác khác** dropdown opened downward from the sticky bottom action bar. The menu extended into the AppShell **RuntimeStatusBar** region and was partially covered / hard to click.

---

## Root cause

1. Menu used `top-full` (drop-down) while the trigger sits on `sticky bottom-0` action bar.
2. Footer is a sibling below the focus workspace in `AppShell` and paints over content that extends below the bar.
3. Sticky bar `z-20` vs menu `z-50` was insufficient across stacking contexts; footer had no explicit z-index but won by paint order.

---

## Fix

| Area | Change |
|------|--------|
| `FocusActionBar.tsx` | Sticky layout uses `work-inbox-more-menu--drop-up` + `data-cbv-more-menu-placement` |
| `index.css` | Drop-up positioning; layer CSS variables; footer `z-[--cbv-layer-footer]`; sticky bar `overflow-visible` |
| Authority | Layering rule documented in `UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md` |

### Layer order (after)

| Layer | z-token | Value |
|-------|---------|-------|
| Sticky action bar | `--cbv-layer-sticky-action-bar` | 20 |
| Footer | `--cbv-layer-footer` | 25 |
| Dropdown | `--cbv-layer-dropdown` | 60 |
| Toast | `--cbv-layer-toast` | 80 |

### Menu positioning (after)

- **Inline bar:** drop-down (`top-full`) — unchanged.
- **Sticky bar:** drop-up (`bottom-full`) — menu opens above trigger, clear of footer.

---

## Files modified

- `apps/workboard/src/modules/task/inbox/focusRuntime/FocusActionBar.tsx`
- `apps/workboard/src/styles/index.css`
- `apps/workboard/src/modules/task/inbox/focusRuntime/operatorStickyActionBarLayoutFixChecks.ts` (new)
- `00_SYSTEM_BRAIN/UI/UI_ACTION_BAR_STICKY_BOTTOM_AUTHORITY.md`

---

## Tests

| Suite | Result |
|-------|--------|
| `operatorStickyActionBarLayoutFixChecks.ts` | GO_WITH_WARNINGS (11/11) |
| Playwright SAB | SAB-01..03, 05..11, 13 PASS; SAB-04b N/A (Escape not wired); SAB-12 WARN (pre-existing FocusTaskWorkspace hooks order) |

---

## Warnings

- Escape does not dismiss more-menu (pre-existing).
- React Hooks order warning in `FocusTaskWorkspace` (pre-existing, unrelated).
- Mobile/narrow viewport not separately validated.

---

## Recommended next phase

`PHASE_CHECKLIST_OPERATOR_BROWSER_UAT` (rerun only — do not execute runtime lock).
