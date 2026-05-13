# Handoff — Phase 88 FE Architecture Rebalance Closeout

## Final architecture sentence

**Sheets/GAS = operational database + runtime; WebApp = operational workspace; AppSheet = lightweight operator shell (WebApp-led hybrid).**

---

## What WebApp owns

- Home / Today Workspace
- Dashboard
- Timeline
- Kanban
- SLA Monitor
- Escalation Center
- Runtime Health
- Test Console (hub UI later; current gate via Sheets Test Console)
- Report / Handoff Viewer
- Admin Workspace (reference explorer)
- Advanced search/filter
- Multi-panel workspace
- AI Review Center (later; no AI runtime)

---

## What AppSheet owns

- Mobile quick CRUD
- Quick queue actions (manual taps)
- Field operation forms
- Simple upload/capture
- Lightweight My Queue
- Fallback operator path

Constraints:

- No AppSheet Bot.
- No uncontrolled automation.

---

## What Sheets/GAS owns

- Operational database
- Business runtime + orchestration
- Audit log
- Append-only report/handoff artifacts
- Test console standard (`CBV_TCS_V1`)
- Runtime health
- Data contract
- WebApp API surface
- AppSheet binding metadata

---

## What not to do next

- Do not pivot back to AppSheet-centric architecture.
- Do not build AppSheet Bot.
- Do not add auto assign / auto resolve / auto escalate.
- Do not claim production readiness.
- Do not do destructive migrations.
- Do not introduce AI runtime / queue intelligence.

---

## Recommended next phase

**Phase 89 — WebApp Operational Workspace Skeleton**

- Route registry + permission model + FE test baseline.
- Read-first pages: dashboard/timeline/kanban/health/report viewer/admin reference.

