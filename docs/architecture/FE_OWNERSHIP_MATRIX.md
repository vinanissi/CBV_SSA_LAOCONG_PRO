# FE Ownership Matrix (WebApp-led)

## Legend

- **Primary**: surface owns the UX and is the default operator path.
- **Secondary**: surface exists as a lightweight/fallback path.
- **Later**: explicitly deferred; not in Phase 88.

---

## Matrix

| Capability | WebApp | AppSheet | Notes |
|-----------|--------|----------|------|
| HOME / Today Workspace | **Primary** | Secondary | WebApp workspace; AppSheet may have minimal landing only |
| My Queue | **Primary (advanced)** | **Primary (lightweight)** | Both exist: AppSheet quick triage; WebApp deep work |
| Unassigned Queue | Optional (later) | **Primary (initially)** | AppSheet triage-first; WebApp optional |
| Escalated Queue | **Primary (advanced)** | **Primary (lightweight)** | Both; no auto escalation |
| Blocked Queue | **Primary (advanced)** | **Primary (lightweight)** | Both; human-in-the-loop |
| SLA Dashboard / SLA Monitor | **Primary** | Secondary | WebApp dashboards + drill-down |
| Timeline | **Only** | — | WebApp visualization |
| Kanban | **Only** | — | WebApp board |
| Runtime Health | **Only** | — | WebApp admin/ops surface |
| Test Console | **WebApp/GAS dialog only** | — | Current canonical entry is Sheets menu; WebApp hub later |
| Report / Handoff Viewer | **Only** | — | WebApp read-only viewer |
| Admin Reference Viewer | **Only** | — | WebApp read-only explorer |
| Quick Mobile Form | — | **Only** | Field ops |
| Upload / Capture | Secondary | **Primary** | AppSheet camera/upload; WebApp may add later |
| AI Review | **Later** | — | Later; no AI runtime |

---

## Hard constraints

- No AppSheet Bot.
- No auto assign / auto resolve / auto escalate.
- No destructive migration.
- No production claim.

