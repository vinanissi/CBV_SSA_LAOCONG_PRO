# Handoff — Phase 96 — WebApp Vietnamese UX / User Flow Guide

**To:** Runtime owner / Pilot lead / Staff trial  
**From:** Phase 96 implementation  
**Date:** 2026-05-14

## Scope (Phase 96)

- Vietnamese UI labels for internal WebApp pilot; **no** route renames; **no** WebApp write/mutation.  
- Canonical WebApp URL (`/exec`) in `998F` + docs — **do not** publish `googleusercontent.com` links as canonical.  
- User-flow markdown for Operator, Supervisor, Admin + UAT copy checklist.  
- Test Console submenu **only** under **CBV Test Console**.

## Vietnamese UX copy rules

- All operational safety meaning must remain: no auto assign / resolve / escalate / production claim; timeline/kanban add no drag-drop save; runtime/reports add no auto-heal.  
- `READ_FIRST` may remain a small technical badge with Vietnamese explanatory `title`/subtitle.  
- Data keys and route paths stay English per frozen contract.

## Canonical WebApp URL

`https://script.google.com/a/macros/htxdientu.com/s/AKfycbxJNx9Vw6NBRmSZx0ds7-sNAeyGo6VKTfO8PUDpcz8e7kq1o3W0eUWRP78zPfRlKXBUPA/exec`

## Routes (unchanged)

`/workspace` · `/home-alert/my-queue` · `/home-alert/sla` · `/home-alert/timeline` · `/home-alert/kanban` · `/runtime/health` · `/reports` · `/admin/reference`

## Guides created

See `docs/webapp/WEBAPP_USER_FLOW_GUIDE_VI.md` and quick guides + `WEBAPP_LINKS_AND_ROUTES_VI.md`.

## Known limitations

- WebApp remains **read-first**; AppSheet is the operational write shell.  
- Some technical labels (`STATUS`, JSON keys) remain English.  
- GAS cannot verify repo markdown files at runtime — doc presence is validated by process + Test Console logical checks.

## Recommended next phase

- **Phase 96.1 — WebApp canonical route URL fix** (absolute `/exec?route=` links; see `036_*` handoff + `docs/webapp/PHASE_96_1_*`).
- **Phase 97 — Staff Trial Execution / Feedback Capture** after 96.1 deploy + nav smoke test.
