# PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK — Report

**Date:** 2026-05-28  
**Phase:** `PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK`  
**Status:** AUDIT COMPLETE — no code fixes applied  
**Standard:** CBV Operational Ecosystem Standard V1 · Runtime-first · Operational-first · Manual-first  
**Build:** `npm run build` (apps/workboard) — **PASS** (~7.2s, tsc + vite)  
**Tests:** `npm test` — **N/A** (no script in package.json)

---

## 1. Executive summary

Audit-first pass over Workboard task runtime mapped **78 UI commands/search touchpoints** across header search, footer actions, alert strip, control surface, task rows, right panel, sidebar, telemetry footer, and create/auth flows.

**Headline findings:**

| Category | Count |
|----------|-------|
| Working with adequate feedback | 42 |
| Gaps (WARNING) | 18 |
| Broken behavior | 1 |
| No-op / partial no-op | 6 |
| Needs user feedback on actions | 10 |

**Critical path for operators:** Search works end-to-end (header → `/search?q=` → API) but lacks error UI and header/query sync. Task execution buttons (▶/✓/inline) call real APIs but **fail silently** on error. Alert header can show false "all clear" when summary APIs fail. File list buttons in detail panel are decorative no-ops.

No layout changes, no fake handlers, no destructive edits were made in this phase.

Full row-level inventory: [`003_AUDIT/TASK_COMMAND_SEARCH_FEEDBACK_INVENTORY.md`](../003_AUDIT/TASK_COMMAND_SEARCH_FEEDBACK_INVENTORY.md)

---

## 2. Search audit

### 2.1 Top header search (`TopBar.tsx`)

| Check | Result |
|-------|--------|
| Typing updates query | ✅ Local `useState` |
| Enter triggers search | ✅ `form onSubmit` → navigate |
| Empty query | ⚠️ Silent no-op (no message) |
| Debounce | ❌ Not implemented (submit-only model) |
| Clear search | ⚠️ Browser-native only; no explicit control; TopBar state not cleared on navigate back |
| Loading state | ❌ N/A at header (delegated to SearchPage) |
| Error state | ❌ Not at header |
| Keyboard Enter | ✅ Via form submit |
| Search by tên/SĐT/biển số/mã | ⚠️ Placeholder promises all fields; mock search supports HoSo phone/plate; task search title/id only |
| URL sync | ⚠️ TopBar input **not** initialized from `?q=` when on SearchPage |

### 2.2 Search results page (`SearchPage.tsx`)

| Check | Result |
|-------|--------|
| Reads `?q` | ✅ |
| Loading | ✅ `LoadingState` |
| Empty results | ✅ `EMPTY_COPY.search` |
| Empty query | ✅ Hint: "Nhập từ khóa ở thanh trên" |
| Error on API fail | ❌ **Missing** — `if (res.ok)` only; failures show empty/no loading |
| Result links | ✅ `Link` to task/finance/hoso hrefs |

### 2.3 Backend

| Layer | Behavior |
|-------|----------|
| `api.search()` | Worker `GET /api/search?q=` with mock fallback |
| `mockApi.search()` | TASK + FINANCE + HO_SO; phone/plate/name matching on HoSo |
| `getTaskWorkspaceSnapshot({ q })` | Supported in client but **unused** by TasksPage |

### 2.4 HoSo module

No dedicated search UI on `HoSoPage.tsx` — list-only.

---

## 3. Button / action audit

### 3.1 Footer quick bar (`RuntimeStatusBar.tsx`)

| Button | Handler | Status |
|--------|---------|--------|
| + Việc | `openCreate()` | ✅ Real |
| + Hồ sơ | `navigate('/hoso')` | ✅ Real |
| Tải lên | `disabled` + EXECUTION_LOCKED | ✅ Visible "Sắp mở" |
| Tìm kiếm | `navigate('/search')` | ⚠️ Opens page without query |
| SLA | `navigate('/observation')` | ⚠️ Label ≠ destination semantics |
| Console | Toggle drawer | ✅ Real |

Legacy `QuickActionBar.tsx` duplicates footer actions but is **not mounted** in `AppShell`.

### 3.2 Alert header

| Element | Handler | Status |
|---------|---------|--------|
| Summary strip | Expand/collapse detail | ✅ |
| Chi tiết | Same toggle | ✅ (not navigation) |
| Risk items | `navigate(href)` | ✅ |
| + Tạo việc | `openCreate()` | ✅ |
| API failure | Falls through to zero counts | ❌ **BROKEN** — false all-clear |

### 3.3 Task control surface

All four filter tabs, group selector, quick-focus chips, and Focus queue toggle have real handlers and visible active states (`aria-selected` / `.active` / `aria-pressed`).

### 3.4 Task row

| Action | API | Feedback |
|--------|-----|----------|
| Open / → | Navigate + detail load | ✅ Focus + panel skeleton |
| ▶ Accept | `updateTaskStatus IN_PROGRESS` | ⚠️ No loading/error |
| ✓ Complete | `completeTask` | ⚠️ No loading/error |
| Inline quick actions | `useInlineExecution` | ⚠️ Micro/handoff strips; silent API fail |
| onHoSo | `navigate('/hoso')` | ✅ (generic, not task-linked) |

### 3.5 Right panel

| Action | Status |
|--------|--------|
| Accept / Complete / Cập nhật | Real; update form has feedback |
| Gọi / Follow-up | **Partial no-op** — `markActionStarted` local only |
| File buttons | **No-op** — no handler |
| Timeline expand | ✅ |

### 3.6 Navigation

| Element | Status |
|---------|--------|
| Sidebar module launchpad | ✅ NavLink + `openModule` |
| Bàn điều phối | ✅ |
| Đăng xuất | ✅ (no loading indicator) |
| "Việc vận hành" | Page title + sidebar module, not top link |
| "Tôi" | Not a nav item — display name shown |

---

## 4. User feedback audit

### 4.1 Consistency matrix

| Pattern | Used where | Gaps |
|---------|------------|------|
| Inline error text | Login, Create, Update forms | Task row actions, SearchPage, inline execution |
| Inline success text | Create, Update | Task accept/complete |
| Loading skeleton | TasksPage initial, detail panel, SearchPage | Row action buttons |
| Empty state copy | Tasks filter, Search, Detail placeholder | — |
| Disabled + label | Upload locked, FocusStrip zero-count, passive alerts | FileList should be disabled |
| Toast | **Not used anywhere** | No global toast system |
| Degraded/stale banner | TasksPage warnings, telemetry | — |

### 4.2 Click feedback

- **Tabs/filters/chips:** Immediate visual active state ✅  
- **Task select:** Focus ring + panel update ✅  
- **API mutations on row:** No pending/disabled during request ⚠️  
- **No-op clicks:** FileList files, empty search submit — no message ❌  

### 4.3 Selected / active states

Generally strong on control surface and sidebar NavLink. Quick focus chips lack `aria-pressed`.

---

## 5. Broken / no-op list

| ID | Element | Issue | Risk |
|----|---------|-------|------|
| B1 | Alert header API fail | Shows "✓ Không có vấn đề" when `getTodaySummary`/`getCoordination` fail | BROKEN |
| N1 | `FileList` buttons | Render as buttons with no `onClick` | NO_OP |
| N2 | Panel "Gọi"/"Follow-up" | `markActionStarted` only — no backend write | NO_OP (partial) |
| N3 | TasksPage workspace `q` search | API param exists, UI not wired | NO_OP |
| N4 | HoSo page search | Not implemented | NO_OP |
| N5 | Drawer SLA section | TODO placeholder | NO_OP (documented) |
| N6 | Drawer Memory section | TODO placeholder | NO_OP (documented) |

---

## 6. Missing loading / error / empty states

| Location | Missing |
|----------|---------|
| `SearchPage.tsx` | Error state when `!res.ok` or network catch |
| `TasksPage` handleAccept/Complete | Loading disable + error message |
| `useInlineExecution.ts` | Error propagation to UI |
| `OperationalAlertHeader.tsx` | Error/degraded when summary fetch fails |
| `TopBar.tsx` | Empty submit feedback; logout loading |
| Task row inline actions | Pending indicator during API (only dot for unfinished local state) |

Empty states present and adequate: task filter empty, search no results, detail panel placeholder, file list "Chưa có tệp".

---

## 7. Accessibility issues

| Issue | Location | Severity |
|-------|----------|----------|
| Search input missing `aria-label` | `TopBar.tsx` | Medium |
| Quick focus chips missing `aria-pressed` | `QuickFocusFilters.tsx` | Low |
| Misleading shortcut hint "R refresh" vs R=resume | `RuntimeStatusBar.tsx` | Medium |
| File buttons look actionable but inert | `FileList.tsx` | Medium |
| Task card compact mode: article `role="button"` but primary click on inner button | `TaskCard.tsx` | Low |
| SearchPage title uses `text-white` on operational light theme | `SearchPage.tsx` | Low (visual) |

Positive: alert strip `aria-expanded`, filter tabs `role="tablist"`, footer `aria-label`, theme toggle `aria-label`, drawer backdrop label.

---

## 8. Safe-action issues

| Action | Mutates data | Confirm | Notes |
|--------|--------------|---------|-------|
| ✓ Complete (row/panel) | Yes — DONE | No | Manual-first acceptable; needs feedback not confirm |
| Handoff inline | Yes — status + note | No | Operator intent explicit via chip |
| Accept | Yes — IN_PROGRESS | No | OK |
| Create task | Yes | No | Form submit is implicit confirm |
| Upload | N/A | — | Correctly locked |

No destructive delete actions found in task runtime UI.

**Fallback when worker unavailable:** Task workspace uses mock or stale snapshot with warnings; search falls back to mock; auth requires worker when `VITE_CBV_API_BASE_URL` set.

---

## 9. Recommended fix phases

See handoff: [`001_HANDOFF/PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_HANDOFF.md`](../001_HANDOFF/PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK_HANDOFF.md)

Priority order:

1. **SEARCH_FEEDBACK_FIX** — SearchPage errors, header/query sync, empty submit hint  
2. **COMMAND_HANDLER_FIX** — Alert API fail, FileList no-op, panel call/follow semantics  
3. **RUNTIME_TOAST_INLINE_FEEDBACK_FIX** — Accept/complete/inline execution feedback  
4. **DISABLED_STATE_FIX** — FileList, misleading SLA nav, shortcut copy  
5. **ACCESSIBILITY_FIX** — aria labels, aria-pressed, theme-safe SearchPage  

---

## 10. Build / test result

| Command | CWD | Result | Notes |
|---------|-----|--------|-------|
| `npm run build` | `apps/workboard` | **PASS** | tsc --noEmit + vite build, 146 modules, ~7.18s |
| `npm test` | — | **N/A** | Not defined in package.json |
| Validation suites | browser manual | Available | `taskRuntimeFooterConsoleChecks`, `taskOperationalAlertHeaderChecks`, 20+ GS check files — **not run in CI**; no search/feedback-specific suite |

---

## Audit questions summary (14-point checklist)

Applied per inventory row. Highlights:

- **Real handlers:** Majority yes; exceptions listed in §5  
- **No-op:** 6 documented  
- **Disabled clarity:** Upload, zero-count focus chips, passive alerts — good  
- **Loading/pending:** Forms good; row actions weak  
- **Success feedback:** Forms only  
- **Error feedback:** Forms + workspace hard fail; search + row actions weak  
- **Empty states:** Good on main lists  
- **Selected/active:** Good on filters  
- **Keyboard:** J/K/Enter/ESC on tasks; search Enter works  
- **aria/title:** Partial — gaps in §7  
- **Test coverage:** Static check files only; no automated search/command tests  
- **Runtime logging:** `logModuleOpen`, execution log append, operator observation utils — not user-visible  
- **Data mutation confirm:** None required by current manual-first policy  
- **Backend fallback:** Mock + stale snapshot patterns present  

---

**Next step:** Execute fix phases from handoff — one phase per PR, no broad layout changes.
