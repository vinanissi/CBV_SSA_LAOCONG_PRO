# AppSheet view setup matrix (HOME_ALERT pilot)

Use with `CBV_UI_CONTRACT.APPSHEET_VIEW` and `CbvAppSheetPilot_buildViewSetupMatrix()` in GAS. Names below are **suggested AppSheet view names**; the sheet of truth is still `APPSHEET_VIEW` on each contract row.

## Required operator / supervisor views

| Suggested view name | SCREEN_CODE | View type (suggestion) | Source slice / table | Role |
|---------------------|---------------|----------------------|----------------------|------|
| `HOME_ALERT_Operator_Dashboard` | `HOME_ALERT_OPERATOR_DASHBOARD` | Dashboard / Deck | Slice: operator-facing subset or `HOME_ALERT` + slice | Operator |
| `HOME_ALERT_My_Queue` | `HOME_ALERT_MY_QUEUE` | Deck or Table | `HOME_ALERT_My_Queue` | Operator |
| `HOME_ALERT_Unassigned_Queue` | `HOME_ALERT_UNASSIGNED_QUEUE` | Deck or Table | `HOME_ALERT_Unassigned_Queue` | Operator, Supervisor |
| `HOME_ALERT_Escalated_Queue` | `HOME_ALERT_ESCALATED_QUEUE` | Deck or Table | `HOME_ALERT_Escalated_Queue` | Supervisor, Admin |
| `HOME_ALERT_Blocked_Queue` | `HOME_ALERT_BLOCKED_QUEUE` | Deck or Table | `HOME_ALERT_Blocked_Queue` | Supervisor, Operator (policy) |
| `HOME_ALERT_SLA_Dashboard` | `HOME_ALERT_SLA_DASHBOARD` | Dashboard / Table | `HOME_ALERT_SLA_Dashboard` | Supervisor, Admin |

## Setup checklist (per view)

1. Create the view in AppSheet; name matches `APPSHEET_VIEW` (or your deliberate mapping documented in the runbook).
2. Bind **UX → Data** to the slice named in `APPSHEET_SLICE_SETUP_MATRIX.md` (or equivalent row filter).
3. Set **Security filter** (row-level) using `USEREMAIL()` and `USERSETTINGS("Role")`—see `APPSHEET_SECURITY_FILTER_MATRIX.md`.
4. Card primary/secondary/meta: use **`OPERATOR_*`** columns per contract, not `DISPLAY_*` / `CARD_*` / `UX_*` / `DESKTOP_*`.
5. Confirm **no** `_THISUSER` and **no** leading `=` in any expression you paste from Sheets into AppSheet.

## Optional

- **BOTH** channel screens: add a manual **Open WebApp** action using `WEBAPP_ROUTE` (human-initiated browser open).
