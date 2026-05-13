# AppSheet security filter matrix (pilot)

Row-level security and slice filters must use **AppSheet-native** identity:

- **`USEREMAIL()`** — current signed-in user.
- **`USERSETTINGS("Role")`** — role from AppSheet user settings (configure per user in pilot).

## Forbidden

- **`_THISUSER`** — do not use (not the AppSheet model operators expect).
- **Leading `=`** — expressions copied from Google Sheets must be stripped of leading `=`.
- **AppSheet Bot** altering rows based on SLA or queues without human action.

## Sample patterns (adjust columns to your schema)

### Operator — my work

`OR([ASSIGNED_TO] = USEREMAIL(), [REPORTED_BY] = USEREMAIL())`  
Tune to your assignment model; if `ASSIGNED_TO` is `USER_ID`, use `LOOKUP(USEREMAIL(), "USERS", "EMAIL", "USER_ID")`.

### Operator + team pool (optional)

`AND(USERSETTINGS("Role") = "Operator", OR([ASSIGNED_TO] = USEREMAIL(), AND(ISBLANK([ASSIGNED_TO]), [TEAM_CODE] = USERSETTINGS("Team"))))`  
Only if you maintain `Team` in user settings.

### Supervisor — escalations

`AND(USERSETTINGS("Role") = "Supervisor", IN([ESCALATION_STATUS], LIST("ESCALATED", "ACKNOWLEDGED", "SUGGESTED")))`

### Admin — read-all (explicit only)

`USERSETTINGS("Role") = "Admin"`  
Document any admin bypass; audit-first.

## Validation checklist

- [ ] Every HOME_ALERT view used in pilot has a documented filter.
- [ ] Cross-account spot check: operator A cannot see operator B private queue rows unless policy allows.
- [ ] Supervisor sees escalated/blocked/SLA per policy, not unrelated teams (unless configured).
- [ ] No `_THISUSER` in any saved expression.
- [ ] No expression stored in `CBV_UI_CONTRACT` cells starts with `=`.
