# PHASE_WORK_INBOX_OPERATIONAL_FETCH_LOOP_HOTFIX — Report

**Verdict:** GO  
**Date:** 2026-05-30

---

## 1. Root cause

| Layer | Cause |
|-------|--------|
| **Fetch loop** | `useWorkInboxOperationalBundle` re-ran on every parent re-render path: `taskId` briefly `undefined` when `loadWorkspace` rebuilt `focusItems`, plus `setBundle(null)` before each load and no “already loaded” guard → repeated `/operational` calls (24+). |
| **Race / flicker** | No `AbortController` or generation guard → slow responses (12–20s) applied out of order → timeline content changed between refreshes. |
| **Context churn** | `refreshOperational` and full `ctx` in `useWorkInboxActionRuntime` deps changed every bundle/loading update → unnecessary child invalidation (amplified loop risk). |
| **React depth** | `TaskWriteContext` previously used `setState` in `registerTaskChanged` (fixed earlier); hardened with capability `setState` guard. |

Tab switches (`RightContextTabs`) did **not** call fetch — loop was not from tab UI.

---

## 2. Files changed

| File | Change |
|------|--------|
| `workInboxOperationalBundleLoader.ts` | **NEW** — `loadOperationalBundle`, in-flight dedupe |
| `workInboxOperationalBundleTrace.ts` | **NEW** — trace: taskId, requestId, caller, reason, timestamps |
| `useWorkInboxOperationalBundle.ts` | Abort + generation, single fetch per task, manual/action refresh only |
| `workInboxOperationalApi.ts` | `AbortSignal` on `getTaskOperational` |
| `WorkInboxFocusActionHost.tsx` | `stableTaskId` + `selectedTaskId`, stable refresh callbacks |
| `WorkInboxGroupsPanel.tsx` | Pass `selectedTaskId` to host |
| `useWorkInboxActionRuntime.ts` | `refreshOpRef` — stable operational refresh |
| `TaskWriteContext.tsx` | Capability update guard |
| `workInboxOperationalFetchLoopHotfixChecks.ts` | **NEW** — 16 static checks |

---

## 3. Before / after request count

| Scenario | Before (observed) | After (expected) |
|----------|-------------------|------------------|
| Open single task (idle) | 24+ `/operational` | **1** (Strict Mode dev: ≤2 with dedupe) |
| After operator action | +1 per action | **+1** (`ACTION_REFRESH` only) |
| Tab switch (Chi tiết / Timeline / …) | N/A (no extra from tabs) | **0** additional |
| Manual retry | Unbounded overlap | **1** (aborts stale, dedupes in-flight) |

---

## 4. Test results

`runWorkInboxOperationalFetchLoopHotfixChecks()` — **16/16 GO**  
`npm run build` (workboard) — **PASS**

---

## 5. Manual verification

1. Restart `npm run dev`, hard refresh.
2. Network: filter `operational` — open one task → **≤2** requests, then stop.
3. Switch tabs — **no new** `operational` requests.
4. Click **Thử lại** — exactly **one** new request.
5. Start/Pause task — at most **one** extra `operational` after action.
6. Console: no `Maximum update depth exceeded`.
7. DevTools: `[CBV OpBundle]` logs show `reason`, `caller`, `requestId`.

---

## 6. Remaining risks

- Slow GAS responses still possible; UI keeps last good bundle until latest request completes.
- `loadWorkspace` soft refresh still rebuilds lists (by design); sticky `selectedTaskId` reduces taskId flicker but does not remove snapshot refresh.
