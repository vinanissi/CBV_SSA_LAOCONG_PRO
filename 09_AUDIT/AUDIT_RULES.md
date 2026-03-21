# Bootstrap Audit Rules — CBV_SSA_LAOCONG_PRO

Rules enforced by `selfAuditBootstrap()`.

---

## RULE 1 — Read-Safe

- Audit is read-only by default.
- No auto-delete, no reorder, no silent fix.
- `appendMissingColumns` and `autoFix` are optional and isolated.

---

## RULE 2 — Idempotent

- Running `selfAuditBootstrap()` multiple times is safe.
- Same input → same output (modulo timestamp).

---

## RULE 3 — Structured Output

- Every finding has: category, check, severity, status, table, column, issue_code, message, suggested_fix.
- Report includes: auditRunAt, systemHealth, bootstrapSafe, appsheetReady, totals, sectionResults, mustFixNow, warnings, top10Issues, safeNextSteps.

---

## RULE 4 — Severity Model

- CRITICAL: System broken.
- HIGH: AppSheet or data at risk.
- MEDIUM: Should fix soon.
- LOW: Informational.
- INFO: No action.

---

## RULE 5 — Section Result

- Each sub-audit returns PASS, WARN, or FAIL.

---

## RULE 6 — Production Gate

- BOOTSTRAP_SAFE = YES iff no CRITICAL or HIGH findings.
- APPSHEET_READY = YES iff no schema/ref/key blockers.
- MUST_FIX_NOW = list of CRITICAL and HIGH findings.
- WARNINGS = MEDIUM and LOW findings.

---

## RULE 7 — Machine + Human Readable

- JSON-like structure for automation.
- Clear messages and suggested_fix for operators.
