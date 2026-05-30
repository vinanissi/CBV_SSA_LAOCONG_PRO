# PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT — Report

**Phase:** PHASE_WORK_INBOX_NETWORK_HYGIENE_AUDIT  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-30  
**Commit (base, uncommitted):** `a3e088b42f5c1141b3a220132377b308b8c5b01c`

---

## 1. Summary

Audited Work Inbox V3 FE network paths and implemented unified trace, in-flight dedupe, short TTL result caches, stale-request abort/generation guards, and selective refresh (no full workspace snapshot after inline/focus actions). Tab switches remain bundle-only (no API). Static runtime endpoints deduped per session TTL.

**Live session request-count benchmark not re-run in this phase** — structural reductions expected from dedupe/TTL and removal of post-action snapshot reloads.

---

## 2. Files changed

| Layer | File |
|-------|------|
| FE (new) | `network/workInboxNetworkCacheConfig.ts` |
| FE (new) | `network/workInboxNetworkTrace.ts` |
| FE (new) | `network/workInboxTaskDetailLoader.ts` |
| FE (new) | `network/workInboxWorkspaceSnapshotLoader.ts` |
| FE (new) | `network/workInboxStaticRuntimeCache.ts` |
| FE (new) | `network/workInboxNetworkInvalidation.ts` |
| FE (new) | `network/workInboxNetworkHygieneAuditChecks.ts` |
| FE | `operationalRuntime/workInboxOperationalBundleLoader.ts` — TTL + network trace |
| FE | `operationalRuntime/useWorkInboxOperationalBundle.ts` — cache invalidation on action refresh |
| FE | `TasksPage.tsx` — loaders, no snapshot after actions, selective registerTaskChanged |
| FE | `TaskWriteContext.tsx` — snapshot vs patch modes + static write-capability cache |
| FE | `TaskCreateForm.tsx` / `TaskUpdateForm.tsx` — onTaskChanged mode |
| FE | `runtime/useModuleRegistry.ts` — cached modules/status |
| FE | `components/runtime/RuntimeStatusBar.tsx` — cached modules status |

---

## 3. Network baseline (pre-fix, from profiling sessions)

| Signal | Value |
|--------|-------|
| Session requests | ~245 / 31.5s |
| record-action | ~4.4s (post-P1) |
| operational bundle | ~4.2s |
| task detail (peak) | ~6s |

---

## 4. Request groups identified

| Group | Sources |
|-------|---------|
| `initial_load` | `TasksPage.loadWorkspace` on mount |
| `task_open` | Route effect, card open, search open |
| `next_previous` | Focus navigation → `onOpenItem` |
| `action` | record-action → deferred operational refresh |
| `search_open` | Search overlay → `onOpenTask` (no snapshot) |
| `tab_switch` | RightContextTabs — **local only** |
| `refresh` | Manual workspace refresh, task create |
| `static_runtime` | modules, status, write-capability |

---

## 5. Duplicate request findings

| Finding | Root cause | Fix |
|---------|------------|-----|
| Duplicate task detail | Route effect + openTask both fetch | In-flight dedupe + generation guard |
| Duplicate operational bundle | Multiple hooks/effects | Existing in-flight dedupe + TTL result cache |
| Snapshot after every action | `onRefresh` / `registerTaskChanged` / inline handlers | BUNDLE_ONLY policy; snapshot only on create (`mode: snapshot`) |
| Repeated `/modules/status` | RuntimeStatusBar + useModuleRegistry | Session TTL static cache |
| Repeated write-capability | TaskWriteProvider mount | Session TTL static cache |

---

## 6. Cache/dedupe implemented

| Resource | In-flight dedupe | TTL | Abort stale |
|----------|------------------|-----|-------------|
| Task detail | by taskId | 25s | yes |
| Operational bundle | by taskId | 15s | yes (hook generation) |
| Workspace snapshot | by filter key | 20s | n/a |
| modules / status / write-capability | single in-flight | 90s | n/a |

Trace envelope: `{ traceId, route, taskId, caller, reason, dedupeKey, cacheHit, aborted, staleIgnored, requestGroup, ... }`

---

## 7. Before/after request count (estimated)

| Flow | Before (typical) | After (expected) |
|------|------------------|------------------|
| Open task (route + card) | 2 detail | 1 detail (deduped) |
| Tab switch Chi tiết/Timeline/… | 0–1 (if miswired) | 0 |
| Pause/Complete action | 1 action + 1 snapshot + 1–2 bundle | 1 action + 0–1 deferred bundle |
| Session static runtime | 2–4 per mount | 1 each per TTL window |

**Live recount pending.**

---

## 8. Before/after route timing

GAS latency unchanged (not in scope). FE chatter reduction should lower perceived wait via fewer parallel cold requests. No timing regression expected from cache hits within TTL.

---

## 9. Remaining risks

- Live benchmark not executed — verify request count in pilot DevTools
- Task create still forces snapshot refresh (required for new row visibility)
- TTL stale window (15–25s) — manual refresh available
- OPTIONS preflight not eliminated (browser/CORS; out of FE scope)

---

## 10. Pilot recommendation

**GO_WITH_WARNINGS** — proceed to pilot with DevTools network trace enabled; confirm stable open ≤2 requests (detail + operational), tab switch 0, action without snapshot reload.

---

## 11. Commit hash

Base: `a3e088b42f5c1141b3a220132377b308b8c5b01c` (changes uncommitted at report time)
