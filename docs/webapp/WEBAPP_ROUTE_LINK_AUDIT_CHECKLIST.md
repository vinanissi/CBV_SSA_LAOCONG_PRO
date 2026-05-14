# WebApp route link audit checklist

Use before staff trial or after any change to Web App HTML, shell templates, or renderers.

## Automated

- Sheets menu: **CBV Test Console → Phase 96.1 — Route URL Fix → Run Route URL Health Check**
- Optional: **Copy Latest Report** and archive JSON.

## Manual — HTML / templates

- [ ] No `href="/` for in-app navigation (workspace, home-alert, runtime, reports, admin).
- [ ] Operational nav uses full `https://script.google.com/macros/.../exec?route=...` or equivalent from `MODEL.routeUrls` / `CbvWebAppRouteUrl_build`.
- [ ] External links (if any) intentionally absolute with correct host.

## Manual — click test (after deploy)

Open the canonical `/exec` URL, then for each primary nav item:

- [ ] Address bar or network target stays on `script.google.com/macros/.../exec` (not a surprise navigation to `googleusercontent.com` for in-app routes).
- [ ] Page loads the expected Phase 94 route (title/content).

## Regression

- [ ] `?action=ping` still returns dispatcher sanity response.
- [ ] Vietnamese labels still render when `998F` is loaded (Phase 96).
