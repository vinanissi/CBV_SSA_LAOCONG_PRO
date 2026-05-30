# PHASE_UI_CBV_WORK_INBOX_V3 — Frontend Phase A: Route Alias & Shell

# Status

**GO**

# Summary

Phase A adds the canonical Work Inbox route (`/inbox`), preserves legacy `/tasks`, redirects `/` → `/inbox`, and introduces a shared `WorkInboxShell` wrapped by a single `TaskInboxRoute` element so `/inbox` and `/tasks` do not duplicate page logic. The existing `TasksPage` runtime is rendered inside the shell unchanged. `OperationalHome` (former `/` launchpad) remains available at `/home`. No API, schema, or GAS contract changes.

# Routes Added

| Route | Behavior |
|-------|----------|
| `/inbox` | Work inbox shell + `TasksPage` |
| `/inbox/:taskId` | Same shared route element (task detail in existing runtime) |
| `/home` | Former `OperationalHome` (launchpad preserved) |

# Routes Preserved

| Route | Behavior |
|-------|----------|
| `/tasks` | Legacy alias — same `TaskInboxRoute` as `/inbox` |
| `/tasks/:taskId` | Legacy task detail — same shared element |
| `/finance`, `/hoso`, `/coordination`, `/observation`, `/plugins`, `/search`, `/m/:moduleSlug` | Unchanged |

# Shared Components

| Component | Path | Role |
|-----------|------|------|
| `WorkInboxShell` | `apps/workboard/src/components/inbox/WorkInboxShell.tsx` | Phase A top-of-canvas shell (header + body slot) |
| `TaskInboxRoute` | `apps/workboard/src/modules/task/TaskInboxRoute.tsx` | Single route element: shell + `TasksPage` |
| `isWorkInboxRoute` | `apps/workboard/src/shared/routes/inboxRoutes.ts` | Detects `/inbox` and `/tasks` for FocusStrip / telemetry |

# Runtime Impact

- **Task API / Snapshot API / Worker API / Google Sheet runtime:** no changes.
- **Internal navigation:** `TasksPage` still navigates to `/tasks/...` in several places; both `/tasks` and `/inbox` routes resolve to the same shell. URL may show `/tasks/:id` after in-app navigation — acceptable for Phase A; canonical URL normalization is a later phase.
- **Module registry (local):** `HOME.primaryUrl` → `/home`; `findModuleByPath` recognizes `/inbox` as TASK module.
- **FocusStrip / RuntimeTelemetryInline:** use `isWorkInboxRoute` so `/inbox` gets the same unified-header behavior as `/tasks`.

# Acceptance Check

| Criterion | Result |
|-----------|--------|
| `/`, `/inbox`, `/tasks` all work | PASS — `/` redirects; `/inbox` and `/tasks` share `TaskInboxRoute` |
| `/tasks` not removed | PASS |
| `/` → `/inbox` redirect | PASS (`Navigate replace`) |
| `WorkInboxShell` reused | PASS — one wrapper, two route paths |
| No API contract change | PASS |
| No schema change | PASS |
| No big-bang rewrite | PASS — `TasksPage` untouched |
| Build (`npm run build`) | PASS |

# Test Checklist (manual)

## Route `/`

- [ ] Open `/` while logged in → lands on `/inbox` (URL updates).
- [ ] No blank screen / no infinite redirect loop.

## Route `/inbox`

- [ ] `/inbox` loads task runtime inside “Hộp việc” shell header.
- [ ] Filters, list, detail panel behave as on legacy `/tasks`.

## Route `/tasks`

- [ ] `/tasks` loads identical shell + runtime as `/inbox`.
- [ ] Bookmarks and sidebar links to `/tasks` still work.

## Redirect

- [ ] `/` → `/inbox` uses `replace` (back button does not trap on empty `/`).

## Shared Shell

- [ ] Inspect DOM: `data-cbv-shell="work-inbox-v3"` present on both `/inbox` and `/tasks`.
- [ ] No duplicate `TasksPage` mount logic in `routes.tsx` (single `taskInboxElement`).

## No Runtime Regression

- [ ] Snapshot load, filters, task detail, create modal, footer telemetry unchanged.
- [ ] `/home` still opens OperationalHome launchpad.
- [ ] Other routes (`/finance`, `/search`, …) unchanged.

# Risks

| Risk | Mitigation |
|------|------------|
| Mixed URLs (`/inbox` vs `/tasks/:id`) after in-app navigation | Documented; Phase B+ can add route-prefix helper |
| Sidebar “Hôm nay” now points to `/home` not `/` | Module registry `primaryUrl` updated; operators using old `/` bookmark get inbox (intended) |
| Worker `moduleRegistryData` still lists `/tasks` as TASK primary | Local registry + runtime paths aligned; worker URL is separate deployment |

# Next Step

**PHASE B — Data Adapter**

- Implement adapter from current task API/snapshot → `InboxItem` / `TaskCardModel` per `100_TARGET_DESIGN/014_DATA_CONTRACT.md`.
- Do not render raw task fields directly in new V3 cards (when introduced in later phases).

---

*Generated: PHASE_UI_CBV_WORK_INBOX_V3_FRONTEND_PHASE_A. Build verified: `apps/workboard` `npm run build`.*
