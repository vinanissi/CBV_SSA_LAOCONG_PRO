# CBV_UI_CONTRACT — schema

Canonical headers match `CBV_SCHEMA_MANIFEST.CBV_UI_CONTRACT` (order matters for new sheets).

| Column | Purpose |
|--------|---------|
| `UI_CONTRACT_ID` | Stable row id (e.g. `UIC_HOME_ALERT_MY_QUEUE`) |
| `SCREEN_CODE` | Unique logical screen key (e.g. `HOME_ALERT_MY_QUEUE`) |
| `SCREEN_NAME` | Human label |
| `MODULE_CODE` | Owning module (`HOME_ALERT`, `SYSTEM`, …) |
| `DOMAIN_CODE` | Coarse domain (`OPERATIONS`, `RUNTIME`, …) |
| `USER_ROLE` | Intended role filter; `*` = any |
| `TEAM_CODE` | Intended team filter; `*` = any |
| `CHANNEL` | `APPSHEET` \| `WEBAPP` \| `BOTH` |
| `SCREEN_TYPE` | `DASHBOARD`, `QUEUE`, `DETAIL`, `FORM`, `KANBAN`, `TIMELINE`, `HEALTH`, `TEST_CONSOLE`, `REPORT_VIEWER` |
| `DATA_SOURCE_SHEET` | Primary Google Sheet table name |
| `DATA_SOURCE_VIEW` | Optional named range / SQL-style label for WebApp |
| `PRIMARY_KEY_FIELD` | Row id column on data sheet |
| `PRIMARY_TEXT_FIELD` | Main title column (for `HOME_ALERT_*`: `OPERATOR_PRIMARY_TEXT`) |
| `SECONDARY_TEXT_FIELD` | Subtitle (`OPERATOR_SECONDARY_TEXT`) |
| `META_TEXT_FIELD` | Meta line (`OPERATOR_META_TEXT`) |
| `NEXT_ACTION_FIELD` | CTA text (`OPERATOR_NEXT_ACTION`) |
| `GROUP_BY_FIELD` | Card/list grouping (`OPERATOR_DASHBOARD_GROUP`) |
| `SORT_BY_FIELD` | Sort key (`OPERATOR_DASHBOARD_SORT`) |
| `SORT_DIRECTION` | `ASC` or `DESC` |
| `WEBAPP_ROUTE` | Future HTTP path fragment (leading `/` recommended) |
| `APPSHEET_VIEW` | Target AppSheet view name (planner field) |
| `APPSHEET_DEEPLINK_EXPR` | Deep link / navigation expression **without** leading `=` |
| `ALLOWED_ACTIONS_JSON` | JSON array of action tokens (documentation + future gating) |
| `PERMISSION_RULE_CODE` | Cross-reference to permission matrix / policy docs |
| `SECURITY_FILTER_HINT` | Textual slice/security guidance (not executable) |
| `SLA_BADGE_FIELD` | Column for SLA badge when applicable |
| `STATUS_FIELD` | Primary status column on data sheet |
| `PRIORITY_FIELD` | Priority column on data sheet |
| `IS_ENABLED` | Row active flag |
| `IS_PILOT_READY` | Pilot matrix inclusion |
| `DISPLAY_ORDER` | Sort order for catalogs |
| `NOTES` | Free text |
| `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY` | Provenance |
| `CONTRACT_VERSION` | Row contract version (e.g. `CBV_UI_CONTRACT_V1`) |

Runtime validation (`CbvUiContract_validate`) enforces baseline `SCREEN_CODE` rows, channel/screen type enums, forbidden legacy prefixes on mapping fields, AppSheet expression hygiene, and `HOME_ALERT_*` → `OPERATOR_*` mapping.
