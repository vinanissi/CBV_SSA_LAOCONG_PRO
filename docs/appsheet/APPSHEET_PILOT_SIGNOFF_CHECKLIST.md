# AppSheet pilot signoff checklist

Append-only signoff: add a new row or dated section; **do not delete** prior pilot records.

## Setup

- [ ] `clasp push` includes `88_APPSHEET_PILOT_SETUP_RUNTIME.js` and `89_APPSHEET_PILOT_SETUP_TEST_CONSOLE.js`.
- [ ] Phase 87 health check run at least once; result attached or referenced.

## Views

- [ ] All six pilot views exist and match `APPSHEET_VIEW` / `APPSHEET_VIEW_SETUP_MATRIX.md`:
  - [ ] `HOME_ALERT_Operator_Dashboard` (or contract-exact name)
  - [ ] `HOME_ALERT_My_Queue`
  - [ ] `HOME_ALERT_Unassigned_Queue`
  - [ ] `HOME_ALERT_Escalated_Queue`
  - [ ] `HOME_ALERT_Blocked_Queue`
  - [ ] `HOME_ALERT_SLA_Dashboard`

## Slices

- [ ] Five required slices created; row filters match `APPSHEET_SLICE_SETUP_MATRIX.md` (no leading `=`).

## Actions

- [ ] ACK, CLAIM, IN_PROGRESS, WAITING_RESPONSE, ESCALATE, RESOLVE, RELEASE implemented as **manual** actions only.

## Security

- [ ] Filters use `USEREMAIL()` / `USERSETTINGS("Role")`; no `_THISUSER`.
- [ ] Spot check completed for operator vs supervisor accounts.

## Automation policy

- [ ] **No AppSheet Bot** enabled for HOME_ALERT pilot paths.
- [ ] No auto assign / auto resolve / auto escalate in AppSheet or triggers for pilot.

## Feedback

- [ ] Pilot feedback captured (`PILOT_FEEDBACK_FORM_SCHEMA.md` or form).

## Production

- [ ] **Production not yet approved** — this signoff is **pilot only**.

**Signed:** _________________ **Role:** _________________ **Date:** _________________
