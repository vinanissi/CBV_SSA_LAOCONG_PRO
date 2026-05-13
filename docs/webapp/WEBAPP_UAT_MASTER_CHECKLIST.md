# WebApp UAT Master Checklist (Phase 94)

End-to-end UAT for the WebApp pilot tier. Run every block before recommending Phase 95.

---

## 0. Preconditions

- [ ] Latest branch `phase/from-v2.4.1-TASK-FIN` deployed via `clasp push --force`.
- [ ] Apps Script → Deploy → Manage deployments → **New version** deployed.
- [ ] Spreadsheet menu refreshed; `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT` visible.

## 1. Test Console block

- [ ] Run `Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check` → status `GO` or `GO_WITH_WARNINGS`, `envelopeOk = yes`.
- [ ] Run `Phase 90 / 91 / 92 / 93` health checks → each returns `GO` or `GO_WITH_WARNINGS`.
- [ ] No `CRITICAL` severity entries in any of the five reports.
- [ ] `Copy Latest Report` dialog opens and returns valid JSON for each phase.

## 2. Route smoke block

Per `WEBAPP_ROUTE_SMOKE_TEST_MATRIX.md`, visit each route on the live deployment.

- [ ] `?action=ping` → JSON response with handler `999_WEBAPP_DOGET_DISPATCHER_FINAL`.
- [ ] `?route=/workspace` renders Home Workspace.
- [ ] `?route=/home-alert/my-queue` renders My Queue.
- [ ] `?route=/home-alert/sla` renders SLA Dashboard.
- [ ] `?route=/home-alert/timeline` renders Timeline (sorted by `UPDATED_AT` desc).
- [ ] `?route=/home-alert/kanban` renders Kanban (grouped by `STATUS`).
- [ ] `?route=/runtime/health` renders Runtime Health cards.
- [ ] `?route=/reports` renders Report Viewer.
- [ ] `?route=/admin/reference` renders Admin Reference Viewer.

## 3. Data visibility block

- [ ] Workspace cards render with metric values OR a warning state when source is missing.
- [ ] My Queue shows ≥0 cards; never crashes when HOME_ALERT is empty.
- [ ] SLA shows widgets OR warnings if SLA columns missing.
- [ ] Timeline renders ordered list (most recent first).
- [ ] Kanban renders columns with cards capped per column (no infinite scroll).
- [ ] Runtime Health shows per-phase cards (warning OK when `CBV_TEST_REPORTS` missing).
- [ ] Reports lists most recent reports OR a clean empty state.
- [ ] Admin Reference shows all governance sections (governance, enums, user-role, feature flags, system registry, UI contract, route registry).

## 4. Warning state block

- [ ] Missing optional sheet → warning card visible.
- [ ] Missing function (`CbvUiContract_getAll` absent) → warning, not crash.
- [ ] Renderer exception → fallback HTML visible.
- [ ] Empty list → empty-state message present.
- [ ] Partial data on a multi-source page → partial-state messaging visible.

## 5. No-mutation UI block

For each of the 8 frozen operational routes, confirm:

- [ ] No edit / save / delete / toggle / assign / resolve / escalate buttons present.
- [ ] No drag-drop save handler in Kanban (DOM inspection or visual confirmation).
- [ ] No writeback form on Timeline.
- [ ] No toggle on Feature Flag section (Admin Reference).
- [ ] No delete-report button on Reports.

## 6. Responsive block

For breakpoints listed in `WEBAPP_RESPONSIVE_ACCESSIBILITY_BASELINE.md`:

- [ ] Desktop 1280×800: cards fit without horizontal scroll.
- [ ] Tablet 1024×768: nav remains usable; cards readable.
- [ ] Mobile 414×896: cards stack; safety footer visible at bottom.
- [ ] Mobile 360×800: no clipped critical text.

## 7. Accessibility block

- [ ] Page text passes WCAG-AA contrast spot-check (e.g. `cbv-muted` on background).
- [ ] All badges show **text** + colour, not colour alone.
- [ ] Tab order through cards matches visual order.
- [ ] Buttons in dialogs show visible text.
- [ ] Warnings list reads correctly with a screen reader (text + heading).

## 8. Report / audit block

- [ ] Each Phase 90 / 91 / 92 / 93 / 94 `reportText` contains the required safety phrases.
- [ ] No `production ready` claim in any report.
- [ ] No `auto-heal` recommendation in any report.
- [ ] `PropertiesService`-backed `_LAST_REPORT_JSON` keys exist for each phase.
- [ ] `Show AI Handoff Prompt` works for each phase and returns the phase-specific prompt.

## 9. Governance block

- [ ] Secrets / tokens / API keys not surfaced anywhere (Phase 93 carry-over).
- [ ] Emails masked in Admin Reference.
- [ ] Missing reference sheets surface as warnings only.
- [ ] No write functions found by Phase 91.1 / 92 / 93 / 94 mutation validators.

## 10. Pass / Warn / Fail criteria

- **PASS:** Every block above ticked. Optional pilot tag `v2.4.11-webapp-ui-foundation-freeze` allowed.
- **WARN:** Up to 2 non-blocking items unticked; record in the report. Pilot tag still allowed with explicit note.
- **FAIL:** Any `CRITICAL` severity, any mutation introduced, any production claim, any missing safety phrase, any frozen route missing or mode-drifted. Pilot tag **forbidden**; fix and re-run.

## 11. Sign-off

Recorded by:

- Operator UAT lead: _____________________
- Supervisor: _____________________
- Admin / Runtime owner: _____________________
- Date: _____________________
- Pilot tag applied: ☐ yes  ☐ no
