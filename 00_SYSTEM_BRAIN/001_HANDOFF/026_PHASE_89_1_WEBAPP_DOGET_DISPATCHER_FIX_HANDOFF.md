# Handoff — Hotfix Phase 89.1 WebApp doGet Dispatcher Binding Fix

## What happened

The Web App `doGet` for Phase 89 workspace was not effective because `99_APPSHEET_WEBHOOK.js` defines `doGet` and loads later, overriding it.

## What was changed

- Phase 89 renderer (`94_WEBAPP_WORKSPACE_RENDERER.js`) no longer defines global `doGet`.
- A late dispatcher file now defines the **single effective** `doGet`:
  - `05_GAS_RUNTIME/96_WEBAPP_DOGET_DISPATCHER.js`
- `.clasp.json` `filePushOrder` places `96_` after router/webhook files.

## Supported GET params

- `?route=/workspace`
- `?route=workspace`
- `?route=/home-alert/my-queue`
- `?route=/home-alert/sla`
- `?path=/workspace`
- `?action=ping`

## Safety rules

Read-first only; no destructive writes; no production claim.

