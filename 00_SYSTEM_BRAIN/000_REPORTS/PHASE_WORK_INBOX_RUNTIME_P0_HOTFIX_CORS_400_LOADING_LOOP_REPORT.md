# PHASE_WORK_INBOX_RUNTIME_P0_HOTFIX_CORS_400_LOADING_LOOP — Report

**Verdict:** GO  
**Date:** 2026-05-30  
**Base commit:** `a3e088b42f5c1141b3a220132377b308b8c5b01c` (hotfix changes uncommitted at report time)

---

## 1. Root cause

| Symptom | Root cause |
|---------|------------|
| CORS preflight blocked on `record-action` | `workers/api/src/cors.ts` `Access-Control-Allow-Headers` omitted `X-CBV-Trace-Id` after P0 FE started sending trace header on every mutation |
| `400` on `/api/tasks/:id` and operational bundle | FE paths used raw `taskId` without `encodeURIComponent`; Worker had no safe decode/validate — malformed or encoded IDs failed silently as generic 400 |
| Right panel stuck on “Đang tải chi tiết…” | `detailLoading={Boolean(taskId && !detail)}` never cleared when `getTaskDetail` failed without cache; operational hook did not always surface errors |
| `Maximum update depth exceeded` @ `TaskWriteContext.tsx:43` | `registerTaskChanged` called `setChangedHandler(() => fn)` every render → `TasksPage` effect re-subscribed infinitely |

---

## 2. Files changed

### Worker
- `workers/api/src/cors.ts` — trace headers in Allow/Expose; full method list
- `workers/api/src/utils/routeParams.ts` — **new** `decodeRouteTaskId`, `validateTaskId`, `logRouteValidationError`
- `workers/api/src/router.ts` — `parseRouteTaskId` on task + work-inbox task routes

### Frontend
- `apps/workboard/src/api/client.ts` — `encodeTaskId()` on task API paths
- `apps/workboard/src/modules/task/TaskWriteContext.tsx` — ref handler, `useMemo` value
- `apps/workboard/src/modules/task/TasksPage.tsx` — `detailFetching` / `detailError` / `onRetryDetail` / `.finally`
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalApi.ts` — JSON envelope on HTTP error
- `apps/workboard/src/modules/task/inbox/operationalRuntime/useWorkInboxOperationalBundle.ts` — try/finally, degraded timeout
- `apps/workboard/src/modules/task/inbox/operationalRuntime/workInboxOperationalEmpty.ts` — empty bundle helper
- `apps/workboard/src/modules/task/inbox/focusRuntime/RightContextTabs.tsx` — error, retry, empty operational copy
- `apps/workboard/src/modules/task/inbox/focusRuntime/WorkInboxFocusRuntime.tsx` — prop wiring
- `apps/workboard/src/modules/task/inbox/actionRuntime/WorkInboxFocusActionHost.tsx` — operational error props
- `apps/workboard/src/modules/task/inbox/WorkInboxGroupsPanel.tsx` — detail error + retry
- `apps/workboard/src/modules/task/inbox/performance/workInboxP0HotfixCors400LoadingLoopChecks.ts` — **new** static suite

---

## 3. CORS fix status

**DONE.** `Access-Control-Allow-Headers` includes `Content-Type`, `Authorization`, `X-CBV-Trace-Id`, `x-cbv-trace-id`. Router returns `204` for all `OPTIONS` via `handleOptions` (covers `/api/work-inbox/record-action` and task routes).

---

## 4. 400 API fix status

**DONE.** FE uses `encodeURIComponent` on path segments; Worker decodes + validates `^[A-Za-z0-9_\-]+$` (accepts `TK_20260408_82436267`, `TK_20260415_244F3888`). Invalid IDs log structured JSON (`traceId`, `route`, `taskId`, `encodedTaskId`, `actor`, `validationError`) and return `badRequest` envelope.

---

## 5. Loading lifecycle fix status

**DONE.** Detail load uses `detailFetching` + `detailError` + `onRetryDetail(force)`. Operational bundle uses `finally` + empty bundle on failure + 10s `degraded` flag. Right panel shows errors, retry, “Chưa có dữ liệu vận hành”, and degraded notice — not infinite “Đang tải chi tiết…”.

---

## 6. React infinite loop fix status

**DONE.** `changedHandlerRef` + stable `registerTaskChanged` / `useMemo` context value. No `setChangedHandler` in render path.

---

## 7. Test results

| Suite | Result |
|-------|--------|
| `runWorkInboxP0HotfixCors400LoadingLoopChecks()` | **16/16 PASS** (GO) |
| `npm run build` (workboard) | **PASS** |
| `npm run typecheck` (workers/api) | **FAIL** — pre-existing P0 trace typing issues in `workInboxPerformanceTrace.ts`, `workInboxCombinedAction.ts`, `router.ts` (not introduced by hotfix) |

---

## 8. Manual browser verification checklist

- [ ] DevTools Network: `OPTIONS /api/work-inbox/record-action` → 204 with `Access-Control-Allow-Headers` containing `X-CBV-Trace-Id`
- [ ] `POST /api/work-inbox/record-action` succeeds (no CORS error); response/header includes trace id
- [ ] Open task `TK_20260408_82436267` (or live Sheet id): `GET /api/tasks/{id}` → 200 envelope
- [ ] Same id: `GET /api/work-inbox/tasks/{id}/operational` → 200 or clear JSON error (not opaque 400)
- [ ] Right panel: loading clears; failed load shows message + “Thử lại”
- [ ] Empty operational data shows “Chưa có dữ liệu vận hành”
- [ ] Console: no `Maximum update depth exceeded` when navigating focus prev/next
- [ ] Start/Pause still uses P0 combined action (no regression)

---

## 9. Remaining risks

- Worker `typecheck` debt from P0 performance trace modules should be cleaned in a follow-up pass.
- Operational bundle may still return empty data when GAS offline — UI now degrades gracefully but operator sees reduced context.
- `onRetryDetail` and `onRetryOperational` are separate; detail retry does not refresh operational bundle unless task id changes.

---

## RCLA

`WorkInboxRuntimeContextProvider` unchanged; no ad-hoc context bypass. Trace propagation via `workInboxCombinedActionClient` + `workInboxOperationalApi` headers.
