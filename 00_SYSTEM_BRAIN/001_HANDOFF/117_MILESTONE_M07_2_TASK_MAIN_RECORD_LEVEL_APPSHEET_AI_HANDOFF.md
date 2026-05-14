# AI Handoff — 117 — M07.2 TASK_MAIN record-level AppSheet deeplink

## Status

- **Code:** Implemented on branch `phase/from-v2.4.1-TASK-FIN`.
- **Local:** Marker contract self-check PASS.
- **GAS:** **NOT VERIFIED** — deploy with `clasp push`, then run M07 + M08 one-click tests and confirm new Drive report prefixes (6 files each), `status=GO`, `envelopeOk=true`, `warnings=[]`, `errors=[]`.

## Resolver

- Reads `CBV_APPSHEET_TASK_MAIN_*` and `_TEMPLATE` keys (legacy non-template keys as fallback).
- Runtime fallback in `CbvAppSheetBridge__runtimeFallbackUrls_()` matches official `/start/` URLs with `{{TASK_ROW_KEY}}`; form template uses `TASK_MAIN_FORM_PRO` (corrected from copy-paste risk on detail view name).
- `getConfig_()` adds `taskMainUrl`, `taskMainDetailUrlTemplate`, `taskMainFormUrlTemplate` without removing `TASK_MAIN*` fields.

## Row key

- `CbvAppSheetBridge_resolveTaskRowKey_(task)` — non-mutating; order per spec; last resort `taskId` / sheet ids.
- Pilot cards may expose `taskRowKey`, `TASK_MAIN_ID`, `TASK_ID`; `CbvStaffWorkspace_normalizeTaskRow_` sets `taskRowKey` when present.

## UI

- Workboard task card: title links to AppSheet detail when link builds; row shows `Mở chi tiết` / `Xử lý ngay` / `Mở AppSheet`.
- M07 ribbon: same labels + `list` mode first; `buildDeepLink_` supports `mode: 'list'` without `taskId`.

## Tests (999C)

New/updated checks include: `M07_APP_SHEET_RUNTIME_CONTRACT`, `M07_TASK_MAIN_URL_CONFIGURED`, `M07_TASK_MAIN_DETAIL_TEMPLATE`, `M07_TASK_MAIN_FORM_TEMPLATE`, `M07_TASK_ROW_KEY_RESOLVER`, `M07_DETAIL_DEEPLINK_RECORD_LEVEL`, `M07_FORM_DEEPLINK_RECORD_LEVEL`, `M07_NO_EDITOR_URL`, `M07_LIST_DEEPLINK`. `M07_APP_SHEET_RUNTIME` remains in `CbvAppSheetLiveBridge_runHealth_()` (999B).

## Next step

1. `clasp push`
2. Script Properties: set the three canonical keys in the target deployment, or rely on tier-2 fallback for dev.
3. Run M07 + M08 test consoles; attach Drive evidence; then tag if policy allows.
