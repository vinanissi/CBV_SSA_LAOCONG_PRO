# WebApp Route Smoke Test Matrix (Phase 94)

Single-page smoke matrix for manual route verification on the live deployment. Use alongside `WEBAPP_UAT_MASTER_CHECKLIST.md`.

---

## 1. Smoke matrix

| # | URL | Expected handler / renderer | Expected status | Expected page title | Required safety footer phrases | Expected no-write behaviour |
|---|-----|------------------------------|-----------------|---------------------|---------------------------------|------------------------------|
| 1 | `?action=ping` | `999_WEBAPP_DOGET_DISPATCHER_FINAL` | HTTP 200, JSON | n/a (JSON) | n/a (JSON support endpoint) | n/a (read-only) |
| 2 | `?route=/workspace` | `CbvWebAppPilotRenderer_renderHome` | HTML render | Home Workspace | Base 4 phrases | No edit/save/delete/toggle/assign buttons |
| 3 | `?route=/home-alert/my-queue` | `CbvWebAppPilotRenderer_renderQueue` | HTML render | My Queue | Base 4 phrases | No edit/assign/escalate buttons |
| 4 | `?route=/home-alert/sla` | `CbvWebAppPilotRenderer_renderSla` | HTML render | SLA Dashboard | Base 4 phrases | No edit buttons |
| 5 | `?route=/home-alert/timeline` | `CbvWebAppTimelineKanban_renderTimeline` | HTML render | Timeline | Base 4 + `No drag-drop save` | No writeback form |
| 6 | `?route=/home-alert/kanban` | `CbvWebAppTimelineKanban_renderKanban` | HTML render | Kanban | Base 4 + `No drag-drop save` | No drag-drop save handler |
| 7 | `?route=/runtime/health` | `CbvWebAppObservability_renderRuntimeHealth` | HTML render | Runtime Health | Base 4 phrases | No auto-heal trigger |
| 8 | `?route=/reports` | `CbvWebAppObservability_renderReportViewer` | HTML render | Reports | Base 4 phrases | No delete/edit report buttons |
| 9 | `?route=/admin/reference` | `CbvWebAppAdminRef_renderReferenceViewer` | HTML render | Admin Reference Viewer | Base 4 phrases + `Secrets masked` | No edit/toggle/delete UI |

Base 4 phrases (mandatory on every operational route):
- `No auto assign`
- `No auto resolve`
- `No auto escalate`
- `No production claim`

## 2. Smoke procedure

For each row 2–9 above:

1. Open the URL on the deployed Apps Script WebApp (Web App URL of the active deployment).
2. Wait for HTML to render fully.
3. Confirm page title matches the matrix.
4. Confirm safety footer phrases appear at the end of the page.
5. Scan the DOM (or visually) for any of: `button:contains(Save)`, `button:contains(Edit)`, `button:contains(Delete)`, `button:contains(Toggle)`, `button:contains(Assign)`, `button:contains(Resolve)`, `button:contains(Escalate)`. Expected: **none found**.
6. For row 6 (Kanban), confirm cards are **not** draggable (no `draggable="true"` on card elements).
7. For row 9 (Admin Reference), confirm no email is shown in full-text — masked form `o***x@domain` only.
8. Record PASS / WARN / FAIL with notes.

For row 1 (`?action=ping`):

1. Open the URL.
2. Confirm JSON response is parseable.
3. Confirm `handler` field equals `999_WEBAPP_DOGET_DISPATCHER_FINAL`.
4. Confirm `supported` array contains the documented route prefixes.

## 3. Failure handling

If any row fails:

- Do **not** apply pilot tag.
- File the failure in the Phase 94 report under "Warnings" or "Errors" (as appropriate).
- Re-run `🧪 CBV Test Console → Phase 94 — UI Freeze / UAT → Run UI Freeze Health Check` to capture the latest envelope.
- Fix in code or doc and redeploy.

## 4. Pass criteria

All 9 rows PASS. Pilot tag `v2.4.11-webapp-ui-foundation-freeze` may then be applied (optional). Production tag remains **forbidden**.
