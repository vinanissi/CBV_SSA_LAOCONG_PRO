# Step Anchor Accuracy Authority

**Phase:** `PHASE_LINK_04_STEP_ANCHOR_ACCURACY_FIX`  
**Status:** ACTIVE

---

## Authority Scope

Precision hardening for deep-link target resolution using stable checklist step anchors.

## Runtime Boundaries

- Scope is limited to DOM anchor attributes, selector accuracy, target verification, and URL cleanup guards.
- No changes to task/checklist data model, persistence, schema, or workflow.

## Allowed Changes

- Checklist row DOM anchor attributes
- Exact selector helper / target verification logic
- Highlight marker on exact target row
- Non-blocking warning paths and diagnostics
- Governance artifacts for phase traceability

## Forbidden Changes

- No business logic change
- No workflow change
- No persistence change
- No schema change
- No permission model change

## Completion Requirements

- Stable `data-checklist-step-id` anchors exist
- Exact target verification implemented before URL cleanup
- Non-blocking failure handling preserved
- Runtime boundaries preserved

