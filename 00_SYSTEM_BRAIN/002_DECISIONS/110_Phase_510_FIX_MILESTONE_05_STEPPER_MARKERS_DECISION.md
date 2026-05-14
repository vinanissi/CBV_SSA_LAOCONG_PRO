# Decision — 110 Phase 510 — Milestone 05 stepper markers

**Date:** 2026-05-14  
**Status:** Accepted

## Decision

Embed **current** and **next** step summary blocks (with required CSS marker classes) **inside** `CbvGuidedSop_buildStepperHtml_` output so the M05 Test Console substring contract matches production cockpit/focus HTML.

## Non-decisions

- Did not relax `UI_MARKERS_STEPPER` or `REPORT_ENVELOPE` rules.
- Did not remove `buildCurrentStepBannerHtml_` from cognition (optional future cleanup to reduce duplicate “Bước hiện tại” UI).

## Rationale

Contract test intentionally validates the **stepper fragment** in isolation; markers must live in that fragment.
