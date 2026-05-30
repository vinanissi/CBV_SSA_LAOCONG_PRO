# HANDOFF — PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT

## What shipped

Work Inbox V3 Focus uses **exactly three** horizontal regions matching image B:

**Left sidebar (OperatorMainSidebar) → Focus workspace → Right context tabs (portal).**

The legacy **DetailPanel** (“Ngữ cảnh vận hành”) is not rendered on `/inbox` when `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME` is enabled.

## How it works

1. `WorkInboxLayoutProvider` in `App.tsx` supplies layout flags to `AppShell` and inbox routes.
2. `useThreeRegionFocusLayout === true` → `AppShell` renders `focus-workspace` + empty `#cbv-right-context-root`.
3. `WorkInboxFocusRuntime` portals `RightContextTabs` into that root; main column is workspace-only.
4. `TasksPage` should keep `suppressDetailPanel` when publishing task detail for focus (existing polish).

## Flags

```env
VITE_CBV_WORK_INBOX_FOCUS_RUNTIME=true
VITE_CBV_WORK_INBOX_FOCUS_RUNTIME_DEFAULT=true
```

## Verify

```bash
cd apps/workboard && npm run typecheck && npm run build
```

Open `/inbox` → confirm no fourth panel; right tabs at shell level.

**Checks:** `apps/workboard/src/modules/task/inbox/focusRuntimeLayoutFixChecks.ts`

## Next operator risks

- If provider is moved below `AppShell` again, legacy panel will reappear.
- Inbox list mode (`viewMode === 'inbox'`) uses two-column layout + optional DetailPanel when not suppressed — intentional.

## Docs

- Report: `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT_REPORT.md`
- Evidence: `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT_TEST_EVIDENCE.md`
- Test console: `000_TEST_CONSOLE/PHASE_UI_CBV_WORK_INBOX_V3_IMAGE_B_LAYOUT_FIX_RIGHT_CONTEXT/README.md`
