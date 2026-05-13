# AppSheet slice setup matrix (HOME_ALERT pilot)

Slices are the **source of truth** for row sets. Views should reference these slice names where possible.  
**Rule:** AppSheet expressions **must not** start with `=` (that is a Google Sheets convention, not AppSheet).

## Required slices

| Slice name | SCREEN_CODE | Source table | Row filter (copy into AppSheet; no leading `=`) |
|------------|---------------|--------------|--------------------------------------------------|
| `HOME_ALERT_My_Queue` | `HOME_ALERT_MY_QUEUE` | `HOME_ALERT` | `AND([ASSIGNED_TO] = USEREMAIL(), NOT(IN([STATUS], LIST("Resolved", "Closed"))))` |
| `HOME_ALERT_Unassigned_Queue` | `HOME_ALERT_UNASSIGNED_QUEUE` | `HOME_ALERT` | `AND(ISBLANK([ASSIGNED_TO]), NOT(IN([STATUS], LIST("Resolved", "Closed"))))` |
| `HOME_ALERT_Escalated_Queue` | `HOME_ALERT_ESCALATED_QUEUE` | `HOME_ALERT` | `IN([ESCALATION_STATUS], LIST("SUGGESTED", "ESCALATED", "ACKNOWLEDGED"))` |
| `HOME_ALERT_Blocked_Queue` | `HOME_ALERT_BLOCKED_QUEUE` | `HOME_ALERT` | `AND([IS_BLOCKED] = TRUE, NOT(IN([STATUS], LIST("Resolved", "Closed"))))` |
| `HOME_ALERT_SLA_Dashboard` | `HOME_ALERT_SLA_DASHBOARD` | `HOME_ALERT` | `OR([SLA_STATUS] = "OVERDUE", [SLA_STATUS] = "BREACHED", [SLA_BREACH_LEVEL] > 0)` |

## Notes

- **ASSIGNED_TO:** If your backend stores `USER_ID` instead of email, replace the first slice row with the `LOOKUP(USEREMAIL(), "USERS", "EMAIL", "USER_ID")` pattern from `APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`.
- **STATUS / enum values:** Adjust `LIST("Resolved", "Closed")` to match your enum literals.
- **Unassigned:** `ISBLANK([ASSIGNED_TO])` plus active status avoids resolved noise; add team scope with `USERSETTINGS("Role")` / team column if required.
- **Escalated:** driven by `ESCALATION_STATUS`; human **ESCALATE** action only—**do not** add auto-escalation in AppSheet for pilot.
- **Blocked:** `IS_BLOCKED` / `BLOCKED_REASON` visibility for triage.
- **SLA:** `SLA_STATUS`, `SLA_BREACH_LEVEL` for dashboard-style slice; read-first; no auto-resolve.

## User scope hints

| Slice | userScope |
|-------|-----------|
| My Queue | Current assignee only |
| Unassigned | Pool; optional team filter |
| Escalated / Blocked / SLA | Supervisor/Admin policy via security filter |
