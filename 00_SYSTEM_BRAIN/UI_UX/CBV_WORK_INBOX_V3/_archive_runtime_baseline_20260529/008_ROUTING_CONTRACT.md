# CBV_WORK_INBOX_V3 — Routing Contract

**Version:** V3.0 · **Date:** 2026-05-29  
**Implementation:** `apps/workboard/src/app/routes.tsx`, `TasksPage.tsx`

---

## 1. Canonical routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/tasks` | `TasksPage` | Work Inbox list |
| `/tasks/:taskId` | `TasksPage` | Inbox with task selected |
| `/search` | `SearchPage` | Global search (no query) |
| `/search?q={query}` | `SearchPage` | Search results |

All Work Inbox routes render inside `AppShell` via `App.tsx` authenticated layout.

---

## 2. Query parameters — Work Inbox

| Param | Values | Default | Sync |
|-------|--------|---------|------|
| `filter` | `mine` \| `pending` \| `overdue` \| `approval` | `mine` | URL ↔ state bidirectional |
| `group` | `cognition` \| `status` | `cognition` | URL ↔ state bidirectional |

**Normalization:** invalid/missing `filter` → `mine`; invalid `group` → `cognition`.  
Implementation: `normalizeTaskFilterKey()`, `parseGroupMode()`.

### Example URLs

```
/tasks
/tasks?filter=overdue
/tasks?filter=pending&group=status
/tasks/TSK_20260529_001
/tasks/TSK_20260529_001?filter=mine&group=cognition
```

---

## 3. Query parameters — Search

| Param | Values | Required |
|-------|--------|----------|
| `q` | string (URL-encoded) | no (empty shows hint) |

TopBar search navigates: `/search?q=${encodeURIComponent(q)}`

---

## 4. Session state (NOT in URL)

| Key | Storage | Purpose |
|-----|---------|---------|
| `cbv_focus_queue_mode` | sessionStorage | Focus queue toggle |
| Working context | localStorage | quickFocus, groupMode backup, focusQueueMode |
| Recent tasks | localStorage | Resume chips |
| Auth session | sessionStorage | `auth/sessionStorage.ts` |

**Contract:** Do not add quickFocus to URL without phase approval (breaks shareable filter links).

---

## 5. Navigation triggers

| Source | Target |
|--------|--------|
| Sidebar module (tasks) | `/tasks` or module `primaryUrl` |
| Sidebar Quá hạn | `/tasks?filter=overdue` |
| FocusStrip overdue | `/tasks?filter=overdue` |
| Task card click | `/tasks/:taskId` + detail panel |
| Search result (TASK) | `result.href` → `/tasks/:id` |
| Browser back/forward | URL drives filter/group/taskId |
| Logout | `/login` (clears session) |

---

## 6. Route params

| Param | Format | Validation |
|-------|--------|------------|
| `:taskId` | TASK_MAIN.ID (e.g. `TSK_*`) | API fetch; missing → error state in detail |

---

## 7. Module runtime routes (adjacent)

| Route | Notes |
|-------|-------|
| `/m/:moduleSlug` | ModuleRuntimeContainer — not inbox |
| `/` | OperationalHome — launchpad |

Work Inbox must not hijack `/m/*` routes.

---

## 8. Legacy / GAS WebApp routes (reference only)

RF02 GAS WebApp used:

```
/workspace/workboard/tasks
/workspace/workboard/task-detail?taskId=
/workboard/* (aliases)
```

Local FE (`apps/workboard`) uses simplified `/tasks` paths.  
**Do not** reintroduce `/workspace/workboard/*` in local FE without migration phase.

---

## 9. Deep link contract

Shareable operator links:

| Intent | URL |
|--------|-----|
| My open tasks | `/tasks?filter=mine` |
| Overdue queue | `/tasks?filter=overdue` |
| Specific task | `/tasks/{taskId}` |
| Pending by status group | `/tasks?filter=pending&group=status` |

AppSheet → WebApp handoff (future): append `?from=appsheet` as optional telemetry only — no behavior change in V3.

---

## 10. Route guards

| Guard | Behavior |
|-------|----------|
| Unauthenticated | Redirect to login |
| VIEW_ONLY | Route allowed; write actions stripped |
| Unknown module | 404 or fallback home |

---

## 11. Implementation rules for agents

1. Use `react-router-dom` v6 `useNavigate`, `useParams`, `useSearchParams`.
2. Filter/group changes must call `setSearchParams` to keep URL in sync.
3. Selecting a task must update path to `/tasks/:taskId` (not query-only).
4. Clearing selection navigates to `/tasks` preserving filter/group query.
5. Do not register duplicate routes for same inbox view.

---

## 12. Route acceptance

| Check | Expected |
|-------|----------|
| `/tasks?filter=overdue` loads overdue tab active | pass |
| Refresh preserves filter | pass |
| `/tasks/UNKNOWN` shows safe error | pass |
| `/search?q=test` does not mount TasksPage | pass |
| Direct `/tasks/:id` opens detail panel | pass |
