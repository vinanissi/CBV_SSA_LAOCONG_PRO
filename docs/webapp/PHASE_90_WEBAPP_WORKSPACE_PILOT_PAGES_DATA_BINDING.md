# PHASE 90 — WebApp Workspace Pilot Pages / Data Binding

## Purpose

Upgrade Phase 89 skeleton into **pilot-ready read-first pages** with clearer data binding:

- Home Workspace dashboard (real totals)
- My Queue card/list (operator text + SLA badge)
- SLA dashboard widgets (status + breach level)
- Structured placeholders for Timeline/Kanban previews
- FE state standard (loading/empty/warning/error/ready/partial)

## Scope / out of scope

In scope:

- Read-first rendering and data mapping from `HOME_ALERT`
- UI states and warning handling
- Test console gate (CBV_TCS_V1)

Out of scope:

- Any write mutation (claim/resolve/escalate)
- Automation-first logic
- ENV-A / AI runtime / queue intelligence
- Production claim

## Safety rules (must remain visible)

- No auto assign
- No auto resolve
- No auto escalate
- No AppSheet Bot
- No production claim

## Routes affected

- `/workspace`
- `/home-alert/my-queue`
- `/home-alert/sla`
- `/home-alert/timeline` (preview only)
- `/home-alert/kanban` (preview only)

## Implementation pointers

- Data: `05_GAS_RUNTIME/97_WEBAPP_WORKSPACE_PILOT_DATA.js`
- Renderer: `05_GAS_RUNTIME/98_WEBAPP_WORKSPACE_PILOT_RENDERER.js` (integrated via `94_WEBAPP_WORKSPACE_RENDERER.js`)
- Test console: `05_GAS_RUNTIME/990_WEBAPP_WORKSPACE_PILOT_TEST_CONSOLE.js`

