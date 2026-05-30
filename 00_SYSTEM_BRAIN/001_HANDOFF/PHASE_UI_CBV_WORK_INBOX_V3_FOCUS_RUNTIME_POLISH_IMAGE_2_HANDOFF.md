# HANDOFF — PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2

**Date:** 2026-05-29 · **Status:** GO

## Shipped

- **3-region layout:** `OperatorMainSidebar` | `FocusTaskWorkspace` | `RightContextTabs`
- **Removed:** nested `CompactSidebar`, duplicate `DetailPanel` on `/inbox` V3
- **Hidden:** legacy cognition runtime on `/inbox` (`shouldRenderLegacyTaskRuntime`)
- **Context:** `WorkInboxLayoutProvider` in `TaskInboxRoute`

## Verify

```bash
cd apps/workboard && npm run typecheck && npm run build
npm run dev  # → /inbox
```

## Key files

- `OperatorMainSidebar.tsx`, `AppShell.tsx`, `WorkInboxFocusRuntime.tsx`, `RightContextTabs.tsx`
- `focusRuntimePolishImage2Checks.ts`

## Do not regress

- Do not re-add CompactSidebar inside main canvas
- Do not show DetailPanel + RightContextTabs together on /inbox

## References

- Report: `000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2_REPORT.md`
- Evidence: `005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_FOCUS_RUNTIME_POLISH_IMAGE_2_TEST_EVIDENCE.md`
