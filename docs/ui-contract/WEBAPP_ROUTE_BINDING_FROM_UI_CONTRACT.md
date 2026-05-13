# WebApp route binding from CBV_UI_CONTRACT

## Data model

Each WebApp-oriented row exposes:

- `WEBAPP_ROUTE` — stable path key (e.g. `/home-alert/kanban`).
- `SCREEN_TYPE` — renderer hint (`KANBAN`, `TIMELINE`, `HEALTH`, …).
- `DATA_SOURCE_SHEET` + `PRIMARY_KEY_FIELD` — how to load entities.
- Display columns (`PRIMARY_TEXT_FIELD`, …) — which fields to show in cards; for `HOME_ALERT_*` these are always `OPERATOR_*` fields.

## Builder helpers

- `CbvUiContract_buildWebAppRouteMap()` returns `{ routes: [...] }` for a manifest-driven router.
- `CbvUiContract_getWebAppContracts()` returns `WEBAPP` + `BOTH` rows with `IS_ENABLED` true.

## Implementation notes

- Routes are **metadata only** in Phase 85; no WebApp UI rewrite is required to complete the phase.
- Future WebApp pages should read the sheet (or exported JSON) at deploy time for codegen, or fetch at runtime for admin-only tools.
