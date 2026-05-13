# WebApp route pilot binding checklist

Use with `CBV_UI_CONTRACT` rows where `CHANNEL` is `WEBAPP` or `BOTH`. Cross-check `CbvUiPilotBinding_buildWebAppRoutePlan()` in GAS.

## 1. Route map

- [ ] Every required `WEBAPP_ROUTE` (leading `/` recommended) has a corresponding **route registration** in your WebApp host project (or a documented stub).
- [ ] `SCREEN_CODE` and `SCREEN_TYPE` are logged next to each route for debugging.

## 2. Data source

- [ ] Each route’s handler reads only `DATA_SOURCE_SHEET` / `PRIMARY_KEY_FIELD` / display fields as described in the contract row (read-first for pilot).

## 3. Minimum behavior (pilot)

- [ ] **Read-first:** list or detail view loads without destructive writes.
- [ ] Mutations (if any) require explicit user gesture; no background auto job from this binding layer.

## 4. Role scope

- [ ] Routes that reference `USER_ROLE` = `ADMIN` (or similar) are protected at the WebApp or gateway layer.

## 5. No destructive writes

- [ ] No bulk delete, purge, or schema change from pilot routes.
- [ ] No installation of triggers from pilot pages.

## 6. Skeleton expectation

- [ ] HTTP 404 or “Coming soon” is acceptable for skeleton routes **only** if the pilot plan documents it; prefer a minimal read-only page when possible.

## 7. After pilot

- [ ] Align route implementations with feedback; keep `CBV_UI_CONTRACT` as the naming source of truth.
