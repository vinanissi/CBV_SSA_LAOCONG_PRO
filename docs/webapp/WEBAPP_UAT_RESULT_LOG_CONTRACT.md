# WebApp UAT Result Log Sheet Contract

Optional sheet contract for storing Phase 95 staff-trial feedback rows. Phase 95 does **not** auto-create this sheet; the team must prepare it manually if they choose this storage mode.

---

## 1. Why optional

Per the CBV core rules:

- **Manual-first → Auto-later.** A new sheet should not be auto-created until an explicit future phase opts into it.
- **No destructive migration.** Existing data must never be overwritten.
- **Audit-first.** Sheet operations must be transparent and append-only.

If teams prefer a doc-based capture (Markdown / Google Doc), they may skip this contract entirely.

## 2. Sheet name

Recommended: `WEBAPP_UAT_RESULTS`.

If multiple pilots are run, suffix with the pilot date: `WEBAPP_UAT_RESULTS_2026Q2`. Never rename a sheet retroactively.

## 3. Column contract

Columns match `WEBAPP_UAT_FEEDBACK_SCHEMA.md` exactly (left-to-right):

`UAT_ID | SESSION_ID | TEST_DATE | TESTER_EMAIL | TESTER_ROLE | ROUTE | DEVICE_TYPE | SCENARIO | RESULT | SEVERITY | SPEED_RATING | USABILITY_RATING | CONFUSION_POINT | ERROR_MESSAGE | SUGGESTED_FIX | IS_BLOCKER | CREATED_AT`

Header row in row 1. Data starts at row 2.

## 4. Behaviour rules

1. **Append-only.** No row may be deleted or overwritten. Follow-up rows reference the original via free-text (e.g. `SUGGESTED_FIX = "supersedes UAT-2026-05-13-001"`).
2. **No formulas** in data cells unless they reference only the same row (e.g. `IS_BLOCKER = SEVERITY="BLOCKER"` is acceptable but a static value is preferred).
3. **No conditional formatting that masks data.** Visual highlighting is OK; data must remain readable.
4. **No sheet-protection** that prevents read access to operators / supervisors / admins.
5. **No auto-create.** Phase 95 runtime never creates this sheet. A future phase may, **only with an explicit decision file**.

## 5. Validation

If a team chooses the sheet mode, a simple validator (operator-runnable) should confirm:

- All 17 columns exist.
- Column header names match exactly.
- `IS_BLOCKER` column values are `TRUE` only when `SEVERITY = BLOCKER`.
- `RESULT` column values are one of `PASS / WARN / FAIL`.

Phase 95 does not ship this validator (runbook phase only). A future phase may add a `CbvWebAppUat_validateResultSheet_()` helper.

## 6. Archive policy

- After signoff, export the sheet to CSV + JSON.
- Store the export under `00_SYSTEM_BRAIN/001_HANDOFF/` alongside the filled signoff template.
- Original sheet remains in place (append-only audit).

## 7. Cross-references

- Schema: `WEBAPP_UAT_FEEDBACK_SCHEMA.md`.
- Triage rules: `WEBAPP_UAT_ISSUE_TRIAGE_MATRIX.md`.
- Go/No-Go criteria: `WEBAPP_PILOT_GO_NO_GO_CRITERIA.md`.
- Signoff: `WEBAPP_PILOT_SIGNOFF_TEMPLATE.md`.
