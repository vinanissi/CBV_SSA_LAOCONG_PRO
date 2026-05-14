# Decision — 109 Milestone 05 — Guided SOP Runtime

**Date:** 2026-05-14  
**Status:** Accepted for code-ready milestone

## Decision

1. **Registry storage:** SOP templates live **in-code** (`998W`) for M05 — no TASK_MAIN / sheet writes until a vetted schema exists.  
2. **Step completion:** No persisted step cursor; displayed states are **read-first heuristics** plus `DONE_SAFE_PLACEHOLDER` only as a non-authoritative label — no auto-complete.  
3. **Validation:** All “blocking” semantics are **warnings** in UI (`cbv-sop-not-hard-block`); no WebApp mutations from guided flow.  
4. **Page type:** New `GUIDED_SOP_RUNTIME` distinct from `GUIDED_OPS` (M01) to avoid conflating legacy guided page with M05 runtime.  
5. **Routing:** Canonical `/workspace/sop` plus short alias `/sop`; mirrored in `998H` frozen set and dispatchers.

## Alternatives considered

- Reusing `GUIDED_OPS` only — rejected to keep M01 surface stable and tests unambiguous.  
- Auto-advancing steps when checklist satisfied — rejected per manual-first policy.

## Risks

- Heuristic `currentStep` may differ from operator judgment — mitigated by warnings + detail/focus CTAs.
