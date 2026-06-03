# Case-Centric Runtime Refactor — Roadmap

**Version:** 0.1  
**Branch:** `phase/case-centric-runtime-refactor`  
**Status:** Authority V1 accepted (post phase 01)  
**Audit:** `PHASE_CASE_REFACTOR_00_REPOSITORY_AUDIT`  
**Authority:** `CASE_RUNTIME_AUTHORITY_V1.md`, `ADR_CASE_CENTRIC_RUNTIME.md`  
**Related:** `OCMS_ROADMAP.md`, `ADR_OCMS_FOUNDATION.md`

---

## Principles

1. **Audit before refactor** — phase 00 complete before authority.
2. **Read-model-first** — Case context before persistence.
3. **TASK executes** — `TASK_MAIN` mutations until persistence ADR.
4. **Work Inbox front door** — `/inbox` not replaced.
5. **No CASE_MAIN** until phase 05 eval explicitly accepts.

---

## Phase map

| Phase | Mode | Goal |
|-------|------|------|
| **CASE_REFACTOR_00** | AUDIT | Repository audit + maps + extraction plan — **GO_WITH_WARNINGS** |
| **CASE_REFACTOR_01** | DOC-ONLY | Case-Centric Runtime Authority + ADR — **GO_WITH_WARNINGS** |
| **CASE_REFACTOR_02** | IMPLEMENT | CaseRuntimeReadModel projection + contract — **GO_WITH_WARNINGS** |
| **CASE_REFACTOR_03** | IMPLEMENT | Case Workspace UI — **GO_WITH_WARNINGS** (`VITE_CASE_WORKSPACE_ENABLED`) |
| **CASE_REFACTOR_04** | VERIFY | Operator UAT — **GO_WITH_WARNINGS** (framework only; live sessions pending) |
| **CASE_REFACTOR_05** | AUDIT | Persistence decision (`CASE_MAIN` eval) — blocked until UAT gates met |
| **06+** | TBD | Write model — ADR required |

---

## Dependency graph

```text
CASE_REFACTOR_00 (audit)
    └─▶ CASE_REFACTOR_01 (authority)
            └─▶ CASE_REFACTOR_02 (read model)
                    └─▶ CASE_REFACTOR_03 (workspace UI)
                            └─▶ CASE_REFACTOR_04 (operator UAT)
                                    └─▶ CASE_REFACTOR_05 (persistence eval)
```

OCMS phases 00–03E remain valid foundation; this branch **extends** OCMS into runtime refactor sequencing.

---

*Append-only. Register each phase in `PHASE_REGISTRY.md` and `CASE_PHASE_REGISTRY.md`.*
