# AppSheet binding from CBV_UI_CONTRACT

> **Note:** This filename matches the Phase 85 spec key (`APPSSHEET_*`). The content is about **AppSheet** binding.

## Workflow

1. Run `CbvUiContract_bootstrap()` (or Test Console → Bootstrap) so baseline rows exist.
2. For each row with `CHANNEL` in (`APPSHEET`, `BOTH`), open AppSheet and create or rename a **View** to match `APPSHEET_VIEW` (planner column; adjust to your app’s naming convention).
3. Bind **Show** columns using the operator field names in `PRIMARY_TEXT_FIELD`, `SECONDARY_TEXT_FIELD`, `META_TEXT_FIELD`, `NEXT_ACTION_FIELD`, `GROUP_BY_FIELD`, `SORT_BY_FIELD` — for `HOME_ALERT_*` these must be the `OPERATOR_*` columns.
4. Implement slice **Row filter** / security using `SECURITY_FILTER_HINT` as documentation; paste real expressions in AppSheet (never `_THISUSER`; use `USEREMAIL()` / `USERSETTINGS("Role")`).
5. Actions: decode `ALLOWED_ACTIONS_JSON` as the allowlist of behaviors to expose on that view; implement buttons/workflows manually.

## Deep links

`APPSHEET_DEEPLINK_EXPR` stores the expression body **without** a leading `=` (AppSheet convention). Examples use `LINKTOVIEW("Your_View_Name")` — replace with your deployed view names.

## Cross-references

- Home Alert formulas: `docs/appsheet/APPSHEET_HOME_ALERT_FORMULA_REFERENCE.md`
- Install / views: `docs/appsheet/APPSHEET_HOME_ALERT_INSTALL_GUIDE.md`
