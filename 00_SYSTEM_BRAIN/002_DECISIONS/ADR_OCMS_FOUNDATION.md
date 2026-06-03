# ADR — OCMS Foundation (Operational Case Management System)

- **ID**: ADR_OCMS_FOUNDATION
- **Date**: 2026-05-31
- **Status**: **ACCEPTED** (design authority `PHASE_OCMS_00_DESIGN_AUTHORITY`)
- **Branch**: `phase/ocms-foundation-v1`
- **Related**: `OCMS_DOMAIN_MODEL.md`, `OCMS_ROADMAP.md`, `PHASE_OCMS_00_DESIGN_AUTHORITY_REPORT.md`
- **Extends**: ecosystem `900_AUTHORITY/000_DESIGN_AUTHORITY.md` (does not override Work Inbox V3 module authority for inbox IA)

---

## Context

CBV SSA Lao Cong PRO has a **production-grade operator surface** in **Work Inbox V3** (`/inbox`, Focus Mode, TASK_MAIN runtime) and satellite modules (HO_SO, FINANCE, HOME_ALERT projection, RF plugin runtime). Operators think in terms of **daily work**, not database tables.

The product direction is to evolve CBV from **task-centric execution** into an **Operational Case Management System (OCMS)** — a coherent model where cross-module work (task + hồ sơ + finance + documents + alerts) is understood as one **operational case** without rewriting the current inbox or migrating schema in the foundation phase.

Constraints for this ADR:

- **Do not break** Work Inbox V3 behavior, routes, or module authority.
- **No schema change** until a future phase with explicit manifest + audit alignment.
- **No UI redesign** and **no large new runtime modules** in foundation.

---

## Decision

1. **OCMS is the ecosystem north star** for CBV operational architecture naming and phased evolution. It describes **how domains relate**, not a replacement product name for Work Inbox.

2. **Work Inbox V3 remains the operator front door** for task-shaped work. ADR-001 (`ADR_001_CBV_WORK_INBOX_V3_WORK_INBOX_DECISION.md`) stays in force. OCMS does not change default route `/inbox` or inbox groups.

3. **Case is a logical aggregate (conceptual layer)** that **references** existing runtimes — it does not introduce a new canonical sheet or API in foundation:
   - **Task state** → `TASK_MAIN` (+ `TASK_UPDATE_LOG`) per `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md`
   - **Alerts** → `HOME_ALERT` projection per `ADR_HOME_ALERT_RUNTIME_BINDING.md`
   - **Hồ sơ / Finance / Docs** → existing module sheets and deep links (RF_06 read paths, AppSheet where configured)

4. **TASK remains the execution engine** behind inbox rows. A **Case** groups **Work Items** (tasks, alerts, module pointers) for operator context; completing a task still mutates `TASK_MAIN`, not a hypothetical `CASE_MAIN`.

5. **Foundation delivery is documentation-only** on branch `phase/ocms-foundation-v1`: domain model + roadmap + this ADR. Implementation phases are sequenced in `OCMS_ROADMAP.md` and registered later in `PHASE_REGISTRY.md`.

6. **CBV-RCLA v1.1** remains mandatory context loading (`000_RUNTIME_ENTRYPOINT.md`, `003_RUNTIME_STATE.md`, module registry). Future OCMS module packs (if any) must register in `MODULE_AUTHORITY_REGISTRY.md` before phases reference them.

7. **Runtime state** must not be invented: until `003_RUNTIME_STATE.md` is operator-wired, OCMS phases report `RUNTIME_STATE: NOT_WIRED`.

---

## Definitions (binding for OCMS phases)

| Term | Meaning |
|------|---------|
| **OCMS** | Operational Case Management System — cross-module operational model for CBV |
| **Case** | Logical container for one operational matter; stable **Case Key** (future) may anchor IDs across modules |
| **Work Item** | Actionable unit in operator queue — today primarily **Task** (inbox row) or **Alert** (HOME_ALERT) |
| **Module Projection** | Read model from HO_SO / FINANCE / DOCS / INVOICE exposed in UI without owning case state |
| **Episode** | Time-bounded segment of case activity (timeline / update log), append-only |

Full entity relationships: `00_SYSTEM_BRAIN/OCMS/OCMS_DOMAIN_MODEL.md`.

---

## Non-goals (foundation)

- New Google Sheet tables or columns
- Replacing Work Inbox V3 or `/tasks` migration policy
- Merging `TASKS` (RF_12 legacy) with `TASK_MAIN`
- Auto-execute, auto-close, or silent mock fallbacks in production
- AppSheet or GAS rewrites

---

## Consequences

**Positive**

- Shared vocabulary for phases after Work Inbox stabilization (checklist, attachments, focus, etc.).
- Clear boundary: inbox UX vs cross-module case context.
- Roadmap can add **read-only case shell** before any write model.

**Negative / residual**

- **Case** is not yet persisted — operators still see tasks/alerts/modules separately until binding phases ship.
- Dual task runtime (`TASK_MAIN` vs legacy `TASKS`) remains an ecosystem debt until GS_01 cutover ADR is ratified.
- Module authority for OCMS UI (if created) is **not** in Tier 4 registry yet — only Work Inbox V3 is registered.

---

## Alternatives considered

| Alternative | Verdict |
|-------------|---------|
| Introduce `CASE_MAIN` sheet now | ❌ Violates no-schema foundation constraint |
| Rebrand Work Inbox to "Cases" in UI | ❌ Breaks ADR-001 mental model and operator training |
| Fold HOME_ALERT into task table | ❌ Rejected by HOME_ALERT ADR |
| Big-bang OCMS microservice | ❌ Violates phased-change principle |

---

## Rollout (manual-first)

See `00_SYSTEM_BRAIN/OCMS/OCMS_ROADMAP.md`. Next suggested phase: `PHASE_OCMS_01_CASE_KEY_CONVENTION` (DOC-ONLY, naming only) or `PHASE_OCMS_01_READ_MODEL_BINDING` (read-only UI shell) — operator choice.

---

*Append-only ADR.*
