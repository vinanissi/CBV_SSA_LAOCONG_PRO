# PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_VISUAL_POLISH — Report

**Date:** 2026-05-29  
**Status:** GO (static + build)

## Scope

Visual polish after 3-region layout fix. No schema/API changes; no legacy panel re-render.

## Changes

### Width balance
- Left sidebar: **220px** fixed (`sidebar-shell`)
- Right context: **360–400px** (default 380px)
- Main focus: flex 1, compact vertical rhythm (`gap-2`)

### Main content — 2-column grid
- Left: **AI TÓM TẮT** + **CHECKLIST GỢI Ý**
- Right: compact **THÔNG TIN LIÊN QUAN** (`work-inbox-focus-content-cards--grid`)

### Focus header
- Center **FOCUS MODE** pill (`work-inbox-focus-header__center-pill`) with indigo badge styling

### Quick badges
- Semantic chip variants: need-action (orange), urgent (red), no-due (gray), sla-ok (green), open (blue)

### Action bar
- Inline row: primary **280–360px** + secondary buttons same row (`work-inbox-focus-action-bar--inline`)

### Right context panel
- Improved tab active underline (`::after`)
- Panel padding `px-4 py-3`
- Quick actions **2-column grid** card buttons

### Viewport 1366×768
- Tighter title (`text-lg`), metadata, cards, next-task padding for above-the-fold visibility

## Changed files

| File | Change |
|------|--------|
| `FocusHeader.tsx` | FOCUS MODE pill |
| `QuickContextBadges.tsx` | Semantic chip variants |
| `FocusContentCards.tsx` | 2-column grid layout |
| `FocusActionBar.tsx` | Inline action row |
| `FocusTaskWorkspace.tsx` | Badges above title (unchanged order) |
| `styles/index.css` | All visual tokens |
| `focusRuntimeImageBVisualPolishChecks.ts` | CBV_TCS_V1 suite |

## Tests

`runFocusRuntimeImageBVisualPolishChecks()` — see test evidence doc.

```bash
cd apps/workboard && npm run typecheck && npm run build
```

## Manual checklist (1366×768)

- [ ] Title + badges visible without scroll
- [ ] AI summary + checklist + related info in 2 columns
- [ ] Primary CTA not full-width; secondary on same row
- [ ] Right tabs with clear active underline
- [ ] Top of “Việc tiếp theo” visible
- [ ] No “Ngữ cảnh vận hành” legacy panel
- [ ] No horizontal scroll
