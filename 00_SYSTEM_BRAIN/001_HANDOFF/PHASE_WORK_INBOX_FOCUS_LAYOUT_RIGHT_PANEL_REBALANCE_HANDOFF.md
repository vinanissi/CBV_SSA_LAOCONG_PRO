# PHASE_WORK_INBOX_FOCUS_LAYOUT_RIGHT_PANEL_REBALANCE — Handoff

**Status:** Complete (FE layout)  
**Date:** 2026-05-31  
**Verdict:** GO

---

## What was delivered

- Main Focus column rebalance: operational cards only.
- Right panel tabs enriched with moved reference content.
- Operator-friendly timeline labels (display-only).

---

## Deploy

- **FE only** — `apps/workboard` build/deploy.
- No GAS / Worker / sheet changes.

---

## Manual verification

1. Open Focus Mode on any task.
2. Main: only AI, Checklist, Tài liệu gần đây (+ Việc tiếp theo under actions).
3. Tab **Chi tiết**: Trạng thái, SLA, Ghi chú, Thông tin liên quan, Thao tác nhanh.
4. Tab **Timeline**: lines like `11:21 — Bắt đầu xử lý` (not raw system strings when mapped).
5. Tab **Handoff**: empty state or last handoff + link.
6. Checklist + attachments still mutate; notes still save.
7. Network: no new endpoints; no `script.google.com`.

---

## Static test

```bash
cd apps/workboard
npx tsx -e "import { runWorkInboxFocusLayoutRebalanceChecks } from './src/modules/task/inbox/focusRuntime/workInboxFocusLayoutRebalanceChecks.ts'; console.log(runWorkInboxFocusLayoutRebalanceChecks());"
```

---

## Key files

| Area | Path |
|------|------|
| Main layout | `focusRuntime/FocusContentCards.tsx` |
| Right panel | `focusRuntime/RightContextTabs.tsx` |
| Labels/helpers | `focusRuntime/focusLayoutShared.ts` |
| Checks | `focusRuntime/workInboxFocusLayoutRebalanceChecks.ts` |

---

## Do not regress

- Do not put Timeline/Handoff/Related cards back into `FocusContentCards` without ADR.
- Checklist and attachments modules: logic unchanged — layout only.
