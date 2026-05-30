# HANDOFF — PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN

**Date:** 2026-05-29  
**Status:** GO  
**From:** Focus Runtime redesign implementation  
**To:** Operator UAT + optional action binding phase

---

## What shipped

- **Default `/inbox`** renders `WorkInboxFocusRuntime` (single-task workspace).
- **Inbox list mode** via “Quay lại inbox” — compact groups, cards **click-to-open** (`hideOpenButton`).
- **Right context:** `FocusRightTabs` (Chi tiết · Timeline · Handoff · Tài liệu) — tab state local.
- **Actions:** Primary → existing `openWorkInboxTask`; secondary → `showFocusRuntimeFeedback()` toast.
- **Flags:** `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME`, `VITE_CBV_WORK_INBOX_FOCUS_RUNTIME_DEFAULT` (default on).

---

## Key entry points

| File | Role |
|------|------|
| `WorkInboxGroupsPanel.tsx` | viewMode `focus` \| `inbox` |
| `focusRuntime/WorkInboxFocusRuntime.tsx` | Layout orchestrator |
| `focusRuntimeRedesignChecks.ts` | Static CBV_TCS_V1 suite |
| `workInboxGroupsFeature.ts` | Feature flags |

---

## Verify quickly

```bash
cd apps/workboard
npm run typecheck && npm run build
npx tsx -e "import { runFocusRuntimeRedesignChecks } from './src/modules/task/inbox/focusRuntimeRedesignChecks.ts'; console.log(runFocusRuntimeRedesignChecks().status)"
```

Dev: `npm run dev` → `http://localhost:5173/inbox`

---

## Do not break

- TASK_MAIN visibility contract (SHARED_WITH / IS_PRIVATE) — unchanged.
- `/tasks` legacy runtime panel — still behind `LegacyTaskRuntimePanel`.
- No auto-complete / auto-escalate added.

---

## Follow-up (recommended)

1. UAT checklist in report §10.
2. Timeline tab ← TASK_UPDATE_LOG read adapter.
3. Secondary actions ← task write runtime when product approves.
4. Consider suppressing duplicate `DetailPanel` on focus-only `/inbox`.

---

## References

- Report: `00_SYSTEM_BRAIN/000_REPORTS/PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN_REPORT.md`
- Test console: `00_SYSTEM_BRAIN/000_TEST_CONSOLE/PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN/`
- Evidence: `00_SYSTEM_BRAIN/005_TEST_EVIDENCE/PHASE_UI_CBV_WORK_INBOX_V3_FINAL_FOCUS_RUNTIME_REDESIGN_TEST_EVIDENCE.md`
- Authority: `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md`
