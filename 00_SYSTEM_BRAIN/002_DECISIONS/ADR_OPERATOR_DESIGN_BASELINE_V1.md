# ADR: Operator Design Baseline V1

**Status:** Accepted  
**Phase:** `PHASE_OPERATOR_DESIGN_BASELINE_V1`  
**Date:** 2026-06-02

---

## Context

Operator screens accumulated mixed font sizes (10–11px in right panel sections) while checklist density work hid inline chips. Staff need a single readable baseline without a full layout redesign.

---

## Decision

Adopt **Operator UX Golden Reference V1** as the locked CSS token layer:

1. CSS custom properties under `html.operator-design-baseline-v1`.
2. Always apply baseline class from `applyThemeMode()` alongside theme light/dark.
3. Compact checklist counters on collapsed rows; expanded/focused rows keep full inline panels.
4. Formalize typography and hierarchy in `OPERATOR_DESIGN_BASELINE_AUTHORITY.md`.

---

## Consequences

**Positive**

- Readable 14px+ operator body text in right panel and actions.
- Checklist stays compact with scannable counter strip.
- Governance traceability for future UI phases.

**Negative / limits**

- Dark theme receives baseline class but token overrides target `theme-light` first.
- Pixel-perfect browser verification deferred to `PHASE_CHECKLIST_OPERATOR_BROWSER_UAT`.

---

## Alternatives considered

- Tailwind config-only scale — rejected; operator scope needs explicit authority file.
- Full redesign — out of phase scope.
