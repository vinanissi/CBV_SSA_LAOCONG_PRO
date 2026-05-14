# AI Handoff — M09 Interactive Task Runtime (local implementation)

**Date:** 2026-05-14  
**Branch:** `phase/from-v2.4.1-TASK-FIN` (expected)

## What shipped

- **999G** — `CbvInteractiveTaskRuntime_*`: marker fallback strip, `buildTaskRuntimeUrl_`, `buildActiveContext_`, `buildSession_`, `renderContextPanelHtml_`, `renderWorkboardMarkerEmbedHtml_`, `renderPage_` (template `html/WEBAPP_INTERACTIVE_TASK_RUNTIME.html`).
- **999H** — One-click test console: route query safety, clickable card, session object, context panel + empty state, AppSheet detail/form/list via `CbvAppSheetBridge_buildTaskMain*`, row-key fail-closed, SOP link, quick note preview + safe-disabled write, confirmation copy, timeline/checklist/evidence placeholders, M09 marker preflight, workboard M09 markers, M07/M08 regression, envelope + Drive six-file bundle check.
- **Routes:** `/workspace/task-runtime` (`INTERACTIVE_TASK_RUNTIME` page type); renderer branch in `94_WEBAPP_WORKSPACE_RENDERER.js`.
- **998Y** — Task cards: `cbv-m09-clickable-task-card`, `data-task-id`, optional `data-task-row-key`, title → task-runtime, primary **Mở việc**, AppSheet row actions with M09 classes (new tab), SOP with `source`, quick note hash link, legacy staff task-detail link; `buildSafeActionHtml_` optional CSS class; `m09w` embed on workboard.
- **Contracts:** `CBV_M09_INTERACTIVE_TASK_MARKER_CONTRACT.json` + `scripts/cbv-marker-contract-self-check.mjs` entry; HTML probe classes extended.
- **VI / routes:** `998F` titles + frozen routes + webApp link row; `998H` `CBV_WEBAPP_ROUTE_URL_FROZEN` includes `/workspace/task-runtime`.
- **Menu:** `90_BOOTSTRAP_MENU.js` + `90_BOOTSTRAP_MENU_WRAPPERS.js` — M09 run/copy under 🧪 CBV Test Console.
- **`.clasp.json`:** `999G` after `998Y`; `999H` after `999E`.

## Not verified here

- **GAS / Drive:** No `clasp push` or live M09/M07/M08 test menu runs from this environment — report **NOT VERIFIED ON GAS**. Do not tag production until Drive bundle shows `status=GO`, `envelopeOk=true`, `errors=[]` from the spreadsheet test console.

## Suggested next steps on deploy machine

1. `clasp push`
2. 🧪 CBV Test Console → **M09 — Run Interactive Task Runtime Test**
3. Re-run M07 and M08 tests; confirm six-file bundles under the Drive folder with new numeric prefixes.
