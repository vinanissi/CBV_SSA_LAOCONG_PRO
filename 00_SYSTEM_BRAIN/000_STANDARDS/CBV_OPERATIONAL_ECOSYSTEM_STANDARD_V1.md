# CBV Operational Ecosystem Standard — V1

**Version:** 1.0  
**Status:** Accepted  
**Scope:** CBV SSA Lao Cong PRO — documentation, AI phases, and operator-facing systems.

---

## 1. Intent

One operational standard for how CBV evolves: memory-first documentation, runtime-first truth, phased delivery, append-only audit trail.

---

## 2. Core rules

| # | Rule | Meaning |
|---|------|---------|
| 1 | **Memory-first** | Decisions live in ADR + report + handoff before they fade from chat |
| 2 | **Runtime-first** | Code/deployed config wins over stale specs for AS-IS behavior |
| 3 | **Append-only** | Do not overwrite reports, handoffs, ADRs, or audit logs |
| 4 | **Manual-first → auto-later** | Operator workflows proven manually before automation |
| 5 | **Phase-bound** | One phase = one charter; exit with GO / GO_WITH_WARNINGS / FAIL |
| 6 | **Context entrypoint** | All prompts start at `000_RUNTIME_ENTRYPOINT.md` |
| 7 | **No silent degradation** | Production modes must not hide missing GAS/DB with mock data |

---

## 3. Required artifacts per phase

| Artifact | Path pattern |
|----------|----------------|
| Report | `000_REPORTS/<PHASE>_REPORT.md` |
| Handoff | `001_HANDOFF/<PHASE>_HANDOFF.md` |
| ADR (if needed) | `002_DECISIONS/ADR_<TOPIC>.md` |
| Test evidence (if TEST mode) | `005_TEST_EVIDENCE/` or `000_TEST_CONSOLE/` |

---

## 4. Operator vs system surfaces

- **Operator UI** — daily work; hide cognition, queue internals, debug unless admin role.
- **Admin / governance** — health, audit, test console, config; not mixed into default operator paths.

(Module-specific rules: Work Inbox V3 design authority.)

---

## 5. AI collaboration

- Agents load context via `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md`.
- Agents execute via `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md`.
- Human operators review **report exit status** before starting dependent phases.

---

## 6. Versioning

- **V1** — introduced with `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION` and `ADR_RUNTIME_CONTEXT_LOADING`.
- Future V2 requires new standard file; V1 remains readable for history.

---

*Append-only standard. Amend via new section at document end.*
