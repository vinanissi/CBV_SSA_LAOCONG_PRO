# HOTFIX PHASE 89.2 — FORCE FINAL WebApp doGet Dispatcher — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Issue (after deploy)

- `?action=ping` returns: `{"ok":true,"code":"PONG","message":"Webhook active"}`
- `?route=/workspace` returns: `{"ok":false,"code":"GET_NOT_SUPPORTED"}`

Conclusion: legacy `99_APPSHEET_WEBHOOK.js` `doGet` is still effective.

## Mission

Make WebApp dispatcher the **absolute final** global `doGet(e)` by:

1. Creating `05_GAS_RUNTIME/999_WEBAPP_DOGET_DISPATCHER_FINAL.js`
2. Placing it **last** in `.clasp.json filePushOrder`
3. Implementing final routing rules:
   - route/path → `CbvWebAppWorkspace_doGet(e)`
   - action=ping → JSON `{ ok:true, code:"PING", handler:"999_WEBAPP_DOGET_DISPATCHER_FINAL" }`
   - else → GET_NOT_SUPPORTED with handler marker
4. Neutralizing global `doGet` in `96_WEBAPP_DOGET_DISPATCHER.js` to remove ambiguity.

Deploy note:

After `clasp push`, create a **new Web App deployment version** in Apps Script (Deploy → Manage deployments → Edit → New version → Deploy).

