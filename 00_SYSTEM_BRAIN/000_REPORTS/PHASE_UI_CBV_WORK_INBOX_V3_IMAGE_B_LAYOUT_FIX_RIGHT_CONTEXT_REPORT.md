# PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT — Report

**Date:** 2026-05-29  
**Status:** GO (static + build); manual UI sign-off recommended at 1366×768

## Problem

Work Inbox V3 Focus showed **four** columns: global `DetailPanel` (“Ngữ cảnh vận hành”) plus **RightContextTabs** nested inside the focus card. Main workspace was too narrow with heavy nested vertical scroll.

## Root cause

`WorkInboxLayoutProvider` wrapped only `TaskInboxRoute`, not `AppShell`. `useWorkInboxLayout()` in `AppShell` fell back to defaults → `suppressGlobalDetailPanel: false` → legacy panel always rendered.

## Solution

1. **Provider at app root** — `WorkInboxLayoutProvider` wraps `AppShell` in `App.tsx`.
2. **Three-region layout** — When `useThreeRegionFocusLayout` (inbox route + focus runtime flag + `viewMode === 'focus'`):
   - `cbv-workspace-layout` / `workspace-layout`: `focus-workspace` + `#cbv-right-context-root`
   - No `DetailPanel` in this branch
3. **Portal right tabs** — `WorkInboxFocusRuntime` renders workspace only; `RightContextTabs` via `createPortal` into `#cbv-right-context-root`.
4. **Legacy panel disabled** — `DetailPanel` returns `null` on `/inbox` when focus runtime enabled (`legacy-context-panel` class retained for other routes).
5. **Flatten main** — `WorkInboxShell` pass-through in focus mode (no “Hộp việc” wrapper); `work-inbox-focus-workspace--flat` removes card chrome.
6. **Widths** — Sidebar `220–240px` (`w-[230px]`); right column `360–420px` (380px default).

## Target DOM

```
.app-shell
  .topbar
  .app-shell__body
    .sidebar-shell          ← left
    main
      .cbv-workspace-layout
        .focus-workspace
        #cbv-right-context-root.right-context-tabs-outer
  .bottom-status-bar (RuntimeStatusBar)
```

## Changed files (this phase)

| File | Change |
|------|--------|
| `apps/workboard/src/app/App.tsx` | `WorkInboxLayoutProvider` wraps `AppShell` |
| `apps/workboard/src/components/layout/AppShell.tsx` | Three-region layout + right mount root |
| `apps/workboard/src/modules/task/inbox/WorkInboxLayoutContext.tsx` | `suppressGlobalDetailPanel`, `useThreeRegionFocusLayout` |
| `apps/workboard/src/modules/task/inbox/rightContextPortal.ts` | `RIGHT_CONTEXT_ROOT_ID` |
| `apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` | Workspace-only + portal |
| `apps/workboard/src/modules/task/inbox/focusRuntime/FocusTaskWorkspace.tsx` | Flat workspace class |
| `apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx` | Outer modifier class |
| `apps/workboard/src/components/layout/DetailPanel.tsx` | `return null` on inbox V3 |
| `apps/workboard/src/components/inbox/WorkInboxShell.tsx` | Focus pass-through |
| `apps/workboard/src/modules/task/TaskInboxRoute.tsx` | Restore `WorkInboxShell` without nested provider |
| `apps/workboard/src/styles/index.css` | Region widths + flat focus styles |
| `apps/workboard/src/modules/task/inbox/focusRuntimeLayoutFixChecks.ts` | CBV_TCS_V1 suite |

## Tests

**Suite:** `runFocusRuntimeLayoutFixChecks()` — see `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT_TEST_EVIDENCE.md`

```bash
cd apps/workboard && npm run typecheck && npm run build
```

**Build:** PASS (2026-05-29)

## Manual checklist

| Check | Expected |
|-------|----------|
| Legacy panel | No “Ngữ cảnh vận hành” placeholder on `/inbox` focus |
| Right panel | Only Chi tiết / Timeline / Handoff / Tài liệu |
| Regions | 3 horizontal only |
| Scroll | Single primary scroll in focus column |
| 1366×768 | Primary CTA + next task near viewport |

## Out of scope (per prompt)

- No DB/schema changes
- No API contract changes
- Legacy runtime code retained, not rendered on default V3 focus path
