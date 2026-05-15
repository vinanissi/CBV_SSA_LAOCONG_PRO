# AI handoff — M09.2 Focus Operation UX

## What changed

Operator-facing **task-runtime** HTML from `CbvInteractiveTaskRuntime_renderContextPanelHtml_`: hero, session block, task context grid, next-action section, quick log (single “no log” line), quick note form with `id="cbv-m09-quick-note-anchor"`, action bar, workflow nav with AppSheet record link when detail or form is `ok`, one **focus-safe-copy** banner instead of repeating long disabled copy on every control, **focus-debug-hidden** for reasons/session snapshot.

## Regression safety

- AppSheet TASK_MAIN URLs still use explicit row key via existing bridge functions.
- SOP URL still built via `CbvInteractiveTaskRuntime_buildSopUrl_`.
- New checks include `M09_FOCUS_SAFE_COPY` (forbidden phrase count) and empty-state marker presence.

## Verification

Local marker preflight **PASS**. Commit **`865e9dc`**. Run **M09 / M07 / M08** on GAS after push before claiming GO.
