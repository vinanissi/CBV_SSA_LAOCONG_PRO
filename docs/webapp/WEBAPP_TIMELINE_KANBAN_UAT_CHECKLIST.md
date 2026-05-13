# WebApp Timeline / Kanban — UAT Checklist (Phase 91)

> Read-first UAT for `/home-alert/timeline` and `/home-alert/kanban`. Production certification is out of scope.

## Preconditions

- Latest GAS pushed (`clasp push --force`).
- New Web App deployment version created (Deploy → Manage deployments → Edit → Version: **New version** → Deploy).
- Phase 91 Test Console run: `🧪 CBV Test Console → Phase 91 — Timeline / Kanban → Run Timeline/Kanban Health Check`.
  - Expected status: **GO** or **GO_WITH_WARNINGS**.
  - Envelope OK: yes.

## Routes to open (read-first)

- `?route=/home-alert/timeline`
- `?route=/home-alert/kanban`

## What to verify

### Timeline page

- [ ] Page loads without crash even when HOME_ALERT is empty or columns missing.
- [ ] `count` displayed; matches number of rendered rows (capped at 100 by default).
- [ ] Rows ordered by `UPDATED_AT` desc; older rows below newer ones.
- [ ] Each row shows: id, status, SLA badge (color reflects breach / overdue), assignedTo, module, operator primary/secondary/meta texts when present, `timelineAt`.
- [ ] **No** claim / resolve / escalate / assign / edit buttons.
- [ ] **No** drag handles or sortable affordances.
- [ ] Safety footer present: `No auto assign · No auto resolve · No auto escalate · No production claim`.

### Kanban page

- [ ] Page loads without crash even when HOME_ALERT is empty.
- [ ] Columns grouped by `STATUS`; column header shows status name + count.
- [ ] When `STATUS` column missing, all cards appear under `UNKNOWN` column with a warning banner.
- [ ] Each column caps at 50 cards (default); `count` still reflects the true group total.
- [ ] Cards inside a column sorted by SLA breach level desc, then `updatedAt` desc.
- [ ] Cards show: id, title (operator primary), SLA badge, assignedTo, operator meta, updatedAt.
- [ ] **No** drag-drop interactions (cards do not move on drag).
- [ ] **No** write buttons on cards.
- [ ] Safety footer present.

### Cross-page

- [ ] `Warnings` block appears at bottom listing every missing-column or read warning surfaced by the data layer.
- [ ] Mobile viewport (≤ 420 px wide) keeps text readable; kanban scrolls horizontally; timeline stays vertical.
- [ ] WebApp navigation (Workspace / My Queue / SLA / Timeline / Kanban / Runtime) still works.

## What must NOT exist

- No claim / resolve / escalate / assign buttons.
- No auto routing / auto assign / auto resolve / auto escalate language.
- No drag-drop save.
- No production-ready claim.
- No AppSheet Bot references presented as a recommendation.

## Sign-off

| Role | Pilot decision | Notes |
|------|----------------|-------|
| Operator |  |  |
| Supervisor |  |  |
| Admin |  |  |

**Pilot readiness:** GO_WITH_WARNINGS until operator UAT completes.  
**Production readiness:** NOT YET (Phase 92 prerequisites apply: Runtime Health / Report Viewer pages).
