# Report — Hotfix Phase 89.2 Force Final WebApp doGet Dispatcher

## Issue evidence

After deploy:

- `?action=ping` → `{"ok":true,"code":"PONG","message":"Webhook active"}`
- `?route=/workspace` → `{"ok":false,"code":"GET_NOT_SUPPORTED"}`

Meaning: legacy `doGet` still effective.

## Fix summary

- Added `05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js`
- Moved it to be **last** in `.clasp.json filePushOrder`
- Neutralized Phase 89.1 dispatcher by renaming its global `doGet` to `CbvWebAppWorkspace__doGetDispatcher96_`
- Updated `CLASP_PUSH_ORDER.md`

Final `doGet` rules:

- If `route`/`path` exists → `CbvWebAppWorkspace_doGet(e)`
- If `action=ping` → `code=PING`, `handler=999_WEBAPP_DOGET_DISPATCHER_FINAL`
- Else → `GET_NOT_SUPPORTED`, `handler=999_WEBAPP_DOGET_DISPATCHER_FINAL`

## Local tests

- `node --check 05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js`

## Deploy steps (required)

1. `clasp push`
2. Apps Script → Deploy → Manage deployments → Edit → Version: **New version** → Deploy

## Expected verification

- `?action=ping` → `code=PING`, `handler=999_WEBAPP_DOGET_DISPATCHER_FINAL`
- `?route=/workspace` → HTML shell
- `?route=workspace` → HTML shell
- `?path=/workspace` → HTML shell

## Commit hash

`<placeholder>`

