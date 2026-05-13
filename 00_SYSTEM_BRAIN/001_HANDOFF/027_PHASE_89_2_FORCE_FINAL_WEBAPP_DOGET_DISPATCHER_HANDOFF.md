# Handoff — Hotfix Phase 89.2 Force Final WebApp doGet Dispatcher

## What was wrong

Legacy webhook module defined `doGet` and remained the effective handler after deploy, so `?route=/workspace` returned `GET_NOT_SUPPORTED`.

## What was changed

- Created `05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js` as the **final** global `doGet`.
- Updated `.clasp.json filePushOrder` to place `999_...` **last**.
- Neutralized `96_WEBAPP_DOGET_DISPATCHER.js` by renaming its `doGet` to a non-global helper.

## How to verify

After `clasp push`, create **new Web App deployment version**, then:

- `?action=ping` should return `code=PING` and `handler=999_WEBAPP_DOGET_DISPATCHER_FINAL`
- `?route=/workspace` should render HTML shell

