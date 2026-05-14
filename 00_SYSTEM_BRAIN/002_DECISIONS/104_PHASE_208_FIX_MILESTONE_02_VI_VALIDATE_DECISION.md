# Decision log — 104 Phase 208 (Milestone 02 VI validate)

**Append-only** · 2026-05-14

## D-104-1 — Nav count source of truth

**Decision:** Introduce `CBV_WEBAPP_VI_NAV_PAIRS` and derive both `CbvWebAppVi_getNavItems()` and the validate nav-count / label checks from it.

**Rationale:** Eliminates magic number drift when adding operational nav entries.

## D-104-2 — VI `detail` field names

**Decision:** Use `labelKeyNames` / `routeKeyNames` internally only as needed; expose counts as `labelKeysCount` / `routeKeysCount` plus `missingRoutes` / `missingLabels` for audits.

**Rationale:** Old `detail.labelKeys` held full key arrays and was easy to misread as “missing keys”; counts + explicit missing arrays are clearer for Test Console reports.

## D-104-3 — Phase 96 route freeze string

**Decision:** Update `998G` expected sorted registry string to include staff routes.

**Rationale:** Registry legitimately grew; the test should reflect current frozen route set, not hide drift.
