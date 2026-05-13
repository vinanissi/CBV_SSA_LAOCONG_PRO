# AppSheet pilot binding checklist

Use with `CBV_UI_CONTRACT` rows where `CHANNEL` is `APPSHEET` or `BOTH`. Cross-check `CbvUiPilotBinding_buildAppSheetBindingPlan()` output in GAS.

## 1. Views

- [ ] For each non-empty `APPSHEET_VIEW` in the contract, an AppSheet **view** exists (name matches your naming convention; adjust AppSheet or contract so they match deliberately).
- [ ] Slice for each view is bound to the correct table (usually `HOME_ALERT` or reference tables per screen).

## 2. Screen codes

- [ ] Document in your runbook which AppSheet view maps to which `SCREEN_CODE` (for traceability and pilot feedback).

## 3. Security filters

- [ ] Row filters / security use `USEREMAIL()` and `USERSETTINGS("Role")` (or equivalent documented pattern).
- [ ] **No** `_THISUSER` (not supported in AppSheet the way operators expect).
- [ ] Stored contract text in `APPSHEET_DEEPLINK_EXPR` / hints does **not** teach leading `=` (AppSheet expressions must not start with `=` in stored contract literals).

## 4. Actions

- [ ] Actions visible to operators match the intent of `ALLOWED_ACTIONS_JSON` (manual actions only; no AppSheet Bot).
- [ ] Optional: add an action that opens a **WebApp** URL built from `WEBAPP_ROUTE` when the screen is `BOTH` (opens in browser; keep human-initiated).

## 5. Operator daily screens

Verify at least:

- [ ] `HOME_ALERT_OPERATOR_DASHBOARD`
- [ ] `HOME_ALERT_MY_QUEUE`
- [ ] `HOME_ALERT_UNASSIGNED_QUEUE`

…plus supervisor slices (`ESCALATED`, `BLOCKED`, `SLA_DASHBOARD`) per contract.

## 6. Operator columns

- [ ] Card / list primary text uses `OPERATOR_*` columns as defined in the contract (not legacy `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*` mapping targets).

## 7. Post-pilot

- [ ] Collect feedback using `PILOT_FEEDBACK_FORM_SCHEMA.md` (sheet or form of your choice).
