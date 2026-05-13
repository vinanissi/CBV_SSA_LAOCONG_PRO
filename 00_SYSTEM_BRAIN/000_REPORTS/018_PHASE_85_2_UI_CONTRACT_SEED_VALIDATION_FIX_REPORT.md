# Report — Phase 85.2 UI contract seed validation fix

**Date:** 2026-05-13  
**Type:** Hotfix (seed literals in `84_UNIFIED_UI_CONTRACT_RUNTIME.js` only)

## Audit finding

`CbvUiContract_validate()` correctly failed three baseline rows after real GAS run:

| # | SCREEN_CODE | Issue |
|---|-------------|--------|
| 1 | HOME_ALERT_OPERATOR_DASHBOARD | `SECURITY_FILTER_HINT` contained `_THISUSER` (documentation text tripped scanner). |
| 2 | CBV_TEST_CONSOLE | `SORT_BY_FIELD` = `DISPLAY_ORDER` — `DISPLAY_` prefix forbidden in mapping fields. |
| 3 | ADMIN_REFERENCE_VIEWER | `SECONDARY_TEXT_FIELD` = `DISPLAY_TEXT` — same prefix rule. |

## Files inspected

- `05_GAS_RUNTIME/84_UNIFIED_UI_CONTRACT_RUNTIME.js` (baseline seeds + `CbvUiContract__scanExprFields_` / `CbvUiContract__validateForbiddenMapping_`)

## Fixes applied (code seed)

1. **HOME_ALERT_OPERATOR_DASHBOARD** — Rewrote `SECURITY_FILTER_HINT` to describe the rule without the literal substring `_THISUSER`.  
2. **CBV_TEST_CONSOLE** — `SORT_BY_FIELD`: `DISPLAY_ORDER` → `UPDATED_AT`.  
3. **ADMIN_REFERENCE_VIEWER** — `SECONDARY_TEXT_FIELD`: `DISPLAY_TEXT` → `ENUM_LABEL` (valid `ENUM_DICTIONARY` column).

`CbvUiContract_validate()` unchanged by design.

## Existing spreadsheet data

`CbvUiContract_bootstrap()` only **appends** missing `SCREEN_CODE` rows; it does **not** overwrite existing cells. After `clasp push`, either:

- Manually edit the three cells on the live `CBV_UI_CONTRACT` sheet to match the new literals, or  
- Delete the three data rows (keep header) and run **Bootstrap** again to re-append from code.

## Local tests

| Check | Result |
|--------|--------|
| `node --check 05_GAS_RUNTIME/84_UNIFIED_UI_CONTRACT_RUNTIME.js` | Run in CI / dev (see commit) |
| `node --check 05_GAS_RUNTIME/85_UNIFIED_UI_CONTRACT_TEST_CONSOLE.js` | Run in CI / dev |
| `JSON.parse(schema_manifest.json)` | OK |

## GAS test result

**Deferred** to operator after `clasp push` and sheet row refresh: Bootstrap → Validate → Health Check → Copy Latest Report.

## Warnings

- Until the sheet rows are updated, **Validate** may still fail on a spreadsheet that was seeded with the old literals.  
- `PRIORITY_FIELD` for `CBV_TEST_CONSOLE` remains `DISPLAY_ORDER` (real column on `CBV_UI_CONTRACT`); it is **not** scanned by the current forbidden-prefix mapping list. If that list expands later, revisit.

## Next step

`clasp push` → reconcile three rows on `CBV_UI_CONTRACT` → rerun Validate.

## Commit hash

_Recorded after `git commit`._
