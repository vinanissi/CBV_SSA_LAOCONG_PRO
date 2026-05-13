# Handoff — Phase 85.2 UI contract seed validation fix

**Date:** 2026-05-13

## What changed (code)

File `05_GAS_RUNTIME/84_UNIFIED_UI_CONTRACT_RUNTIME.js` — baseline seed only:

| SCREEN_CODE | Field | Old → New |
|-------------|-------|-----------|
| HOME_ALERT_OPERATOR_DASHBOARD | SECURITY_FILTER_HINT | Removed literal `_THISUSER` substring; still instructs USEREMAIL() / USERSETTINGS("Role"). |
| CBV_TEST_CONSOLE | SORT_BY_FIELD | `DISPLAY_ORDER` → `UPDATED_AT` |
| ADMIN_REFERENCE_VIEWER | SECONDARY_TEXT_FIELD | `DISPLAY_TEXT` → `ENUM_LABEL` |

Validation logic **not** weakened.

## What you must do on the bound spreadsheet

Bootstrap is **append-only by `SCREEN_CODE`**. Rows already written with old text **stay wrong** until:

1. **Option A:** Edit the three cells directly to match the repo seed, or  
2. **Option B:** Delete only those three data rows (not the header row), then **Bootstrap UI Contract** again.

## After `clasp push`

1. **🧪 CBV Test Console → Phase 85 — UI Contract**  
2. Reconcile sheet (above)  
3. **Bootstrap** (if you deleted rows)  
4. **Validate** (expect `ok=true`)  
5. **Health Check**  
6. **Copy Latest Report**

## References

- Prompt: `000_PROMPTS/018_PHASE_85_2_UI_CONTRACT_SEED_VALIDATION_FIX_PROMPT.md`  
- Report: `000_REPORTS/018_PHASE_85_2_UI_CONTRACT_SEED_VALIDATION_FIX_REPORT.md`
