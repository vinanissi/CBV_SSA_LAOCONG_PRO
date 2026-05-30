# HANDOFF — PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH

## Summary

Image B visual polish on top of stable 3-region layout. Layout architecture unchanged — only CSS + component structure for cards, header, badges, action bar, right panel.

## Key classes

| Region | Classes |
|--------|---------|
| Content grid | `work-inbox-focus-content-cards--grid`, `__left`, `--related` |
| Header pill | `work-inbox-focus-header__center-pill` |
| Badges | `work-inbox-quick-badges__chip--{need-action,urgent,no-due,sla-ok,open}` |
| Actions | `work-inbox-focus-action-bar--inline` |
| Widths | sidebar `220px`, right `360–400px` |

## Verify

```bash
cd apps/workboard && npm run typecheck && npm run build
```

Open `/inbox` at 1366×768 — core content should fit with minimal scroll.

**Checks:** `focusRuntimeImageBVisualPolishChecks.ts`

## Do not regress

- 3-region layout (`useThreeRegionFocusLayout`, portal `RightContextTabs`)
- `DetailPanel` hidden on inbox V3 focus
- Primary action binds existing handler; secondary shows toast fallback

## Docs

- Report: `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH_REPORT.md`
- Evidence: `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH_TEST_EVIDENCE.md`
- Test console: `000_TEST_CONSOLE/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH/README.md`
