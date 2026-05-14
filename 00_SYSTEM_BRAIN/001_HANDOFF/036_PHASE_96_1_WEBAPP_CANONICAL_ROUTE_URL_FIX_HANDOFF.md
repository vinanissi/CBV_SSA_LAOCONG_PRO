# Handoff — Phase 96.1 — WebApp canonical route URL fix

**To:** Runtime owner / Pilot lead  
**From:** Phase 96.1 implementation  
**Date:** 2026-05-14

## Scope

- Replace relative in-app `href` patterns with absolute URLs:  
  `CbvWebAppRouteUrl_getBaseUrl()` + `?route=` + `encodeURIComponent(path)`.
- **Do not** rename or add route paths (Phase 94 freeze).

## Configuration

- Default base is embedded in `998H` (`CBV_WEBAPP_ROUTE_URL_DEFAULT_BASE`).
- If deployment URL changes, set Script Property **`CBV_WEBAPP_BASE_URL`** to the full `/exec` URL (https, not `googleusercontent.com`).

## Operational checks

- Sheets: **CBV Test Console → Phase 96.1 — Route URL Fix → Run Route URL Health Check**.
- Doc checklist: `docs/webapp/WEBAPP_ROUTE_LINK_AUDIT_CHECKLIST.md`.

## Recommended next phase

- **Phase 97 — Staff trial execution / feedback capture** (per Phase 95 runbook), after deploy + nav smoke test.
