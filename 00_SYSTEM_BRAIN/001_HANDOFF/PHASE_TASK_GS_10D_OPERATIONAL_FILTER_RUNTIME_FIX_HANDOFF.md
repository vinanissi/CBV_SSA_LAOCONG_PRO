# PHASE_TASK_GS_10D — Operational Filter Runtime Fix — Handoff

**Date:** 2026-05-28  
**Status:** GO  
**Report:** [`000_REPORTS/PHASE_TASK_GS_10D_OPERATIONAL_FILTER_RUNTIME_FIX_REPORT.md`](../000_REPORTS/PHASE_TASK_GS_10D_OPERATIONAL_FILTER_RUNTIME_FIX_REPORT.md)

---

## What was fixed

- Single filter runtime utility (`taskFilterRuntime.ts`)
- Tab filters now change **actual queue rows** with correct semantics
- Group mode (Cognition / Trạng thái) changes visible grouping
- Quick focus chips filter via rhythm + coordination pipeline
- Focus toggle **filters passive tasks** (not just CSS)
- Visible feedback on every control change
- Per-filter empty states
- Selected task cleared when filtered out of view
- Env-gated filter debug logging
- 13-check validation suite

---

## How filters now work

```
Click tab/chip/toggle
  → state updates (URL or local)
  → deriveVisibleTaskRuntime()
  → queue + count + feedback update
```

| Control | State | URL |
|---------|-------|-----|
| Tabs (mine/pending/overdue/approval) | `?filter=` | Yes |
| Group mode | `?group=cognition\|status` | Yes |
| Quick focus | `quickFocus` local + working context | No |
| Focus toggle | `focusQueueMode` local + working context | No |

---

## How to test each tab

```powershell
cd apps/workboard
npm run dev
```

1. **Việc của tôi** — only operator-owned/reported tasks; amber note if operator unknown  
2. **Chờ xử lý** — NEW/ASSIGNED/IN_PROGRESS/WAITING (no WAITING_APPROVAL)  
3. **Quá hạn** — overdue signals; compare with footer overdue count (without quick focus)  
4. **Chờ duyệt** — WAITING_APPROVAL only  
5. **Cognition** vs **Trạng thái** — group headers change  
6. **Quick focus chip** — further narrows within tab; toggle off returns to `all`  
7. **Focus ◎** — fewer rows (ACTION_NOW + HIGH_ATTENTION only) + feedback message  
8. Select task → switch tab that excludes it → panel closes + message  

Debug:

```powershell
$env:VITE_CBV_FILTER_DEBUG="true"
npm run dev
```

---

## Remaining TODOs

- Sync quick focus / focus mode to URL (optional, not required this phase)  
- Show tab badge counts from `deriveTaskCounts` (future enhancement)  
- DetailProvider isolation (GS_10E) — filter changes still re-render full page via context  

---

## Do not regress

- Do not restore silent show-all for “Việc của tôi”  
- Do not re-merge WAITING into approval tab  
- Do not remove filter feedback strip  
- Keep `deriveVisibleTaskRuntime` as single derivation entry point  

---

## Next phase

**PHASE_TASK_GS_10E_DETAIL_PROVIDER_ISOLATION** — highest leverage perf + stability after filter trust restored.
