# Phase 96.1 — WebApp canonical route URL fix

**Status:** Pilot tier — navigation hardening only.  
**Date:** 2026-05-14  
**Depends on:** Phase 94 route freeze (paths unchanged), Phase 96 Vietnamese copy layer (`998F` / `998G`).

## Problem

Web Apps are often rendered inside a `script.googleusercontent.com` iframe. Relative links such as `href="/workspace"` or `href="/home-alert/my-queue"` resolve against **that** host, not the Apps Script deployment URL. Users leave the intended `/macros/s/…/exec` context and deep links break or behave inconsistently.

## Solution

- Introduce read-only helper `998H_WEBAPP_ROUTE_URL_HELPER.js` with `CbvWebAppRouteUrl_getBaseUrl()`, `CbvWebAppRouteUrl_normalizeRoute()`, `CbvWebAppRouteUrl_build(route)`.
- Every in-app navigation `href` is built as:  
  `BASE + '?route=' + encodeURIComponent(route)`  
  where `BASE` defaults to the canonical `/macros/s/…/exec` URL and may be overridden via Script Property `CBV_WEBAPP_BASE_URL`.
- Renderers (`94`, `98`), Vietnamese copy (`998F` when helper present), and pilot/legacy home HTML consume `CbvWebAppRouteUrl_build` or `MODEL.routeUrls` derived from it.
- Test Console `998I_WEBAPP_ROUTE_URL_TEST_CONSOLE.js` (menu: **CBV Test Console → Phase 96.1 — Route URL Fix**) validates helper presence, base URL shape, sample `build()`, and nav absoluteness.

## Out of scope

- No new routes, no renames, no write/mutation APIs, no AppSheet changes.
- No claim of production readiness.

## References

- `docs/webapp/WEBAPP_CANONICAL_ROUTE_URL_STANDARD.md`
- `docs/webapp/WEBAPP_ROUTE_LINK_AUDIT_CHECKLIST.md`
- `docs/webapp/WEBAPP_LINKS_AND_ROUTES_VI.md`
