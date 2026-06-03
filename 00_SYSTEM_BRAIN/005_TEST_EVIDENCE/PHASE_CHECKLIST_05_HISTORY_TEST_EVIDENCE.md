# Test Evidence — PHASE_CHECKLIST_05_HISTORY

**Date:** 2026-06-01  
**Result:** GO_WITH_WARNINGS

---

## Build

```bash
cd apps/workboard && npm run build
```

Status: **PASS** (`tsc --noEmit && vite build`, 2026-06-01).

---

## Static checks

```bash
npx tsx -e "import { runChecklistHistoryRuntimeChecks } from './src/modules/task/inbox/checklist/checklistHistoryChecks.ts'; console.log(runChecklistHistoryRuntimeChecks());"
```

Expected: `status: 'GO_WITH_WARNINGS'`, all `checks` pass.

```bash
npx tsx -e "import { runChecklistInlineActionChecks } from './src/modules/task/inbox/checklist/checklistInlineActionChecks.ts'; console.log(runChecklistInlineActionChecks());"
```

Expected: `INLINE_ACTIONS_DERIVED` and `INLINE_HISTORY_CHIP` pass.

---

## Manual (recommended)

1. Open Work Inbox focus task with checklist.
2. Add feedback → open Lịch sử → confirm `feedback_added` line.
3. Toggle checkbox → confirm `checklist_status_changed`.
4. Add manual note via `+ Thêm ghi chú lịch sử`.

---

## Skipped

- Automated browser E2E (not in repo for this path)
- Cross-browser localStorage sync tests
