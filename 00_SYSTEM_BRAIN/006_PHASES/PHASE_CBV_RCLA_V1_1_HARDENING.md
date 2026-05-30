# Phase Charter — CBV-RCLA v1.1 Hardening

## PHASE

`PHASE_CBV_RCLA_V1_1_HARDENING`

---

## MODE

`DOC-ONLY` + HARDENING

---

## INPUT

- `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION` (v1.0, GO_WITH_WARNINGS)
- `ADR_RUNTIME_CONTEXT_LOADING.md`
- Handoff: `001_HANDOFF/PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_HANDOFF.md`

---

## SCOPE

Close v1.0 warnings:

1. Wire runtime state convention (`003_RUNTIME_STATE.md` stub).
2. Migrate legacy prompts to entrypoint-only READ FIRST.
3. Coordinate dual authority via `MODULE_AUTHORITY_REGISTRY.md`.

**Out of scope:** FE/BE/GAS/DB/AppSheet/runtime code.

---

## OUTPUT

| Artifact | Path |
|----------|------|
| Runtime state | `003_RUNTIME_STATE.md` |
| Module registry | `006_PHASES/MODULE_AUTHORITY_REGISTRY.md` |
| Entrypoint update | `000_RUNTIME_ENTRYPOINT.md` |
| Loading standard v1.1 | `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md` |
| ADR addendum | `002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md` |
| Report | `000_REPORTS/PHASE_CBV_RCLA_V1_1_HARDENING_REPORT.md` |
| Handoff | `001_HANDOFF/PHASE_CBV_RCLA_V1_1_HARDENING_HANDOFF.md` |

---

## SUCCESS CRITERIA

| # | Criterion |
|---|-----------|
| 1 | `003_RUNTIME_STATE.md` exists (operator-maintained; default NOT_WIRED) |
| 2 | `MODULE_AUTHORITY_REGISTRY.md` exists with Tier 1–4 |
| 3 | Entrypoint + loading standard reference both |
| 4 | Legacy prompts migrated or documented SKIP |
| 5 | ADR addendum ACCEPTED |
| 6 | No changes under `apps/`, `workers/`, GAS, DB |

---

## EXIT STATUS

**GO** — structural hardening complete. Runtime state remains `NOT_WIRED` until operator updates (by design).

---

*Phase charter — append-only.*
