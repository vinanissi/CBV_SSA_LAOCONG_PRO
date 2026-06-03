# Phase Report — LINK_04 Step Anchor Accuracy Fix

| Field | Value |
|-------|-------|
| **Phase** | `PHASE_LINK_04_STEP_ANCHOR_ACCURACY_FIX` |
| **Result** | **GO_WITH_WARNINGS** |
| **Date** | 2026-06-02 |

---

## Root cause confirmed

Deep-link consume previously treated publish success as resolution success, so URL cleanup could happen before exact target row verification.

---

## Delivered

- Stable row anchor attributes:
  - `data-checklist-step-id={item.id}`
  - `data-step-anchor="true"`
  - exact-row highlight marker: `data-deep-link-target`
- Exact anchor verification in deep-link consumer:
  - element exists by exact step id
  - id matches exactly
  - element is in/near viewport
  - highlight marker is present
- URL cleanup guarded until exact verification succeeds.
- Added failure state: `FAILED_TARGET_VERIFY`.
- Diagnostics updated to assert anchor and verification behavior.

---

## ADR

ADR not required because this phase corrects selector/anchor accuracy within the existing approved Link Runtime architecture.

---

## Warnings & Risks

- Browser-level visual verification remains partial in CI-only run (non-blocking).

## Follow-up

- Execute manual browser evidence capture for exact scroll/highlight under real runtime latency.

