# CBV Unified UI Contract (Phase 85)

**Reference:** CBV Operational Ecosystem Standard V1  
**Sheet:** `CBV_UI_CONTRACT` (see `CBV_SCHEMA_MANIFEST` / `06_DATABASE/schema_manifest.json`)  
**Runtime:** `05_GAS_RUNTIME/84_UNIFIED_UI_CONTRACT_RUNTIME.js`, `85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js`

## Why a hybrid UI

- **AppSheet** is the operational shell: fast, stable, mobile-friendly CRUD, queues, and day-to-day operator actions.
- **GAS WebApp** is the advanced surface: dashboards, timelines, Kanban, runtime health, test consoles, reports, and future AI-assisted review—implemented as code with full layout control.

This phase does **not** replace either channel. It introduces a **single metadata contract** both surfaces can read.

## Screen ownership (rule of thumb)

| Pattern | Owner |
|--------|--------|
| High-frequency data entry and status updates | AppSheet |
| Monitoring, analytics, cross-table views, QA, governance readers | WebApp |
| Same logical screen in both places | `CHANNEL = BOTH` |

Important screens may be `BOTH`: operators use AppSheet; supervisors or admins may use WebApp for a richer view of the same `DATA_SOURCE_SHEET`.

## How `CBV_UI_CONTRACT` drives work

1. **AppSheet:** `APPSHEET_VIEW`, `APPSHEET_DEEPLINK_EXPR`, `SECURITY_FILTER_HINT`, `ALLOWED_ACTIONS_JSON`, and operator field pointers (`PRIMARY_TEXT_FIELD` → `OPERATOR_PRIMARY_TEXT`, etc.) document binding intent. See `APPSHEET_BINDING_FROM_UI_CONTRACT.md` (note filename in repo).
2. **WebApp:** `WEBAPP_ROUTE`, `SCREEN_TYPE`, and `PRIMARY_KEY_FIELD` form a route/card contract for future UI code.
3. **Pilot:** `IS_PILOT_READY` plus `CHANNEL` feed `CbvUiContract_generatePilotMatrix()` for rollout planning.
4. **Future codegen:** Rows are stable IDs (`UI_CONTRACT_ID`); treat `CONTRACT_VERSION` as the row schema version.

## Operator display (non-negotiable)

For all `HOME_ALERT_*` screen codes, mapping fields **must** reference:

- `OPERATOR_PRIMARY_TEXT`, `OPERATOR_SECONDARY_TEXT`, `OPERATOR_META_TEXT`, `OPERATOR_NEXT_ACTION`
- `OPERATOR_DASHBOARD_GROUP`, `OPERATOR_DASHBOARD_SORT`

Do **not** point UI contract mapping columns at legacy `DISPLAY_*`, `CARD_*`, `UX_*`, or `DESKTOP_*` HOME_ALERT columns for new work.

## AppSheet expression hygiene

- Expressions stored for AppSheet must **not** start with `=`.
- Do **not** use `_THISUSER`; use `USEREMAIL()` and `USERSETTINGS("Role")` (and equivalent documented patterns).

## What not to do

- No AppSheet Bot; no uncontrolled automation.
- No auto assign, auto resolve, or auto escalate (ecosystem rules unchanged).
- No destructive migration or overwriting historical audit/report/handoff artifacts.
- No phase jump: this layer documents and validates; it does not silently change production behavior.

## QA

Sheets menu: **🧪 CBV Test Console → Phase 85 — UI Contract**. Functions: `CbvUiContract_bootstrap`, `CbvUiContract_validate`, `CbvUiContract_healthCheck`, `CbvUiContract_TestConsole_run`.

Append-only audit summaries for test runs use `CbvUiContract_appendReportAudit_` → `ADMIN_AUDIT_LOG` (truncated payload).
