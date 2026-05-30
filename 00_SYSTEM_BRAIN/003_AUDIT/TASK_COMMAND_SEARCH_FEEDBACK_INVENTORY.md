# TASK — Command / Search / User Feedback Inventory

**Phase:** `PHASE_TASK_AUDIT_COMMANDS_SEARCH_USER_FEEDBACK`  
**Date:** 2026-05-28  
**Scope:** `apps/workboard` — Workboard / Task runtime  
**Standard:** CBV Operational Ecosystem Standard V1 · Runtime-first · Audit-only (no fixes applied)

---

## Legend

| Risk | Meaning |
|------|---------|
| OK | Handler wired; feedback adequate for current phase |
| WARNING | Works but feedback, a11y, or semantics gap |
| BROKEN | User-visible failure or silent error path |
| NO_OP | Clickable with no effect (or display-only TODO) |
| NEEDS_CONFIRM | Mutates data without confirm; acceptable only if documented |
| NEEDS_FEEDBACK | Handler runs but user gets no loading/success/error signal |

---

## Search

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Search | Top header search input | `TopBar.tsx` | `onChange` → local `query` | Typing updates local state only; not synced with `/search?q=` | None while typing | WARNING | Sync query from URL on `/search`; optional debounced live navigate in SEARCH_FEEDBACK_FIX |
| Search | Top header search submit | `TopBar.tsx` | `handleSearch` → `onSearchNavigate` | Form submit (Enter); empty trim → no-op | Empty query: silent no-op | WARNING | Show inline hint or disable submit when empty |
| Search | Top header → navigate | `AppShell.tsx` | `navigate(/search?q=…)` | Non-empty query navigates to SearchPage | Route change only | OK | — |
| Search | Search results page | `SearchPage.tsx` | `useEffect` → `api.search(query)` | Reads `?q` from URL; fetches on change | Loading: `LoadingState`; empty results: `EmptyState`; empty query: hint text | OK (partial) | Add error state when `!res.ok` |
| Search | Search API (worker) | `api/client.ts` → `workers/api/modules/search.ts` | `GET /api/search?q=` | Worker + GAS projection fallback; mock when no worker | Envelope errors not surfaced in UI | WARNING | Surface `errors[]` on SearchPage |
| Search | Mock search fields | `mockApi.ts` `search()` | filter TASK/FINANCE/HOSO | Task: title/id; HoSo: name/phone/plate/id; Finance: title/id | Demo warning in envelope | OK | Align worker/GAS search with same field set |
| Search | Task workspace inline search | `TasksPage.tsx` | — | `getTaskWorkspaceSnapshot` supports `q` but **not used** | N/A | NO_OP | Either wire q-param filter or remove from scope docs |
| Search | HoSo page search | `HoSoPage.tsx` | — | List-only; no search box | N/A | NO_OP | Add HoSo search in SEARCH_FEEDBACK_FIX or mark out-of-scope |
| Search | Clear search | `TopBar.tsx` | — | No clear button; browser native clear may work on `type="search"` | Browser-dependent | WARNING | Explicit clear control + reset URL |
| Search | Keyboard Enter | `TopBar.tsx` | `form onSubmit` | Enter triggers search navigate | Works | OK | Add `aria-label` on input |

---

## Footer quick actions (`RuntimeStatusBar`)

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Footer | + Việc | `RuntimeStatusBar.tsx` | `openCreate()` | Opens task create modal | Modal opens | OK | — |
| Footer | + Hồ sơ | `RuntimeStatusBar.tsx` | `navigate('/hoso')` | Route change | Navigation | OK | — |
| Footer | Tải lên | `RuntimeStatusBar.tsx` | disabled | `EXECUTION_LOCKED`; disabled + "· Sắp mở" | Disabled visible | OK | Keep locked until upload flow exists |
| Footer | Tìm kiếm | `RuntimeStatusBar.tsx` | `navigate('/search')` | Opens search page without query | Empty search hint on page | WARNING | Focus header search or pass last query |
| Footer | SLA | `RuntimeStatusBar.tsx` | `navigate('/observation')` | Goes to observation module, not SLA panel | Navigation only | WARNING | Rename label or route to SLA-specific view |
| Footer | Console | `RuntimeStatusBar.tsx` | `openDrawer()` / `closeDrawer()` | Toggles runtime drawer; `aria-expanded` | Toggle label Thu gọn/Console | OK | — |
| Footer | Runtime clock | `RuntimeStatusBar.tsx` | display only | `formatRuntimeSyncLabel` every 30s | `title="Last runtime sync"` | OK | — |
| Footer | Shortcut hint "R refresh" | `RuntimeStatusBar.tsx` | display only | Text says "R refresh" but **R = resume flow** in TasksPage | Misleading | WARNING | Fix copy to "R resume" in ACCESSIBILITY_FIX |

---

## Alert header (`OperationalAlertHeader` / `OperationalAlertStrip`)

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Alert | Summary strip toggle | `OperationalAlertStrip.tsx` | `toggleExpanded` | Expands detail list; `aria-expanded` | Loading: "Đang tải cảnh báo…" | OK | — |
| Alert | Chi tiết link | `OperationalAlertStrip.tsx` | same toggle | Expand/collapse (not navigation) | Label toggles Thu gọn/Chi tiết | OK | — |
| Alert | Risk item click | `OperationalAlertStrip.tsx` | `navigate(item.href)` | overdue→tasks, gplx→hoso, finance→finance | Navigation | OK | — |
| Alert | Passive item (unassigned) | `OperationalAlertStrip.tsx` | `navigate` when count>0 | Disabled when count=0; title explains | Disabled state | OK | — |
| Alert | + Tạo việc | `OperationalAlertHeader.tsx` | `onCreate` → `openCreate` | Opens create modal | Modal | OK | — |
| Alert | Data load failure | `OperationalAlertHeader.tsx` | `Promise.all` | Silent fail → stays loading=false with zero counts | Shows "all clear" incorrectly | BROKEN | Show degraded/error strip on API fail |

---

## Task control surface

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Control | Tab: Việc của tôi | `TaskControlSurface.tsx` | `onFilterChange('mine')` | URL `?filter=mine` | `aria-selected` + `.active` | OK | — |
| Control | Tab: Chờ xử lý | `TaskControlSurface.tsx` | `onFilterChange('pending')` | Client filter | Active tab CSS | OK | — |
| Control | Tab: Quá hạn | `TaskControlSurface.tsx` | `onFilterChange('overdue')` | Client filter | Active tab CSS | OK | — |
| Control | Tab: Chờ duyệt | `TaskControlSurface.tsx` | `onFilterChange('approval')` | Client filter | Active tab CSS | OK | — |
| Control | Group Cognition / Trạng thái | `GroupModeSelect.tsx` | `onChange` → URL `group` | `<select>` with aria-label | Selected value visible | OK | — |
| Control | Quick focus chips | `QuickFocusFilters.tsx` | toggle focus | Toggle on/off; icons + label when active | `.active` class | OK | Add `aria-pressed` |
| Control | ◎ Focus (queue mode) | `TaskControlSurface.tsx` | `onFocusQueueToggle` | Toggles `focusQueueMode` | `aria-pressed` + `.active` | OK | — |
| Control | Resume / recent chips | `TaskControlSurface.tsx` | `onResumeTask` | Opens task detail | Navigation + panel | OK | — |
| Control | Empty filter result | `TasksPage.tsx` | — | `EmptyState` with `EMPTY_COPY.tasks` | Guided empty copy | OK | — |

---

## Task row actions (`TaskCard`)

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Task row | Row click / → open | `TaskCard.tsx` | `onOpen` | Navigate + detail panel | Focus ring / `.task-card-focused` | OK | — |
| Task row | ▶ Accept | `TaskCard.tsx` | `onAccept` → `api.updateTaskStatus` | Only when nextAction=ACCEPT | `title` only; **no loading/error** | NEEDS_FEEDBACK | Pending spinner + error toast in RUNTIME_TOAST_INLINE_FEEDBACK_FIX |
| Task row | ✓ Complete | `TaskCard.tsx` | `onComplete` → `api.completeTask` | Shown when not DONE and not ACCEPT | Silent API failure | NEEDS_FEEDBACK | Same as accept |
| Task row | Inline quick actions | `InlineQuickActions.tsx` | `onQuickAction` | Shown on hover/focus | Opens micro/handoff strips | OK | Add pending state on API actions |
| Task row | Micro update strip | `MicroUpdateStrip.tsx` | `onSelect` / dismiss | Inline chips | Visual strip | NEEDS_FEEDBACK | No loading on submit |
| Task row | Handoff strip | `InlineHandoffStrip.tsx` | `onSelect` / dismiss | Updates status via API | Silent failure | NEEDS_FEEDBACK | Error feedback |
| Task row | Group collapse | `TaskGroupSection.tsx` | `setCollapsed` | Toggle group | `aria-expanded` | OK | — |
| Task row | Keyboard J/K/Enter | `TasksPage.tsx` | window keydown | Queue navigation | Selected index highlight | OK | Document in help |

---

## Right panel (`OperationalContextPanel` / `DetailPanel`)

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Panel | No selection placeholder | `DetailPanel.tsx` | — | "Chọn việc để xem ngữ cảnh…" | Readable empty | OK | — |
| Panel | ESC close | `DetailPanel.tsx` / `TasksPage.tsx` | `clearDetail` + navigate | Desktop + mobile sheet | Button + keyboard | OK | — |
| Panel | Accept / Hoàn tất | `OperationalContextPanel.tsx` | `onAccept` / `onComplete` | Same as row actions | No loading/error | NEEDS_FEEDBACK | Unified action feedback |
| Panel | Gọi / Follow-up primary | `OperationalContextPanel.tsx` | `markActionStarted` only | **Local state only; no API** | Shows next-step prompt later | NO_OP (partial) | Wire comment/API or label "Bắt đầu (local)" |
| Panel | Cập nhật toggle | `OperationalContextPanel.tsx` | `setShowUpdateForm` | Shows TaskUpdateForm | Toggle label | OK | — |
| Panel | Timeline expand | `OperationalContextPanel.tsx` | `setShowAllTimeline` | Show more items | Button text | OK | — |
| Panel | File list buttons | `FileList.tsx` | **none** | Buttons render but **no onClick** | Hover only | NO_OP | Disable or wire download preview |
| Panel | Detail loading | `OperationalContextPanel.tsx` | — | Skeleton pulse | `aria-busy` | OK | — |
| Panel | Detail error | `OperationalContextPanel.tsx` | — | Amber banner if partial load | Inline message | OK | — |
| Panel | Next step completion | `NextStepCompletionPrompt.tsx` | `onComplete` → comment API | Posts note | No error on fail | NEEDS_FEEDBACK | Show error inline |

---

## Top bar & sidebar navigation

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Top | Bàn điều phối | `TopBar.tsx` | `<Link to="/">` | Home route | Link style | OK | — |
| Top | Module chip | `TopBar.tsx` | display | Current module name | Visual | OK | — |
| Top | Degraded indicator | `TopBar.tsx` | display | When registry degraded | `title` | OK | — |
| Top | Theme toggle | `ThemeToggle.tsx` | `toggleThemeMode` | Light/dark | `aria-label` + title | OK | — |
| Top | User display name | `TopBar.tsx` | display | `title=userId` | Tooltip id | OK | Not "Tôi" nav — display only |
| Top | Role label | `TopBar.tsx` | display | e.g. "Nhân viên" | Text | OK | — |
| Top | Đăng xuất | `TopBar.tsx` | `api.logout` + `onLogout` | Clears session → login | No loading state | WARNING | Brief disabled state during logout |
| Sidebar | Module launchpad links | `Sidebar.tsx` | `NavLink` / `openModule` | Internal routes + external tabs | `.active` on NavLink | OK | — |
| Sidebar | Quá hạn quick link | `Sidebar.tsx` | `NavLink` to overdue filter | Filter preset | Active state | OK | — |
| Focus strip | Attention chips (non-/tasks) | `FocusStrip.tsx` | `navigate` when active | Hidden on `/tasks` | Disabled when count=0 | OK | — |

---

## Runtime telemetry & console drawer

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Telemetry | Connection metric | `RuntimeTelemetryInline.tsx` | `onOpenDrawer()` | Opens console | title + dot animation | OK | TODO comment for dedicated panel |
| Telemetry | Total count | `RuntimeTelemetryInline.tsx` | display | Non-interactive span | Visual | OK | — |
| Telemetry | Overdue filter | `RuntimeTelemetryInline.tsx` | `handleOverdueClick` | Sets filter=overdue on /tasks only | **disabled off /tasks** | OK | title explains |
| Telemetry | Warnings | `RuntimeTelemetryInline.tsx` | `onOpenDrawer({warningFocus})` | Scroll focus warnings | Clickable | OK | — |
| Telemetry | Worker chip | `RuntimeTelemetryInline.tsx` | `onOpenDrawer()` | Opens console | Busy class when refreshing | OK | — |
| Drawer | Backdrop close | `RuntimeFooterDrawer.tsx` | `onClose` | Closes drawer | aria-label | OK | — |
| Drawer | SLA pressure section | `RuntimeFooterDrawer.tsx` | — | **TODO placeholder text** | Visible TODO | NO_OP | Wire SLA feed or mark disabled |
| Drawer | Memory / runtime state | `RuntimeFooterDrawer.tsx` | — | **TODO placeholder** | Visible TODO | NO_OP | Wire memory bridge |

---

## Create / update / auth flows

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Create | Task create modal | `TaskCreateForm.tsx` | `api.createTask` | Permission gates; loading/error/success | Inline messages; auto-close 600ms | OK | — |
| Create | Locked / no permission | `TaskCreateForm.tsx` | — | Static message | Clear copy | OK | — |
| Update | Task update form | `TaskUpdateForm.tsx` | `api.updateTask*` | loading/error/success | Inline | OK | — |
| Auth | Login submit | `LoginPage.tsx` | `api.login` | loading/error/mustChangePassword | Button disabled while loading | OK | — |
| Workspace | Initial load | `TasksPage.tsx` | `loadWorkspace` | Skeleton → list or ErrorState | Retry on hard fail | OK | Soft refresh keeps stale + warnings |

---

## Dead / duplicate code (audit note)

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Footer (legacy) | QuickActionBar | `QuickActionBar.tsx` | same as RuntimeStatusBar | **Not mounted** in AppShell | N/A | WARNING | Remove or document as legacy in cleanup phase |

---

## Test / validation coverage

| Area | UI Element | File | Handler | Current Behavior | Feedback | Risk | Recommendation |
|------|------------|------|---------|------------------|----------|------|----------------|
| Tests | npm test | `package.json` | — | **No test script** | N/A | WARNING | Add audit check suite in fix phase |
| Checks | Footer console | `taskRuntimeFooterConsoleChecks.ts` | static source checks | Manual browser invoke | Partial | OK | Extend for search/feedback |
| Checks | Alert header | `taskOperationalAlertHeaderChecks.ts` | static | Manual browser invoke | Partial | OK | — |
| Checks | Search / command feedback | — | — | **No dedicated suite** | N/A | WARNING | Add `taskCommandSearchFeedbackChecks.ts` |

---

**Inventory total:** 78 rows · **OK:** 42 · **WARNING:** 18 · **BROKEN:** 1 · **NO_OP:** 6 · **NEEDS_FEEDBACK:** 10 · **NEEDS_CONFIRM:** 0 (complete/handoff mutate without confirm — accepted manual-first)
