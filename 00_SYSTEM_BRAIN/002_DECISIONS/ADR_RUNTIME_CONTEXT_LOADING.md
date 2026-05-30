# ADR — Runtime Context Loading (Entrypoint Architecture)

- **ID**: ADR_RUNTIME_CONTEXT_LOADING
- **Date**: 2026-05-30
- **Status**: **ACCEPTED** (implementation `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION`)
- **Related**: `ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`, `PHASE_CBV_RUNTIME_ENTRYPOINT_IMPLEMENTATION_REPORT.md`

---

## Context

CBV phases were started with **ad-hoc READ FIRST blocks** — each prompt listed many files manually. That caused:

- Duplicated tokens across prompts
- Inconsistent loads (skipped ADR, skipped latest report, phase jumps)
- Module authority at `UI_UX/.../900_AUTHORITY/` while ecosystem prompts referenced repo-root `900_AUTHORITY/` paths that did not exist

---

## Decision

1. **CBV adopts Runtime Entrypoint Architecture** for all new and migrated phases.
2. **Single prompt entry:**

   ```text
   READ FIRST:
   00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md
   ```

3. **Load chain** is defined in the entrypoint and enforced by:
   - `900_AUTHORITY/010_CURSOR_LOADING_STANDARD.md`
   - `900_AUTHORITY/011_CURSOR_EXECUTION_CONTRACT.md`
   - `00_SYSTEM_BRAIN/000_STANDARDS/CBV_OPERATIONAL_ECOSYSTEM_STANDARD_V1.md`

4. **Repo-root `900_AUTHORITY/`** holds ecosystem-wide design authority, loading standard, and execution contract. Module packs (e.g. Work Inbox V3) remain under `00_SYSTEM_BRAIN/UI_UX/.../900_AUTHORITY/` and load **conditionally** after Tier 3 artifacts.

5. **Phase Registry** at `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` indexes phases; new phases use `PHASE_TEMPLATE.md`.

6. **Append-only** for reports, handoffs, and ADRs — execution contract step 7–9 mandatory for IMPLEMENT/FIX.

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Lower token use** | One entrypoint replaces repeated file lists |
| **Fewer context errors** | Mandatory Always Load + forbidden skip rules |
| **Standardized operations** | Same 9-step workflow for every phase |
| **Scalable phases** | Registry + template support many parallel workstreams |
| **AI collaboration** | Handoff + report chain is machine- and human-readable |

---

## Consequences

**Positive**

- Predictable agent onboarding per phase.
- Clear split: ecosystem vs module authority.

**Negative / follow-up**

- Legacy prompts under `000_PROMPTS/` still use old READ FIRST until migrated.
- `003_RUNTIME_STATE.md` not yet maintained — agents must note `NOT_WIRED`.
- Two `900_AUTHORITY/` trees (repo root vs Work Inbox V3) require discipline to load the correct tier.

---

## Alternatives rejected

| Alternative | Verdict |
|-------------|---------|
| Keep per-prompt READ FIRST lists | ❌ Duplication and drift |
| Only module authority, no repo root | ❌ Fails cross-cutting GAS/Worker phases |
| Auto-load all reports in folder | ❌ Token explosion |

---

## Compliance

New phases **must**:

1. Register in `PHASE_REGISTRY.md` (or phase family documented).
2. Use entrypoint-only READ FIRST in prompt header.
3. Produce report + handoff; ADR when architecture changes.

---

*Append-only ADR.*
