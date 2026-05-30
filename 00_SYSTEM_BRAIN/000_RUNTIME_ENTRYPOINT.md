# CBV Runtime Entrypoint

**Status:** Source of Context Loading for all CBV phases.  
**Rule:** Every prompt **must** begin here — do not duplicate long READ FIRST lists elsewhere.

---

## What this file is

The **Runtime Entrypoint** is the single front door for AI/Cursor context. It defines load order from ecosystem authority through phase-specific artifacts. It does **not** replace phase charters; it **orchestrates** how context is loaded.

---

## LOAD ORDER

Execute reads in this sequence. Skip optional steps only when the phase charter documents N/A.

### Tier 1 — Authority & contracts (Always Load)

| # | Document |
|---|----------|
| 1 | `900_AUTHORITY/000_DESIGN_AUTHORITY.md` |
| 2 | `900_AUTHORITY/001_AUTHORITY_INDEX.md` |
| 3 | `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md` |
| 4 | `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md` |
| 5 | `00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md` |
| 6 | `00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md` (this file — confirm chain) |

### Tier 2 — Phase system & coordination

| # | Document |
|---|----------|
| 7 | **Phase Registry** — `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` |
| 8 | **Module Authority Registry** — `00_SYSTEM_BRAIN/006_PHASES/MODULE_AUTHORITY_REGISTRY.md` |
| 9 | **Current phase record** (if registered) — `00_SYSTEM_BRAIN/006_PHASES/<PHASE_NAME>.md` |
| 10 | **Phase template** (when creating a new phase) — `00_SYSTEM_BRAIN/006_PHASES/PHASE_TEMPLATE.md` |

### Tier 3 — Runtime state & phase artifacts

| # | Document | When |
|---|----------|------|
| 11 | **Runtime State** — `00_SYSTEM_BRAIN/003_RUNTIME_STATE.md` | Always read if present |
| 12 | **Related ADR** — `00_SYSTEM_BRAIN/002_DECISIONS/ADR_*.md` | Domain decisions apply |
| 13 | **Related Reports** — `00_SYSTEM_BRAIN/000_REPORTS/<PHASE>_REPORT.md` | Audit, fix, or continuation |
| 14 | **Latest Handoff** — `00_SYSTEM_BRAIN/001_HANDOFF/<PHASE>_HANDOFF.md` | Prior agent handoff |

**Runtime State rule:** If status is `NOT_WIRED` or flags are `UNKNOWN`, **do not infer** live runtime status. Report `RUNTIME_STATE: NOT_WIRED` in phase output.

### Tier 4 — Module packs (conditional)

**Rule:** If the phase touches a module, read **Module Authority Registry** first, then load the relevant module authority pack from Tier 4 — do not load module paths ad hoc from prompt headers.

| Module | Entry (after registry) |
|--------|-------------------------|
| Work Inbox V3 | `00_SYSTEM_BRAIN/UI_UX/CBV_WORK_INBOX_V3/900_AUTHORITY/001_AUTHORITY_INDEX.md` |

See `006_PHASES/MODULE_AUTHORITY_REGISTRY.md` for full Tier 4 paths.

---

## Prompt standard (copy for new phases)

```text
READ FIRST:
00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

PHASE: <PHASE_NAME>
MODE: <AUDIT|IMPLEMENT|FIX|VERIFY|TEST|DOC-ONLY>
```

Then paste phase-specific goals only — not a duplicate authority list.

---

## Architecture chain

```text
Runtime Entrypoint
  → Authority (900_AUTHORITY)
  → Loading Standard + Execution Contract
  → Operational Ecosystem Standard
  → Phase Registry + Module Authority Registry
  → Runtime State + ADR / Report / Handoff
  → Module authority pack (if applicable, via registry)
  → Implementation
```

---

## Forbidden

- Skipping Tier 1 for any IMPLEMENT/FIX phase.
- Phase jump without reading the latest report for the dependency phase.
- Replacing this entrypoint with ad-hoc multi-file READ FIRST blocks in prompts.

---

## Related ADR

- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_RUNTIME_CONTEXT_LOADING_V1_1_ADDENDUM.md`

---

*Append-only. Update load order only via ADR amendment.*
