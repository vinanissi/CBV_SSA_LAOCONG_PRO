# Phase 87 — AppSheet pilot setup binding — handoff

**To:** Admin AppSheet + Runtime owner + Pilot supervisor  
**From:** Phase 87 implementation (repo)  
**Envelope:** `CBV_TCS_V1` for Phase 87 Test Console reports

## What shipped

1. **Documentation** under `docs/appsheet/`: Phase 87 overview, view/slice/actions/security matrices, UAT script, pilot signoff checklist.
2. **GAS:** `CbvAppSheetPilot_*` matrices + `validateSetupPlan` + `healthCheck` + audit append helper; Test Console runners and dialogs.
3. **Menu:** Only under **🧪 CBV Test Console → Phase 87 — AppSheet Pilot Setup** (no business menu changes).

## Immediate actions

1. `git pull` → `clasp push` (verify `88_` / `89_` after `87_` in `filePushOrder`).
2. Spreadsheet: run **Run AppSheet Pilot Setup Health Check**; then open each matrix from the menu.
3. In AppSheet Designer: create views/slices/actions per matrices; align names to `CBV_UI_CONTRACT.APPSHEET_VIEW`.
4. Run UAT per `APPSHEET_PILOT_UAT_SCRIPT.md`; sign off with `APPSHEET_PILOT_SIGNOFF_CHECKLIST.md`.

## Constraints (do not violate)

- No AppSheet Bot; no auto assign / auto resolve / auto escalate.
- Security: `USEREMAIL()`, `USERSETTINGS("Role")`; never `_THISUSER`; no leading `=` in stored literals.
- Append-only for signoff / feedback logs.

## Next phase suggestion

After pilot UAT stabilizes: WebApp route binding smoke (Phase 86 route plan) + production readiness review (separate approval).

## AI handoff one-liner

> Apply `docs/appsheet/APPSHEET_*_MATRIX.md` and GAS `CbvAppSheetPilot_build*` output to AppSheet Designer; keep all actions manual; use `CBV_UI_CONTRACT` as naming source; run Phase 87 health check after each binding batch.
