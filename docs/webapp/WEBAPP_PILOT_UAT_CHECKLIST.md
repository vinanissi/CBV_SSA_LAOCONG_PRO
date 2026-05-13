# WebApp Pilot UAT Checklist (Phase 90)

## Preconditions

- Latest GAS pushed (`clasp push`)
- New Web App deployment version created (Deploy → Manage deployments → New version)

## Routes to open (read-first)

- `?route=/workspace`
- `?route=/home-alert/my-queue`
- `?route=/home-alert/sla`
- `?route=/home-alert/timeline`
- `?route=/home-alert/kanban`

## What to verify

- **Read-first badge** present.
- **Safety footer** present: No auto assign / resolve / escalate; No production claim.
- **Home dashboard** shows totals; if missing columns, shows warnings (not blank crash).
- **My Queue** shows cards with operator text + SLA badge (no buttons that mutate).
- **SLA dashboard** shows widgets + breached list (read-first).
- **Timeline/Kanban** show structured preview/placeholder (no fake full features).
- **Mobile readability** acceptable for pilot.

## What must NOT exist

- No claim/resolve/escalate/assign buttons.
- No auto actions.
- No production-ready claim.

