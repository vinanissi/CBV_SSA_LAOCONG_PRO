# Prompt — Phase 96.1 — WEBAPP CANONICAL ROUTE URL FIX

**Archived:** 2026-05-14  
**Repo:** `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`

The authoritative execution brief for this phase is preserved in the **original Cursor user message** for this task (same session): absolute `https://script.google.com/macros/s/…/exec?route=…` links, no route mutations, helper `998H`, Test Console `998I`, docs `036_*`, menu + wrappers, `.clasp.json` order, renderer and HTML updates.

**Summary intent (short):**

- Fix iframe-relative `href` resolving under `googleusercontent.com`.
- Add `998H` (`CbvWebAppRouteUrl_*`) and `998I` (CBV_TCS_V1 Test Console); load `998H`/`998I` before `96_WEBAPP_DOGET_DISPATCHER.js`.
- Wire `998F`, `94`, `98`, home HTML to `CbvWebAppRouteUrl_build` / `MODEL.routeUrls` when helper is present.
- Optional override: Script Property `CBV_WEBAPP_BASE_URL`.
- Read-only; Phase 94 route paths unchanged.

**Canonical base (default):**

`https://script.google.com/macros/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec`
