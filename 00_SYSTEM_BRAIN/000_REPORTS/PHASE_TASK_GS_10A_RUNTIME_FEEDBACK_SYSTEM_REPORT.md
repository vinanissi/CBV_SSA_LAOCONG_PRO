# PHASE_TASK_GS_10A — Runtime Feedback System — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_GS_10A_RUNTIME_FEEDBACK_SYSTEM`  
**Status:** GO  
**Build:** `npm run build` (apps/workboard) — **PASS** (~8.8s)  
**Baseline:** Audit `PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK` · CBV Operational Ecosystem Standard V1

---

## 1. Summary

Implemented a **unified runtime feedback layer** for CBV Workboard task runtime. Operators now get visible pending, success, error, degraded, and disabled states across alert summary, search, task mutations, inline execution, file list, and panel local actions.

**Core principle enforced:** No silent failure · No fake success · No invisible no-op · No false all-clear.

**New infrastructure:**

| Artifact | Role |
|----------|------|
| `shared/utils/runtimeFeedback.ts` | Types + factory helpers |
| `shared/utils/operatorFeedbackCopy.ts` | Vietnamese operational copy |
| `shared/hooks/usePerTaskFeedback.ts` | Per-task pending/success/error state |
| `components/ui/RuntimeFeedbackMessage.tsx` | Block feedback (search, alerts) |
| `components/ui/RuntimeInlineStatus.tsx` | Compact row/panel feedback |
| `modules/task/taskRuntimeFeedbackSystemChecks.ts` | Static validation suite (18 checks) |

Toast host **deferred** — inline feedback sufficient for this phase.

---

## 2. Problems fixed from audit

| Audit finding | Fix |
|---------------|-----|
| Alert false all-clear on API fail | `buildDegradedOperationalAlertSummary` + degraded strip + retry |
| SearchPage no error UI | `fetchError` + `RuntimeFeedbackMessage` + retry |
| TopBar query not synced | `useEffect` reads `?q` on `/search` |
| Empty search silent no-op | `emptyHint` + copy "Nhập từ khóa để tìm kiếm" |
| Task accept/complete silent fail | `usePerTaskFeedback.runWithFeedback` + row inline status |
| Inline execution silent fail | `InlineExecOutcome` with `ok: false` propagated to UI |
| FileList inert buttons | Open when `fileUrl`; disabled span when not |
| Panel Gọi/Follow-up implied persistence | Local-only message after click |
| Footer shortcut "R refresh" misleading | Changed to "R resume" |
| Search missing aria-label | Added on header input |
| Quick focus missing aria-pressed | Added |

---

## 3. Runtime feedback model

```typescript
RuntimeFeedbackState: idle | pending | success | error | degraded | disabled | empty
RuntimeFeedbackSeverity: info | success | warning | error | critical

RuntimeFeedback {
  state, severity, message, detail?, traceId?,
  retryLabel?, retry?, source?
}
```

Helpers: `pendingFeedback`, `successFeedback`, `errorFeedback`, `degradedFeedback`, `feedbackFromApiEnvelope`.

---

## 4. Alert degraded behavior

**Before:** API failure → zero counts → "✓ Không có vấn đề vận hành quan trọng"

**After:**

- `OperationalAlertHeader` sets `degraded=true` when `getTodaySummary` fails or network error
- Partial degrade when coordination fails but today succeeds
- Strip shows: `⚠ Không xác minh được cảnh báo vận hành · Dữ liệu có thể chưa đồng bộ`
- **Thử lại** button reloads summary
- Optional error detail expand
- CSS: `operational-alert-strip-degraded` (amber)

---

## 5. Search feedback behavior

**TopBar:**

- Syncs input from URL on `/search`
- Clear button (✕) resets query and navigates to `/search`
- Empty submit → inline hint (not silent)
- `aria-label` on search input
- Logout shows pending label while API runs

**SearchPage:**

- API fail → error banner with retry (not empty state)
- Network catch → connection error + retry
- Empty results only when `res.ok && results.length === 0`
- Light-theme readable title colors

---

## 6. Task mutation feedback

**Hook:** `usePerTaskFeedback` in `TasksPage`

**Accept (▶):**

- Pending: "Đang nhận việc…" — button shows `…`, disabled
- Success: "Đã chuyển sang đang xử lý." — auto-clear 4s
- Error: "Không thể nhận việc. Thử lại." + retry

**Complete (✓):** Same pattern with complete copy

**Display:** `RuntimeInlineStatus` under task card row

**Panel:** Receives `actionFeedback` for focused task; updates on feedback map change

---

## 7. Inline execution feedback

**`useInlineExecution` returns `InlineExecOutcome`:**

- `{ ok: false, error, traceId? }` on API failure
- `{ ok: true, mode, localOnly?, message? }` on success

**TasksPage handlers** set per-task inline feedback on error/success.

**Local-only actions** (CALL/FOLLOW/CONFIRM): `localOnly: true` + message about temporary UI record.

---

## 8. No-op button handling

**FileList:**

- `fileUrl` present → opens in new tab
- Missing URL → non-interactive disabled span with "Tệp chưa được liên kết"
- Empty list → "Chưa có tệp để mở"

**Panel Gọi/Follow-up:**

- `handleLocalActionStart` + `FEEDBACK_COPY.localOnly.callFollow`
- Does not imply backend persistence

---

## 9. Accessibility fixes

- Search `aria-label`
- Quick focus `aria-pressed`
- Task action buttons `aria-label` + `disabled` while pending
- Feedback uses `role="status"` or `role="alert"` by severity
- Console button `aria-expanded` + `aria-label`
- File entries `aria-disabled` when not openable

---

## 10. Files changed

**New:**

- `apps/workboard/src/shared/utils/runtimeFeedback.ts`
- `apps/workboard/src/shared/utils/operatorFeedbackCopy.ts`
- `apps/workboard/src/shared/hooks/usePerTaskFeedback.ts`
- `apps/workboard/src/components/ui/RuntimeFeedbackMessage.tsx`
- `apps/workboard/src/components/ui/RuntimeInlineStatus.tsx`
- `apps/workboard/src/modules/task/taskRuntimeFeedbackSystemChecks.ts`

**Updated:**

- `OperationalAlertHeader.tsx`, `OperationalAlertStrip.tsx`
- `operationalAlertSummary.ts`
- `TopBar.tsx`, `AppShell.tsx`, `SearchPage.tsx`
- `TasksPage.tsx`, `TaskCard.tsx`, `TaskGroupSection.tsx`
- `useInlineExecution.ts`, `OperationalContextPanel.tsx`
- `FileList.tsx`, `QuickFocusFilters.tsx`
- `RuntimeStatusBar.tsx`
- `styles/index.css`

---

## 11. Validation results

**Suite:** `runTaskRuntimeFeedbackSystemChecks()` — 18/18 checks **PASS** (static source analysis)

Invoke in browser console after dev load:

```javascript
import { runTaskRuntimeFeedbackSystemChecks } from './modules/task/taskRuntimeFeedbackSystemChecks';
runTaskRuntimeFeedbackSystemChecks();
```

**Manual checklist (recommended with `npm run dev`):**

| Scenario | Expected |
|----------|----------|
| Empty search submit | Hint under header search |
| `/search?q=test` | TopBar shows query |
| Search API offline | Error banner, not "Không tìm thấy" |
| Alert API fail | Amber degraded strip, no all-clear |
| Click ▶ on task | Pending … then success/error inline |
| File without URL | Disabled, not clickable |
| Panel Gọi | Local-only message |
| Footer Console | Active state when open; stale hint if degraded |

---

## 12. Build result

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** — 151 modules, tsc + vite |

---

## 13. Screenshots requested

Manual capture recommended (dev server):

1. Search error state — disconnect worker or invalid API
2. Empty search hint — submit blank query
3. Task pending — click ▶ during slow API
4. Task error — simulate API fail if available
5. Alert degraded — block `/api/today`
6. File disabled — task detail with files lacking `fileUrl`
7. Footer console active + stale hint

Screenshots not auto-captured in this phase.

---

## 14. Known TODOs / deferred

| Item | Phase |
|------|-------|
| Global toast host (`OperationalToastHost`) | Deferred — inline sufficient |
| TasksPage workspace `q` inline search | Future SEARCH phase |
| HoSo dedicated search | Future |
| Drawer SLA/Memory panels | GS_09P+ runtime feeds |
| Upload footer action | Remains EXECUTION_LOCKED |
| Remove dead `QuickActionBar.tsx` | Cleanup PR |
| Automated CI for feedback checks | Future harness |

---

**Direction achieved:** Functionality → Feedback → Trust → Operational Runtime.
