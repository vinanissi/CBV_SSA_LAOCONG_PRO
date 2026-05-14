# AI Handoff — 104 Phase 208 (Milestone 02 VI validate fix)

**Append-only** · 2026-05-14

## Symptom

`103_MILESTONE_02_STAFF_WORKSPACE_*` reports `VI_VALIDATE` ERROR and `envelopeOk=false` while other M02 checks passed.

## Fix

1. **998F** — Replace hardcoded nav count `11` with `CBV_WEBAPP_VI_NAV_PAIRS.length` (13). Refactor `CbvWebAppVi_getNavItems()` to iterate that constant. Enrich `CbvWebAppVi_validate` `detail` with `missingRoutes`, `missingLabels`, nav counts, key counts. Extend `frozen` list for staff routes.
2. **998R** — On `VI_VALIDATE` failure, attach `CbvTcsMilestone02StaffWorkspace__viValidateDetail_(vu)` (samples of errors/warnings, flags).
3. **998G** — Update frozen route-path expectation used by `ROUTE_PATHS_UNCHANGED` so Phase 96 test matches registry after M02.

## Operator next step

`clasp push` → Sheet → **Run Milestone 02 Staff Workspace Test** → confirm new `104_MILESTONE_02_STAFF_WORKSPACE_*` bundle with `VI_VALIDATE` OK and `envelopeOk=true`.

## Do not

- Overwrite or delete `103_*` Drive files.
- Tag until Drive evidence for `104_*` is GO or GO_WITH_WARNINGS with `envelopeOk=true`.
