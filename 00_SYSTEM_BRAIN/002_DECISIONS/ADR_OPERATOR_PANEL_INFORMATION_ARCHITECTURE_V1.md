# ADR: Operator Panel Information Architecture V1

**Status:** Accepted  
**Phase:** `PHASE_OPERATOR_PANEL_INFORMATION_ARCHITECTURE_V1`  
**Date:** 2026-06-02

---

## Context

The Chi tiết tab mixed operator actions with operational history (timeline preview) and technical diagnostics. Operators lost focus; support data cluttered the action center.

---

## Decision

Split the right panel into five zones with strict ownership:

1. **Chi tiết** — work summary + business actions + processing note + contact only.  
2. **Timeline** — recent + full operational history.  
3. **Handoff** — transfer context (unchanged).  
4. **Hồ sơ** — dossier/documents (unchanged).  
5. **Kỹ thuật** — all technical/sync identifiers; never default tab.

Remove timeline and technical blocks from `OperatorDetailPanel`.

---

## Consequences

- Clearer operator mental model aligned with Golden Reference V1.
- Timeline tab may show duplicate entries when recent ⊆ full (acceptable; labeled sections).
- Technical tab is discoverable for support without polluting daily workflow.

---

## Alternatives considered

- Collapsed sections inside Chi tiết — rejected; still competes with action flow.
- Merging Kỹ thuật into footer only — rejected; footer lacks full ID/source context.
