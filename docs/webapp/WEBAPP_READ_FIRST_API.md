# WebApp Read-first API (Phase 89)

## Contract

All APIs are **read-first** and must not perform destructive writes.

Response envelope:

```js
{
  ok,
  data,
  warnings,
  errors,
  checkedAt
}
```

## API list (Phase 89)

- `CbvWebAppWorkspace_getRouteRegistry()`
- `CbvWebAppWorkspace_getRoute(route)`
- `CbvWebAppWorkspace_getHomeSummary()`
- `CbvWebAppWorkspace_getMyQueueSummary(userEmail)`
- `CbvWebAppWorkspace_getSlaSummary()`
- `CbvWebAppWorkspace_getRuntimeHealthSummary()`
- `CbvWebAppWorkspace_validate()`

## Safety rules (explicit)

- No destructive writes.
- No auto assign.
- No auto resolve.
- No auto escalate.
- No production claim.

Implementation:

- `05_GAS_RUNTIME/93_WEBAPP_WORKSPACE_API.js`

