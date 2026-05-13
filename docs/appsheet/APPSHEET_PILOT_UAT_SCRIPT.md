# AppSheet pilot UAT script

Roles: **Admin** (Designer + accounts), **Supervisor**, **Operator**.  
Record results in `PILOT_FEEDBACK_FORM_SCHEMA.md` (or equivalent sheet).

## Pass / warn / fail

| Result | Meaning |
|--------|---------|
| **PASS** | Behavior matches matrix + manual; no policy leak |
| **WARN** | UX friction or doc mismatch; not blocking pilot |
| **FAIL** | Security leak, wrong row set, or automation/bot observed |

## Admin flow

1. Verify `CBV_UI_CONTRACT` rows for HOME_ALERT have `APPSHEET_VIEW` filled.
2. Create views/slices/actions per `APPSHEET_*_MATRIX.md`.
3. Run GAS **Phase 87 — AppSheet Pilot Setup Health Check**; capture JSON if needed.
4. **Expected:** Status GO or GO_WITH_WARNINGS; no FAIL.
5. **Speed/usability:** note time to complete Designer setup vs estimate (for feedback).

## Supervisor flow

1. Open **Escalated** and **SLA** views with supervisor account.
2. Confirm row sets match escalation/SLA columns; no auto-resolve when time passes.
3. Open **Blocked** queue; confirm `IS_BLOCKED` rows only.
4. **FAIL** if operator-only rows appear without policy reason.

## Operator flow

1. **Unassigned:** run **CLAIM** once; row moves to **My Queue**; no second row auto-assigned.
2. **My Queue:** **IN_PROGRESS** then **RESOLVE** (with confirm); statuses update.
3. **ACK** on a new alert if configured.
4. **RELEASE** returns row to pool where permitted.
5. **FAIL** if any action runs without tap (bot) or assignee changes without CLAIM.

## Observation

- Rate **speed** (1–5) and **usability** (1–5) per screen in pilot feedback.
- Capture **confusion points** and **suggested fix** for Phase 88+ doc iteration.
