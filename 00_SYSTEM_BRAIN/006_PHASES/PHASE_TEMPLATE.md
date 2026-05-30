# Phase Charter Template

Copy to `006_PHASES/<PHASE_NAME>.md` when registering a new phase.

---

## PHASE

`<PHASE_NAME>`

Example: `PHASE_TASK_GS_11_EXAMPLE`

---

## LOAD

Entrypoint only in prompts:

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

### Optional loads (fill per phase)

| Category | Path |
|----------|------|
| ADR | `00_SYSTEM_BRAIN/002_DECISIONS/ADR_*.md` |
| Reports | `00_SYSTEM_BRAIN/000_REPORTS/<...>_REPORT.md` |
| Handoff | `00_SYSTEM_BRAIN/001_HANDOFF/<...>_HANDOFF.md` |
| Runtime state | `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` (if exists) |
| Module authority | `00_SYSTEM_BRAIN/UI_UX/<MODULE>/900_AUTHORITY/` |

---

## REPORTS

| Role | Path |
|------|------|
| Output report | `00_SYSTEM_BRAIN/000_REPORTS/<PHASE_NAME>_REPORT.md` |
| Dependency reports | _(list)_ |

---

## ADR

| Action | Path |
|--------|------|
| Required? | `YES` / `NO` / `IF NEEDED` |
| Output ADR | `00_SYSTEM_BRAIN/002_DECISIONS/ADR_<TOPIC>.md` |
| Related ADRs | _(list)_ |

---

## HANDOFF

| Role | Path |
|------|------|
| Output handoff | `00_SYSTEM_BRAIN/001_HANDOFF/<PHASE_NAME>_HANDOFF.md` |
| Input handoff | _(prior phase)_ |

---

## MODE

Select one primary mode:

- [ ] `AUDIT`
- [ ] `IMPLEMENT`
- [ ] `FIX`
- [ ] `VERIFY`
- [ ] `TEST`
- [ ] `DOC-ONLY`

---

## OUTPUT

Required deliverables (check all that apply):

- [ ] `REPORT`
- [ ] `HANDOFF`
- [ ] `TEST_EVIDENCE`
- [ ] `ADR` (if needed)

---

## SUCCESS CRITERIA

Exit status must be exactly one of:

- [ ] `GO`
- [ ] `GO_WITH_WARNINGS`
- [ ] `FAIL`

### Acceptance bullets

1. _(measurable criterion)_
2. _(measurable criterion)_

---

## SCOPE

### In scope

- _(list)_

### Out of scope

- DB schema changes (unless explicit)
- AppSheet
- Unrelated FE/BE

---

## NEXT PHASE (suggested)

`PHASE_<...>`

---

*Template — not a executed phase record.*
