# PHASE_WORK_INBOX_RUNTIME_STABILIZATION — Report

**Phase:** PHASE_WORK_INBOX_RUNTIME_STABILIZATION  
**Verdict:** GO_FOR_PILOT (GO_WITH_WARNINGS if real Sheet latency persists)  
**Date:** 2026-05-31  
**Scope:** Runtime health UX, timeline/handoff display, pilot verification — no new modules

---

## 1. Summary

Stabilized Work Inbox V3 for 14-day pilot by fixing **false TASK_MAIN Degraded** when Worker/GAS return slow but successful data, improving **operator-facing status labels**, expanding **timeline event mapping**, and enriching the **Handoff** tab. Checklist/attachments runtimes unchanged (no snapshot reload). Build + static checks pass.

---

## 2. Root cause — TASK_MAIN Degraded (false positive)

| Source | Condition (before) | Issue |
|--------|-------------------|--------|
| `TasksPage.tsx` `degraded` useMemo | `warnings` contains **"chậm"** | Slow-sync warning `"Đang đồng bộ TASK_MAIN — phản hồi chậm"` triggered degraded even on **successful** fetch |
| `TasksPage.tsx` | `workerLatencyMs >= 2000` && `!cacheHit` | Live slow response treated same as stale failure |
| `runtimeTelemetry.ts` `getCompactConnectionLabel` | `isRuntimeSlow(runtime)` alone | Status bar showed **TASK_MAIN Degraded** while connected |
| `TaskRuntimeBar.tsx` | `degraded \|\| slow` | Same conflation in legacy panel |

**Not the cause when Worker/GAS OK:** `modules.ts` `handleModulesStatus` only sets TASK module degraded when `GAS_TASK_API_URL` missing (config), not on latency.

**True degraded (unchanged):** warnings `gần nhất`, `quá tải`, `Không kết nối — đang hiển thị bản gần nhất`, fetch error with stale snapshot kept.

---

## 3. Files changed

| File | Change |
|------|--------|
| `shared/utils/taskMainRuntimeHealth.ts` | **New** — health states: connected / slow_live / stale_cache / disconnected |
| `shared/utils/runtimeTelemetry.ts` | Operator labels via health eval |
| `modules/task/TasksPage.tsx` | `evaluateTaskMainRuntimeHealth`; slow warning text without false degraded |
| `components/runtime/RuntimeTelemetryInline.tsx` | Footer label + hint |
| `components/ui/TaskRuntimeBar.tsx` | Health-based status (slow ≠ degraded) |
| `focusRuntime/focusLayoutShared.ts` | Timeline transitions, actors, `buildFocusHandoffView` |
| `focusRuntime/RightContextTabs.tsx` | Friendly timeline rows; handoff meta |
| `operationalRuntime/useWorkInboxOperationalBundle.ts` | `setDegraded(false)` on successful bundle load |
| `styles/index.css` | Timeline/handoff meta styles |
| `focusRuntime/workInboxRuntimeStabilizationChecks.ts` | **New** — static suite |

**Unchanged:** GAS/Worker API, checklist/attachments modules, DB schema.

---

## 4. Runtime health — before / after

| Scenario | Before (label) | After (label) | `degraded` flag |
|----------|----------------|---------------|-----------------|
| Connected, latency 3s, fresh data | TASK_MAIN Degraded | TASK_MAIN Connected (+ hint phản hồi chậm) | false |
| Stale cache / fetch fallback | TASK_MAIN Degraded | Dữ liệu đang dùng bản lưu tạm | true |
| Disconnected | Disconnected | Chưa kết nối TASK_MAIN | true |
| GAS URL missing (modules status) | Degraded | (Worker modules API — config) | true |

`staleMessage` (footer): e.g. *Google Sheet phản hồi chậm — đang hiển thị bản lưu tạm.*

Debug: `health.debugLabel` retains `TASK_MAIN Connected (slow)` / `TASK_MAIN Degraded (stale cache)` for console drawer.

---

## 5. Timeline mapping added

- Status transitions: `NEW -> IN_PROGRESS`, `IN_PROGRESS -> PAUSED`, `PAUSED -> IN_PROGRESS`, `IN_PROGRESS -> COMPLETED`
- Events: `HANDOFF_CREATED`, `HANDOFF_ACCEPTED`, `CHECKLIST_ITEM_REOPENED`, resume/complete variants
- Strip `system:` prefix; map `admin@...` actor to short name; hide `system` actor line
- Fallback: prettified raw text (no UI crash)

---

## 6. Handoff behavior

- Empty: *Chưa có bàn giao cho việc này.* + *Xem chi tiết →*
- With data: Người giao, Người nhận, Thời điểm, Trạng thái, nội dung gần nhất
- Action bar **Chuyển giao** unchanged (GAS `HANDOFF_TASK`)

---

## 7. Tests performed

| Test | Result |
|------|--------|
| `runWorkInboxRuntimeStabilizationChecks()` | **13/13 PASS** |
| `npm run build` | **PASS** |
| Live pilot flows | Pending operator |

---

## 8. Network verification (static)

- Checklist/attachments hooks: no `getTaskWorkspaceSnapshot` / `script.google.com`
- Operational bundle: single load per task select; action refresh explicit only
- No new API routes

---

## 9. Known limitations

- Real Google Sheet latency >2s still shows **warning hint** (not degraded) — acceptable for pilot
- Operational bundle timeout (10s) may briefly show degraded until load completes
- Handoff “Xem chi tiết” opens guidance toast (no separate handoff page yet)
- Legacy `FocusPreviewCards` timeline format unchanged (not mounted in main focus)

---

## 10. Risks

- Low: display-only timeline mapping may miss rare `eventType` — falls back to raw text
- If operators rely on old “Degraded” string in training docs, update SOP

---

## 11. Pilot readiness verdict

**GO_FOR_PILOT** — false degraded fixed; operator UX improved; core runtimes intact.

**GO_WITH_WARNINGS_FOR_PILOT** if production Sheet consistently >10s: expect *Dữ liệu đang dùng bản lưu tạm* during peak — document as operational condition, not app bug.

---

## 12. Next recommended phase

- Live 14-day pilot metrics: snapshot latency P95, degraded flag rate, operator tickets
- Optional: persist handoff detail sheet read-only view (no new backend)
