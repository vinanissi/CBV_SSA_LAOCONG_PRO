# Cursor / AI — Context Loading Standard

**Version:** 1.1  
**Status:** Accepted (hardening `PHASE_CBV_RCLA_V1_1_HARDENING`)  
**Applies to:** All CBV phases executed via Cursor or other AI agents.

---

## 1. Purpose

Replace ad-hoc “READ FIRST” file lists in prompts with a **single runtime entrypoint** and predictable optional loads. This reduces token waste, missed context, and phase-skip errors.

---

## 2. Load categories

### 2.1 Always Load (mandatory)

Load **in order** before analysis or code changes:

| # | Resource | Path |
|---|----------|------|
| A | Design Authority | `900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| B | Authority Index | `900_AUTHORITY/001_AUTHORITY_INDEX.md` |
| C | Loading Standard | `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md` (this file) |
| D | Execution Contract | `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md` |
| E | Operational Ecosystem Standard | `00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md` |
| F | Runtime Entrypoint | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` |
| G | Phase Registry | `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` |
| H | Module Authority Registry | `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` |
| I | Runtime State | `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` (if present) |

### Mandatory after v1.1

- Read `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` before loading any module authority pack.
- Read `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` when the file exists.
- Report **`RUNTIME_STATE: NOT_WIRED`** when runtime state is not operator-maintained (`NOT_WIRED` or `UNKNOWN` flags).

**Prompt rule:** Every new phase prompt declares only:

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
```

The entrypoint expands to the full Always Load chain.

### 2.2 Optional Load (phase-dependent)

| Category | When to load | Typical path |
|----------|--------------|--------------|
| **Related ADR** | Decision affects design, schema, or runtime split | `00_SYSTEM_BRAIN/002_DECISIONS/ADR_*.md` |
| **Related Reports** | Prior work on same domain or dependency phase | `00_SYSTEM_BRAIN/000_REPORTS/<PHASE>_REPORT.md` |
| **Latest Handoff** | Continuing from another agent/session | `00_SYSTEM_BRAIN/001_HANDOFF/<PRIOR_PHASE>_HANDOFF.md` |
| **Runtime State** | Live deploy flags, blockers, WIP (when file exists) | `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` |
| **Module authority** | UI/IA scoped to a product module | e.g. `UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/` |
| **Phase prompt** | Legacy detail not yet migrated to registry | `00_SYSTEM_BRAIN/000_PROMPTS/<PHASE>_PROMPT.md` |

Optional loads are listed in `006_PHASES/<PHASE>.md` or the phase report front matter when registered.

### 2.3 Forbidden (hard rules)

| Rule | Rationale |
|------|-----------|
| **Skip ADR** when phase touches a decided domain | Prevents re-litigating accepted architecture |
| **Skip latest report** for the phase under audit/fix | Loses evidence and acceptance criteria |
| **Skip runtime state** when file exists and phase is IMPLEMENT/FIX | Hides deploy blockers |
| **Phase jump without report** | No audit trail; breaks handoff chain |
| **Replace READ FIRST with ad-hoc file dumps** | Defeats entrypoint; duplicates token cost |
| **Overwrite reports / handoffs / ADRs** | Violates append-only ecosystem |
| **Invent runtime status** without runtime state or test evidence | False deploy claims |
| **Let module authority override ecosystem authority** without ACCEPTED ADR | Breaks RCLA tier order |

---

## 3. Resolution rules

### Related ADR

1. Search `002_DECISIONS/` for phase name, domain (`TASK`, `HOME_ALERT`, `AUTH`, `UI`), or tags in `PHASE_REGISTRY.md`.
2. Load all ADRs marked **ACCEPTED** that match scope.
3. **DRAFT** ADRs: read for context; do not treat as final unless phase says “ratify ADR”.

### Latest Report

1. Prefer `000_REPORTS/<EXACT_PHASE>_REPORT.md`.
2. If missing, use the newest report in the same **phase family** (e.g. `PHASE_TASK_GS_*`) only when handoff explicitly points to it.

### Latest Handoff

1. Prefer `001_HANDOFF/<PRIOR_PHASE>_HANDOFF.md` referenced in the current phase charter.
2. “Latest” = highest date in handoff header, not filename sort alone.

### Runtime State

1. Read `003_RUNTIME_STATE.md` when present (v1.1 stub exists; default **NOT_WIRED**).
2. If status is `NOT_WIRED` or table flags are `UNKNOWN`, report **RUNTIME_STATE: NOT_WIRED** — do not infer live deploy.
3. Do not invent deploy status; verify via operator-updated state, config/env, or test evidence when implementing.

---

## 4. Module vs ecosystem authority

Coordination: `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` (Tier 1–4).

| Conflict type | Wins |
|---------------|------|
| Loading order, reports, handoffs, phase registry, entrypoint | Ecosystem (`000_RUNTIME_ENTRYPOINT` + this standard) |
| Work Inbox IA, routes, operator UI | `CBV_WORK_INBOX_V3/900_AUTHORITY/000_DESIGN_AUTHORITY.md` (after registry) |
| Task vs alert source of truth | `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH`, `ADR_HOME_ALERT_RUNTIME_BINDING` |

---

## 5. Compliance checklist (agent self-check)

Before implementing:

- [ ] Started from `000_RUNTIME_ENTRYPOINT.md`
- [ ] Always Load chain complete
- [ ] Phase registered or template used in `006_PHASES/`
- [ ] Related ADR read (or N/A documented)
- [ ] Latest report + handoff read (or N/A documented)
- [ ] Module Authority Registry read when module scope applies
- [ ] Runtime state read; NOT_WIRED reported if unmaintained

---

*Append-only governance document. v1.1 section added 2026-05-30.*

