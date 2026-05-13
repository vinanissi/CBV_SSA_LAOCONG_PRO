# Supervisor UAT Script

**Role:** Supervisor  
**Estimated time:** ~25 minutes  
**Routes covered:** `/workspace`, `/home-alert/sla`, `/home-alert/timeline`, `/home-alert/kanban`

Use alongside `WEBAPP_PILOT_UAT_RUNBOOK.md` and `WEBAPP_UAT_FEEDBACK_SCHEMA.md`. Source of truth: `CbvWebAppUat_getSupervisorScript()`.

---

## Steps

| Step | Action | Expected result |
|------|--------|------------------|
| S1 | Open `?route=/workspace` | Home Workspace renders. Supervisor understands the at-a-glance status of the team. |
| S2 | Open `?route=/home-alert/sla` | SLA widgets visible. Breached / warning states clearly labelled with text + colour. |
| S3 | Inspect SLA breached cards | Status uses **text + colour** together. Colour-only badges are a HIGH severity finding. |
| S4 | Open `?route=/home-alert/timeline` | HOME_ALERT rows are ordered by recency. Safety footer contains `No drag-drop save`. |
| S5 | Open `?route=/home-alert/kanban` | Columns grouped by `STATUS`. Safety footer contains `No drag-drop save`. |
| S6 | Try to drag a Kanban card to another column | Card **is not draggable**. No save action triggers. Drag attempt either does nothing or is visibly rejected. |
| S7 | Verify workload visibility across My Queue / SLA / Kanban | Supervisor can identify load distribution across operators using read-only views only. |
| S8 | Verify warning / partial / empty states across the three routes | Each non-`ready` state has descriptive text. No white-screen on empty data. |
| S9 | Record feedback per `WEBAPP_UAT_FEEDBACK_SCHEMA.md` | Use `TESTER_ROLE = Supervisor`. Capture comprehension impressions, not just defects. |

## Expected results summary

- Breached SLA cards are immediately recognisable.
- Timeline ordering matches operator expectations (most-recent first).
- Kanban is purely informational; no drag-drop save anywhere.
- Empty states never look like a broken page.

## Pass / Warn / Fail criteria

- **PASS** — All 9 steps PASS. Supervisor confidently interprets SLA / Timeline / Kanban. No drag-drop save observed.
- **WARN** — Up to 2 MEDIUM usability issues (e.g. badge wording, spacing) with workarounds documented.
- **FAIL** — Any BLOCKER, working drag-drop save, hidden mutation, missing safety phrase, or supervisor unable to interpret SLA / Timeline / Kanban.

## Notes

- Supervisor should also try to identify "what would help me triage this faster" — capture as OBSERVATION rows, not blockers.
- Test on both desktop and tablet; tablet supervisor use is common.
