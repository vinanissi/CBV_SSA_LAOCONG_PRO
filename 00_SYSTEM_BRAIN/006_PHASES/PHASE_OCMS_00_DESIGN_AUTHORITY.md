# Phase Charter — PHASE_OCMS_00_DESIGN_AUTHORITY

---

## PHASE

`PHASE_OCMS_00_DESIGN_AUTHORITY`

---

## LOAD

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

| Category | Path |
|----------|------|
| ADR (related) | `ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`, `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`, `ADR_HOME_ALERT_RUNTIME_BINDING.md`, `ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md` |
| Module authority | Work Inbox V3 — boundary only via `MODULE_AUTHORITY_REGISTRY.md` |
| Runtime state | `003_RUNTIME_STATE.md` |

---

## REPORTS

| Role | Path |
|------|------|
| Output report | `000_REPORTS/PHASE_OCMS_00_DESIGN_AUTHORITY_REPORT.md` |

---

## ADR

| Action | Path |
|--------|------|
| Required? | YES |
| Output ADR | `002_DECISIONS/ADR_OCMS_FOUNDATION.md` |

---

## HANDOFF

Optional — not required for foundation DOC-ONLY exit.

---

## MODE

- [x] `DOC-ONLY`

---

## OUTPUT

- [x] `REPORT`
- [x] `ADR`
- [x] `OCMS_DOMAIN_MODEL.md`
- [x] `OCMS_ROADMAP.md`

---

## SUCCESS CRITERIA

Exit: **GO**

1. Branch `phase/ocms-foundation-v1` created.
2. `ADR_OCMS_FOUNDATION.md` accepted.
3. Domain model + roadmap published under `00_SYSTEM_BRAIN/OCMS/`.
4. No Work Inbox / schema / runtime code changes.

---

## SCOPE

### In scope

- OCMS vocabulary, boundaries, phased roadmap
- Registry row + charter

### Out of scope

- DB schema, FE/GAS implementation, UI redesign, large modules

---

## NEXT PHASE (suggested)

`PHASE_OCMS_01_CASE_KEY_CONVENTION`

---

*Phase charter — OCMS foundation.*
