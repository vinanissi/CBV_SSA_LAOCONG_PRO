# WebApp canonical route URL standard

**Applies to:** CBV WebApp (Phase 94 frozen routes, Phase 96.1 implementation).  
**Runtime:** `05_GAS_RUNTIME/998H_WEBAPP_ROUTE_URL_HELPER.js`

## Canonical base (`WEBAPP_URL`)

Default base (no configuration):

```
https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec
```

Rules:

- Must be `https://`.
- Must **not** use `googleusercontent.com` as the canonical shareable base.
- Should end with `/exec` (helper normalizes trailing path to `/exec` when possible).

## Override

Script Property key: **`CBV_WEBAPP_BASE_URL`**

Set to the full `/exec` URL of the deployed Web App if the default ID ever changes. The helper reads **Script Properties** (not document properties).

## Building a link

1. Normalize the route path (leading slash, Phase 94 path only), e.g. `/home-alert/my-queue`.
2. Append query: `?route=` + `encodeURIComponent(route)`.

Example:

```
WEBAPP_URL + '?route=' + encodeURIComponent('/workspace')
```

In GAS: `CbvWebAppRouteUrl_build('/workspace')`.

## Frozen route paths (do not rename)

| Logical key | Path |
|-------------|------|
| workspace | `/workspace` |
| myQueue | `/home-alert/my-queue` |
| sla | `/home-alert/sla` |
| timeline | `/home-alert/timeline` |
| kanban | `/home-alert/kanban` |
| runtimeHealth | `/runtime/health` |
| reports | `/reports` |
| adminReference | `/admin/reference` |

Dispatcher ping (unchanged): `?action=ping` on the same base.

## Anti-patterns

- `href="/anything"` inside Web App HTML served in the iframe — resolves on the wrong host.
- Publishing `googleusercontent.com` URLs as the official staff link.
- Omitting `encodeURIComponent` on `route` (breaks on reserved characters).
