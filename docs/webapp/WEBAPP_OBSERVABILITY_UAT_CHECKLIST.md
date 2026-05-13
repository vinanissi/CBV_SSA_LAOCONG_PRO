# WebApp Observability — UAT Checklist (Phase 92, read-first)

> Operators run this checklist against the Apps Script WebApp deployment after `clasp push --force` + Apps Script "New deployment version".

## Pre-flight

- [ ] `clasp push --force` succeeded with no errors.
- [ ] Apps Script editor shows `994_WEBAPP_OBSERVABILITY_DATA`, `995_WEBAPP_OBSERVABILITY_RENDERER`, `996_WEBAPP_OBSERVABILITY_TEST_CONSOLE` as separate files.
- [ ] `999_WEBAPP_DOGET_DISPATCHER_FINAL.js` remains the absolute last entry in `.clasp.json` `filePushOrder`.

## Test Console

In the spreadsheet menu `🧪 CBV Test Console → Phase 92 — Observability`:

- [ ] **Run Observability Health Check** returns status `GO` or `GO_WITH_WARNINGS`. Envelope OK = `yes`. No `errors`.
- [ ] **Show Runtime Health Data** opens a dialog with health cards, route summary, report summary, test console summary.
- [ ] **Show Recent Reports** lists rows from in-memory + `SYSTEM_HEALTH_LOG` (and `CBV_TEST_REPORTS` if present).
- [ ] **Show Trace Summary** lists unique trace IDs.
- [ ] **Show AI Handoff Prompt** displays the Phase 92 handoff text.
- [ ] **Copy Latest Report** opens a modal with selectable JSON.

## Runtime Health page (`/runtime/health`)

Open `<WEBAPP_URL>?route=/runtime/health` (or use the deployed dispatcher equivalent).

- [ ] Page header shows **"Runtime Health (read-first)"**.
- [ ] Overall status badge is rendered (one of `GO` / `GO_WITH_WARNINGS` / `FAIL`).
- [ ] Per-phase cards are listed; each shows code, label, status, severity, optional note.
- [ ] Route Summary panel renders count + read-first count + by-mode/page-type breakdown.
- [ ] Report Summary panel shows in-memory count, `SYSTEM_HEALTH_LOG` row count, `CBV_TEST_REPORTS` row count.
- [ ] Warnings panel appears only when warnings exist; each warning is plain text, not a control.
- [ ] Safety footer reads: **"Read-first only. Safety: No auto-heal · No auto resolve · No auto escalate · No production claim."**

## Report Viewer page (`/reports`)

Open `<WEBAPP_URL>?route=/reports`.

- [ ] Page header shows **"Report Viewer (read-first)"**.
- [ ] Total `count` matches the number of rendered rows.
- [ ] Each row shows phase, status badge, severity badge, reportId, runBy (if any), traceId (if any), summary (truncated to ~280 chars), `checkedAt`, source.
- [ ] No edit / save / update buttons on any row.
- [ ] No delete / remove / discard buttons on any row.
- [ ] When `CBV_TEST_REPORTS` is missing, a warning is visible: "CBV_TEST_REPORTS sheet missing — using in-memory + SYSTEM_HEALTH_LOG only".
- [ ] Safety footer reads: **"Read-first only. No delete report · No edit report · No auto-heal · No production claim."**

## Missing-source warnings

- [ ] If `CBV_TEST_REPORTS` is absent, the health check still completes with status `GO_WITH_WARNINGS`, **not** `FAIL`.
- [ ] If `SYSTEM_HEALTH_LOG` is absent, behavior is the same — warning, not failure.
- [ ] No automatic creation of either sheet is triggered.

## Mobile readability

- [ ] Both pages remain readable on a mobile viewport (cards stack vertically; horizontal scroll only inside the kanban overflow on `/home-alert/kanban`).

## No-mutation audit

- [ ] No buttons that POST, mutate, claim, resolve, escalate, delete, edit, save, or auto-heal anywhere on the two pages.
- [ ] Browser DevTools confirms no `google.script.run.*` calls bound to mutation handlers.
