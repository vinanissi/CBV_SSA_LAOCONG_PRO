# Report — Hotfix Phase 89.1 WebApp doGet Dispatcher Binding Fix

## doGet definitions found

- `05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js` (Phase 89 renderer)
- `05_GAS_RUNTIME/99_APPSHEET_WEBHOOK.js` (legacy webhook GET)

## Root cause

`99_APPSHEET_WEBHOOK.js` loads **after** `94_WEBAPP_WORKSPACE_RENDERER.js` in `.clasp.json` `filePushOrder`, so its `doGet` overrides the WebApp workspace handler, returning `GET_NOT_SUPPORTED` for `?route=...`.

## Fix

- Removed global `doGet` from `94_WEBAPP_WORKSPACE_RENDERER.js` (kept `CbvWebAppWorkspace_doGet`).
- Added late-bound dispatcher: `05_GAS_RUNTIME/96_WEBAPP_DOGET_DISPATCHER.js`
- Updated `.clasp.json` push order so `96_` loads after `61_UNIFIED_ROUTER.js`.
- Updated `CLASP_PUSH_ORDER.md` excerpt.

Dispatcher rules:

- If `route`/`path` param exists → `CbvWebAppWorkspace_doGet(e)`
- If `action=ping` → preserve ping response (prefer legacy webhook response if available)
- Else → `GET_NOT_SUPPORTED` with supported params list

## Local tests

- `node --check 05_GAS_RUNTIME/94_WEBAPP_WORKSPACE_RENDERER.js`
- `node --check 05_GAS_RUNTIME/96_WEBAPP_DOGET_DISPATCHER.js`

## Deploy + verification

After `clasp push`, verify URLs:

- `?action=ping`
- `?route=/workspace`
- `?route=workspace`
- `?route=/home-alert/my-queue`
- `?route=/home-alert/sla`
- `?path=/workspace`

## Commit hash

`<placeholder>`

