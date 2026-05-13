# Sheets/GAS — Operational Database + Runtime

## Statement

Google Sheets + Google Apps Script (GAS) is the **trusted operational database and runtime**.

- **Sheets**: operational tables, append-only artifacts where possible, authoritative data contract.
- **GAS runtime**: business rules, orchestration, validation, audit logging, test console, reporting.

WebApp and AppSheet are front-ends that bind to this runtime.

---

## Sheets/GAS owns

- Operational database (Sheets)
- Business runtime (GAS services)
- Audit log (append-only)
- Append-only report/handoff artifacts (repo + GAS test console outputs)
- Test console standard (`CBV_TCS_V1`)
- Runtime health checks
- Data contracts (schema manifest + UI contract)
- WebApp API surface (read-first; manual writes only)
- AppSheet binding metadata (matrices, hints, security guidance)

---

## Rules (must not violate)

- Runtime-first
- Memory-first
- Append-only
- Manual-first → Auto-later
- Audit-first
- Human-in-the-loop
- No destructive migration
- **No production claim**

---

## Notes

Phase 88 is an architecture closeout: it does not introduce large new runtime modules; it documents responsibilities and provides a readiness gate via a Test Console suite.

