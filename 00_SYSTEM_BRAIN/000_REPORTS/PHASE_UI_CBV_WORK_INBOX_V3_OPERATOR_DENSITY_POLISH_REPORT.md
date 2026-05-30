# PHASE_UI_CBV_WORK_INBOX_V3_OPERATOR_DENSITY_POLISH — Report

**Date:** 2026-05-29  
**Status:** GO (static + build)

## Objective

Increase operator information density in Work Inbox V3 Focus while preserving the **3-region layout** (sidebar → focus workspace → right context tabs). No DB/API changes.

## Changes

### 1. Reduced bottom whitespace
- Removed `flex-1` stretch on `main-canvas` in focus mode → `main-canvas--focus`
- Focus workspace: `pb-0`, tighter `gap-1.5` (`work-inbox-focus-workspace--density`)

### 2. Right context panel width
- **360–400px** (default **392px**): `.right-context-tabs-outer`

### 3–5. Preview cards (main workspace, right column)
New `FocusPreviewCards.tsx`, stacked below **THÔNG TIN LIÊN QUAN** in `work-inbox-focus-content-cards__right`:

| Card | Data source | Notes |
|------|-------------|-------|
| **TIMELINE PREVIEW** | `TaskDetail.timeline` / `recentUpdates` | Fallback: last-updated label |
| **HANDOFF PREVIEW** | assignee, `canForward`, `nextStep` / `pendingAction` | Toast on “Xem chi tiết Handoff” |
| **TÀI LIỆU GẦN ĐÂY** | `TaskDetail.files` | Rendered **only if** `files.length > 0` |

`taskDetail` wired from existing `TasksPage` load path — no new API endpoints.

### 6. ~70% viewport workspace
- `.focus-workspace`: `min-height: 70vh`, `max-height: calc(100vh - 6.25rem)`

### 7. Layout preserved
- No legacy `DetailPanel` on `/inbox` V3 focus
- `RightContextTabs` still portaled to `#cbv-right-context-root`

## Target content stack (1366×768)

Above the fold (minimal scroll):

- AI TÓM TẮT
- CHECKLIST GỢI Ý
- THÔNG TIN LIÊN QUAN
- TIMELINE PREVIEW
- Action bar (▶ Bắt đầu xử lý)

## Changed files

| File | Change |
|------|--------|
| `focusRuntime/FocusPreviewCards.tsx` | **New** — Timeline, Handoff, Documents preview |
| `focusRuntime/FocusContentCards.tsx` | Right column stack + `taskDetail` props |
| `focusRuntime/FocusTaskWorkspace.tsx` | `--density`, `activeDetail` wiring |
| `focusRuntime/WorkInboxFocusRuntime.tsx` | Pass `taskDetail` / `detailLoading` |
| `components/layout/AppShell.tsx` | `main-canvas--focus` |
| `styles/index.css` | Density + preview + 70vh + right width |
| `focusRuntimeOperatorDensityPolishChecks.ts` | CBV_TCS_V1 suite |

## Tests

```bash
cd apps/workboard && npm run typecheck && npm run build
```

**Suite:** `runFocusRuntimeOperatorDensityPolishChecks()`

## Out of scope

- No schema/API contract changes
- No auto-resolve / auto-escalate
- Legacy panels not re-rendered
