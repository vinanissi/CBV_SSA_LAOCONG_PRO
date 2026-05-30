# CBV_WORK_INBOX_V3 — Acceptance Criteria

**Version:** V3.0 · **Date:** 2026-05-29  
**Standard:** CBV Operational Ecosystem Standard V1 · CBV_TCS_V1

---

## 1. Gate summary

| Gate | Required for V3 sign-off |
|------|--------------------------|
| Build | `npm run build` PASS |
| Runtime load | `/tasks` renders without console errors |
| Identity | Display names on cards (not raw USER_CODE) |
| Filter contract | All 4 filter keys functional + URL sync |
| Detail | Deep link + panel + inline exec |
| Focus mode | Toggle + session persist |
| Search | TopBar → results → task navigation |
| Permissions | Viewer read-only enforced |
| No regression | AppShell + status bar intact |

---

## 2. Functional acceptance

### F1 — Work Inbox load

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F1.1 | Initial load shows skeleton then queue | Skeleton → ≥0 cards or EmptyState |
| F1.2 | Snapshot hydrates usersById | Owner/reporter names resolved |
| F1.3 | Default filter is `mine` | Tab active on bare `/tasks` |
| F1.4 | Degraded API keeps view | Last snapshot visible + warning |

### F2 — Filters & grouping

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F2.1 | Four filter tabs work | mine, pending, overdue, approval |
| F2.2 | URL reflects filter | Refresh preserves `?filter=` |
| F2.3 | Group mode cognition/status | Queue regroups correctly |
| F2.4 | Invalid filter normalizes | Unknown → mine |
| F2.5 | Filter feedback | Optional aria-live message on change |

### F3 — Task selection & detail

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F3.1 | Card click selects + detail | Panel populated |
| F3.2 | URL updates to `/tasks/:id` | Shareable link |
| F3.3 | Deep link works | Direct URL opens detail |
| F3.4 | ESC closes detail | Panel cleared |
| F3.5 | Detail cache 45s | No redundant fetch within TTL |
| F3.6 | Unknown id safe error | No white screen |

### F4 — Inline execution

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F4.1 | Accept action works (operator) | Status updates in snapshot |
| F4.2 | Pending state on card | No double submit |
| F4.3 | Error shows retry | RuntimeFeedbackMessage |
| F4.4 | Viewer no write buttons | Actions absent |
| F4.5 | Success feedback | Operator confirmation visible |

### F5 — Focus mode

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F5.1 | Focus queue toggle | Dims non-focused cards |
| F5.2 | Session persist | Survives refresh same tab |
| F5.3 | Quick focus chips | Narrows visible set |
| F5.4 | FocusStrip hidden on /tasks | No duplicate attention row |
| F5.5 | Pinned task stays visible | Focus queue + URL id |

### F6 — Search

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| F6.1 | TopBar submit navigates | `/search?q=` |
| F6.2 | Results link to modules | TASK → `/tasks/:id` |
| F6.3 | Empty query hint | No bogus API call |
| F6.4 | Error retry | Functional retry button |

---

## 3. Visual acceptance

### V1 — Typography & contrast

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| V1.1 | Base 16px on operational-runtime | CSS probe pass |
| V1.2 | Card title semibold slate-900 | Visible scan anchor |
| V1.3 | One dominant signal per card | No signal spam |
| V1.4 | Light theme default | Readable without toggle |

### V2 — Layout stability

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| V2.1 | Min width 1366 shell | No crushed controls |
| V2.2 | Card min-height consistent | scan-row ≥ 3.125rem |
| V2.3 | Detail panel xl aside | No overlap with list |
| V2.4 | Status bar fixed footer | Always visible |
| V2.5 | No layout shift on filter | Queue swaps in place |

### V3 — Signal hierarchy

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| V3.1 | Overdue red border | `task-signal-overdue` |
| V3.2 | Escalation amber | `signal-pattern-escalation` |
| V3.3 | Secondary signals collapsed | Tooltip or detail only |
| V3.4 | Primary action visually dominant | inline-action-primary |

---

## 4. Accessibility acceptance

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| A1 | Filter tabs tablist | role + aria-selected |
| A2 | Focus queue aria-pressed | Toggle accessible |
| A3 | Feedback aria-live | Filter/status announcements |
| A4 | Keyboard ESC closes detail | Functional |
| A5 | Focus ring on cards | focus:ring visible |

---

## 5. Performance acceptance

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| P1 | First render marked | renderPerf optional |
| P2 | Filter change < 100ms client | deriveVisibleTaskRuntime |
| P3 | No full snapshot refetch on filter | Client-side derive |
| P4 | Snapshot limit 100 | SNAPSHOT_LIMIT respected |

---

## 6. Security & permission acceptance

| ID | Criterion | Pass condition |
|----|-----------|----------------|
| S1 | VIEW_ONLY no writes | UI + API reject |
| S2 | No client permission elevation | Capabilities from snapshot |
| S3 | Logout clears session | Cannot access /tasks |
| S4 | IS_PRIVATE tasks not leaked | Server-filtered snapshot |

---

## 7. Regression guards (must not break)

| ID | Criterion |
|----|-----------|
| R1 | Module launchpad sidebar functional |
| R2 | RuntimeStatusBar telemetry publishing |
| R3 | Theme toggle works |
| R4 | TASK_MAIN SHARED_WITH / IS_PRIVATE baseline unchanged |
| R5 | Other routes (/finance, /hoso) unaffected |
| R6 | API envelope shape unchanged |

---

## 8. Test evidence

| Layer | Command / probe |
|-------|---------------|
| Build | `cd apps/workboard && npm run build` |
| Visibility | `taskOperationalVisibilityChecks.ts` |
| Identity GS10 | `taskGs10Checks.ts` |
| Filter debug | `VITE_TASK_FILTER_DEBUG=1` optional logging |
| GAS RF02 | `CBV_RF02_Test_runWorkboardCoreHealth()` (when bound) |

---

## 9. Verdict matrix

| Result | Meaning |
|--------|---------|
| **GO** | All F1–F6, V1–V3, A1–A5, R1–R6 pass |
| **GO_WITH_WARNINGS** | Core F1–F4 pass; performance or GAS pending |
| **NO_GO** | Filter broken, detail crash, identity regression, or runtime break |

---

## 10. Pilot sign-off checklist (operator UAT)

- [ ] Operator scans overdue queue in < 3 seconds
- [ ] Accept + complete flow without leaving inbox
- [ ] Display names match USER_DIRECTORY
- [ ] Focus queue helps single-task execution
- [ ] Search finds task by keyword/ID
- [ ] Viewer role confirmed read-only
- [ ] Stale data banner understandable
- [ ] Mobile bottom sheet acceptable (best-effort)

---

## 11. Out of scope for V3 acceptance

- Kanban / timeline views
- Full mobile responsive redesign
- Offline mode
- Push notifications
- Production GAS deploy verification (separate gate)
