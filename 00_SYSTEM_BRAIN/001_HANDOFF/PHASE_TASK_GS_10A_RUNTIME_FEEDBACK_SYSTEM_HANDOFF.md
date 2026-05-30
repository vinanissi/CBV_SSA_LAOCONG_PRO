# PHASE_TASK_GS_10A — Runtime Feedback System — Handoff

**Date:** 2026-05-28  
**Status:** GO — ready for operator smoke test  
**Report:** [`000_REPORTS/PHASE_TASK_GS_10A_RUNTIME_FEEDBACK_SYSTEM_REPORT.md`](../000_REPORTS/PHASE_TASK_GS_10A_RUNTIME_FEEDBACK_SYSTEM_REPORT.md)  
**Prior audit:** [`PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_REPORT.md`](../000_REPORTS/PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_REPORT.md)

---

## What was fixed

### Unified layer
- `RuntimeFeedback` model + Vietnamese copy pack
- `RuntimeFeedbackMessage` (block) + `RuntimeInlineStatus` (compact)
- `usePerTaskFeedback` hook for task mutations

### Critical audit items (all addressed)
1. Alert header false all-clear → degraded strip + retry
2. Search error state + retry
3. TopBar URL sync + empty hint + clear + aria-label
4. Task accept/complete pending + error + success inline
5. Inline execution error propagation
6. FileList no inert buttons
7. Panel Gọi/Follow-up local-only labeling
8. Footer shortcut copy + console active state + stale hint

---

## What remains

| Item | Priority | Notes |
|------|----------|-------|
| Toast host for global events | Low | Inline covers current scope |
| Workspace inline search (`q` param) | Medium | API exists, UI not wired |
| HoSo page search | Medium | Out of GS_10A scope |
| SLA footer label vs `/observation` route | Low | Semantic rename |
| Delete `QuickActionBar.tsx` dead code | Low | Cleanup |
| CI integration for `taskRuntimeFeedbackSystemChecks` | Medium | Browser or vitest harness |
| Screenshots for evidence folder | Medium | Manual capture |

---

## How to test

```bash
cd apps/workboard
npm run dev
```

### Quick smoke

1. **Search** — Go `/search`, confirm TopBar shows `?q`. Submit empty query → hint. With worker down, search term → error banner (not empty results).
2. **Tasks** — Open `/tasks`, click ▶ on ACCEPT task → see `…` then success/error under card.
3. **Alert** — If APIs healthy, normal strip. Block network to `/api/today` → amber degraded strip, **Thử lại**.
4. **Detail panel** — Select task with files; files without URL show disabled state.
5. **Panel Gọi** — Task with CALL action → click → local-only message.
6. **Footer** — Console toggle shows active styling; if workspace degraded, `⚠ Cũ` hint.

### Validation suite

In browser devtools (after app load):

```javascript
// Import path depends on Vite dev — or add temporary button
import { runTaskRuntimeFeedbackSystemChecks } from '@/modules/task/taskRuntimeFeedbackSystemChecks';
console.table(runTaskRuntimeFeedbackSystemChecks().checks);
```

### Build

```bash
npm run build  # must PASS
```

---

## Architecture notes for next developer

**Adding feedback to a new action:**

```typescript
import { usePerTaskFeedback } from '@/shared/hooks/usePerTaskFeedback';
import { FEEDBACK_COPY } from '@/shared/utils/operatorFeedbackCopy';

const { runWithFeedback, setFeedback } = usePerTaskFeedback();

await runWithFeedback(taskId, 'my-action', {
  pending: 'Đang xử lý...',
  success: 'Đã xác nhận.',
  error: FEEDBACK_COPY.error.generic,
}, async () => {
  const res = await api.doSomething();
  return res.ok ? { ok: true } : { ok: false, error: res.errors[0], traceId: res.traceId };
});
```

**Display on card:** pass `getTaskFeedback` / `RuntimeInlineStatus`.

**Display in panel/search:** use `RuntimeFeedbackMessage`.

---

## Next recommended phase

**`PHASE_TASK_GS_10B_SEARCH_WORKSPACE_INLINE`** (suggested):

- Wire `getTaskWorkspaceSnapshot({ q })` to task list filter
- Debounced search optional
- HoSo module search field

Or **`PHASE_TASK_GS_10C_FEEDBACK_CI`**:

- Wire `taskRuntimeFeedbackSystemChecks` into test harness
- Add Playwright smoke for alert degraded + search error

---

## Constraints preserved

- No layout redesign
- No fake backend success
- No destructive schema changes
- TASK_MAIN PRO baseline untouched
- Upload remains locked ("Sắp mở")

---

**Handoff complete. Operator trust layer is live for core task runtime commands.**
