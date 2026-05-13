# Admin UAT Script

**Role:** Admin  
**Estimated time:** ~25 minutes  
**Routes covered:** `/workspace`, `/runtime/health`, `/reports`, `/admin/reference`, `?action=ping`

Use alongside `WEBAPP_PILOT_UAT_RUNBOOK.md` and `WEBAPP_UAT_FEEDBACK_SCHEMA.md`. Source of truth: `CbvWebAppUat_getAdminScript()`.

---

## Steps

| Step | Action | Expected result |
|------|--------|------------------|
| A1 | Hit `?action=ping` | JSON response; `handler = 999_WEBAPP_DOGET_DISPATCHER_FINAL`; `supported` array includes the documented route prefixes. |
| A2 | Open `?route=/workspace` | Home Workspace renders. `READ_FIRST` badge visible. Safety footer at the bottom contains the four base phrases. |
| A3 | Open `?route=/runtime/health` | Per-phase health cards visible. A missing `CBV_TEST_REPORTS` sheet surfaces as a warning card, **not** as a crash. |
| A4 | Open `?route=/reports` | Reports list visible (or clean empty state). **No delete / edit / save buttons** on report rows. |
| A5 | Open `?route=/admin/reference` | All sections render: Governance, Enums, User/Role, Feature Flag, System Registry, UI Contract, Route Registry. |
| A6 | Inspect the user/role list | Emails are **masked** (e.g. `o***x@domain`). Plain emails must never appear. |
| A7 | Inspect every section for secrets/tokens/keys | All sensitive columns (`TOKEN`, `SECRET`, `API_KEY`, `PRIVATE_KEY`, `PASSWORD`, `CLIENT_SECRET`, etc.) are masked. **No plain values, anywhere.** |
| A8 | Verify the safety footer on every operational route | Verbatim phrases: `No auto assign`, `No auto resolve`, `No auto escalate`, `No production claim`. Timeline / Kanban additionally show `No drag-drop save`. |
| A9 | Inspect every operational route for write controls | No edit / save / delete / toggle / drag-drop save / assign / resolve / escalate buttons. No fake action buttons. |
| A10 | Record feedback per `WEBAPP_UAT_FEEDBACK_SCHEMA.md` | One row per route or one row per anomaly. Use `TESTER_ROLE = Admin`. |

## Expected results summary

- All routes render without white screens.
- Warnings (e.g. missing optional sheet) appear as `cbv-card` warning text + `.cbv-badge.warn`.
- Errors (if any) surface a fallback HTML block — never a raw exception trace.
- Footer text is consistent across routes.

## Pass / Warn / Fail criteria

- **PASS** — All 10 steps PASS, no secrets surfaced, safety footer verbatim everywhere, no mutation control visible.
- **WARN** — Up to 2 MEDIUM/LOW issues with documented workarounds. No BLOCKER.
- **FAIL** — Any BLOCKER, secret leak, missing safety phrase, mutation control surfaced, or production-ready claim observed.

## Notes

- Admin is the only role exposed to `/admin/reference`. Operator and Supervisor roles should **not** see admin-only routes by default — flag if they do.
- Admin should also spot-check that the Phase 92 Test Console (`Show Recent Reports`) returns the latest Phase 94/95 reports (Phase 95 added one).
