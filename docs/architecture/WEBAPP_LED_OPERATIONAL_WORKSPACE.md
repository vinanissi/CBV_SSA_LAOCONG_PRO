# WebApp-led Operational Workspace

## Statement

WebApp is the **primary operational workspace** for CBV operations. It owns advanced UX, navigation, dashboards, and operational tooling. This repo uses **Sheets/GAS** as the operational database + runtime, with WebApp as the main FE for workspace work.

---

## WebApp owns (primary surfaces)

- Home / Today Workspace
- Dashboard
- Timeline (visual history)
- Kanban (work board)
- SLA Monitor
- Escalation Center
- Runtime Health
- Test Console (UI hub later; current QA remains available via Sheets menu)
- Report / Handoff Viewer
- Admin Workspace (reference explorer, audit views)
- Advanced search/filter
- Multi-panel workspace

Later (not in Phase 88):

- AI Review Center (manual review workflows; no AI runtime)

---

## Principles

- **Runtime-first**: WebApp reads from GAS runtime services and contracts, not bespoke client state as the source of truth.
- **Read-first**: prefer read-only pages until manual write flows are explicitly approved.
- **Manual-first → Auto-later**: no autonomous resolution or routing decisions.
- **Audit-first**: every state change must have an audit story.
- **Human-in-the-loop**: all critical transitions require explicit human action.

---

## Non-goals (explicit)

- No claim of being “production ready” in Phase 88.
- No auto assignment / auto resolve / auto escalation.
- No auto resolve
- No auto escalate
- No queue intelligence.
- No AI runtime.

---

## Integration boundaries

- **Data**: Sheets (append-only where possible; avoid destructive migration).
- **Runtime**: GAS services (health, audit, contract validation, report append).
- **Operator shell**: AppSheet for mobile quick ops and fallback.

