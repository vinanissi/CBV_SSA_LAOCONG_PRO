# Pilot operator test script (1 admin + 1 supervisor + 1–2 operators)

**Purpose:** Repeatable smoke for HOME_ALERT + `CBV_UI_CONTRACT` pilot binding.  
**Pass:** All critical steps complete with no security regression. **Warn:** UX friction only. **Fail:** Wrong-role data exposure or unintended state change.

---

## Admin test flow

| Step | Action | Expected |
|------|--------|----------|
| A1 | Open AppSheet as admin; open each `APPSHEET_VIEW` from contract | Views load; no formula errors referencing `_THISUSER` or leading `=` in contract-driven docs |
| A2 | Run GAS **Phase 86 — Pilot Binding → Health Check** | `GO` or `GO_WITH_WARNINGS`; envelope OK |
| A3 | Open WebApp stub routes for `WEBAPP_ROUTE` entries | Read-only or documented stub; no destructive API |
| A4 | Verify `ADMIN_AUDIT_LOG` receives pilot binding audit rows when health/test run (if configured) | Optional; non-fatal if missing |

**Fail if:** compile errors, missing critical views without a documented waiver.

---

## Supervisor test flow

| Step | Action | Expected |
|------|--------|----------|
| S1 | Open escalated / blocked / SLA views | Counts plausible; filters match role |
| S2 | Attempt to open operator-only slice with supervisor account | Denied or empty per policy |
| S3 | Escalation visibility | Human escalation visible; **no** silent auto-escalation from UI |

**Fail if:** cross-role leakage on two test accounts.

---

## Operator test flow

| Step | Action | Expected |
|------|--------|----------|
| O1 | My queue: open alert, ACK → IN_PROGRESS → RESOLVE (per policy) | States match `HOME_ALERT` rules; operator columns readable |
| O2 | Unassigned queue: CLAIM | Assignment updates; no auto-assign elsewhere |
| O3 | Dashboard deck | `OPERATOR_*` fields show primary/secondary/meta/action |

**Warn if:** extra taps or slow loads. **Fail if:** resolves without confirmation or wrong alert updated.

---

## Observations log

Record: time, actor role, `SCREEN_CODE`, PASS / WARN / FAIL, short note.

---

## Criteria summary

| Result | Meaning |
|--------|---------|
| **PASS** | Security + core workflows OK for pilot cohort |
| **WARN** | UX issues only; document for Phase 86.x follow-up |
| **FAIL** | Stop pilot; fix binding or filters before continuing |
