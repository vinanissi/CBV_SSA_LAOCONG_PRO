# WebApp Admin Reference — Data Binding (Phase 93)

Read-first governance binding for `/admin/reference`. No mutation paths exist from the WebApp into any of these sources.

---

## 1. Source sheets

| Sheet | Required by | Behavior if missing |
|-------|-------------|---------------------|
| `ENUM_DICTIONARY` | Enum summary | Warning only (count=0) |
| `USER_DIRECTORY` | User/role summary | Warning only |
| `MASTER_CODE` | Governance summary | Warning only |
| `DON_VI` | Governance summary | Warning only |
| `TEAM_DIRECTORY` | User/role summary | Warning only |
| `ROLE_PERMISSION_MATRIX` | User/role summary | Warning only |
| `FEATURE_FLAG` | Feature flag summary | Warning only |
| `SYSTEM_REGISTRY` | System registry summary | Warning only |
| `CBV_UI_CONTRACT` | UI contract summary (via `CbvUiContract_getAll()`) | Warning only |

The validator scans column headers; any column whose name matches `SECRET`, `TOKEN`, `APIKEY`, `API_KEY`, `PRIVATE_KEY`, `PASSWORD`, `PASS_HASH`, `CLIENT_SECRET`, `WEBHOOK_SECRET`, `BEARER`, `OAUTH_TOKEN` is flagged. Their **values are never rendered** — Phase 93 only shows the column name + a warning.

## 2. Field mapping

### Governance summary (`CbvWebAppAdminRef_getGovernanceSummary`)

```
{
  ok, data: {
    status: 'GO' | 'GO_WITH_WARNINGS',
    severity: 'OK' | 'WARNING',
    sheets: [{ code, name, exists, rowCount, severity, note }],
    totals: { enums, users, roles, teams, featureFlags, systems, uiContracts, routes },
    warnings, errors
  },
  warnings, errors, checkedAt
}
```

### Enum summary (`CbvWebAppAdminRef_getEnumSummary`)

Reads `ENUM_DICTIONARY`. Filters out `IS_ACTIVE=false` and `IS_DELETED=true`.

```
data: { count, groups: [{ enumType, count, sampleValues: [string] }] }
```

`enumType` is derived from `ENUM_GROUP` (fallback `ENUM_CODE` or `(ungrouped)`).  
`sampleValues` uses `ENUM_VALUE` (fallback `ENUM_LABEL` or `DISPLAY_TEXT`).

### User / role summary (`CbvWebAppAdminRef_getUserRoleSummary`)

Reads `USER_DIRECTORY`, `TEAM_DIRECTORY`, `ROLE_PERMISSION_MATRIX`.  
Emails are masked using `CbvWebAppAdminRef__maskEmail_()` → `o***x@domain`.

```
data: {
  usersCount, teamsCount, rolesCount,
  users: [{ email, displayName, role, teamCode, status }],
  roles: [{ roleCode, permissions, modules: [string] }]
}
```

### Feature flag summary (`CbvWebAppAdminRef_getFeatureFlagSummary`)

Reads `FEATURE_FLAG`. Owner emails are masked.

```
data: { count, enabledCount, disabledCount, flags: [{ featureCode, enabled, owner, note }] }
```

**No toggle controls** are rendered. Phase 93 never writes to this sheet.

### System registry summary (`CbvWebAppAdminRef_getSystemRegistrySummary`)

Reads `SYSTEM_REGISTRY`. If a header matches secret patterns, a warning is emitted; values are not surfaced.

```
data: { count, systems: [{ systemCode, moduleCode, status, owner, note }] }
```

### UI contract summary (`CbvWebAppAdminRef_getUiContractSummary`)

Wraps `CbvUiContract_getAll()` (Phase 85). Aggregates by `CHANNEL` and `SCREEN_TYPE`. Counts `IS_PILOT_READY` / `PILOT_READY` truthy rows.

```
data: { count, byChannel, byScreenType, pilotReadyCount, contracts: [{
  screenCode, screenName, channel, screenType, moduleCode, webAppRoute, appSheetView, isPilotReady
}] }
```

### Route registry summary (`CbvWebAppAdminRef_getRouteRegistrySummary`)

Wraps `CbvWebAppWorkspace_getRouteRegistry()` / `CbvWebAppWorkspace_routeRegistry()` (Phase 89). Aggregates by `mode` and `pageType`. Read-first count = entries with `mode === 'READ_FIRST'`.

```
data: { count, readFirstCount, pilotReadyCount, byMode, byPageType, routes: [{
  route, title, pageType, mode, requiredRole, screenCode, isEnabled, isPilotReady
}] }
```

## 3. Missing-sheet behavior

- Missing reference sheet → `data.sheets[code].exists = false`, severity `WARNING`, `warnings[]` contains a human-readable string.
- The page still renders the remaining sections.
- No auto-create. No mutation.

## 4. Masking rules

- Emails → `o***x@domain` form.
- Secret-pattern column values → never written to the response; instead `data.secretColumns` lists `Sheet.Column`, and a top-level warning surfaces.
- Long arrays are sample-capped (`sampleSize` option, defaults 5/25/50 per section).
- The renderer does not echo unmasked raw values from `Object.entries` — every helper goes through the per-section data adapter.

## 5. Read-first guarantees

- `997_*.js` exposes only `_get*Summary()` + `_validate()`. Validator scans the `CbvWebAppAdminRef_*` namespace for verb-prefixed mutation names (`set*`, `update*`, `create*`, `delete*`, `toggle*`, `enable*`, `disable*`, `grant*`, …). Any new function whose action starts with one of those verbs would fail the Phase 93 `NO_WRITE_MUTATION` test.
- `998_*.js` only emits HTML; it has no `google.script.run` write actions, no form submission, no AppSheet deeplinks that would mutate config.
- `998A_*.js` runs the Test Console; its alerts/dialogs are read-only.

## 6. Performance / safety caps

- Row limits per probe (rough): governance row counts; enum 5000; users 2000; roles 1000; flags 2000; systems 2000.
- `CbvWebAppAdminRef_validate()` is safe to call on every page load; it’s O(sheets) and does not block on missing data.
