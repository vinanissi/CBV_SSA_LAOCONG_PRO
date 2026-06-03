# Step Anchor Accuracy Contract

**Phase:** `PHASE_LINK_04_STEP_ANCHOR_ACCURACY_FIX`  
**Status:** ACTIVE

---

## Objective

Guarantee deep-link navigation resolves the exact checklist step anchor and clears URL only after verified success.

## Exact anchor contract

- Each checklist row must expose `data-checklist-step-id="<checklistItemId>"`.
- Deep-link resolution queries exact id match (no index/text/container primary match).
- Optional marker `data-step-anchor="true"` is allowed as anchor diagnostics.

## Verification contract

Resolution is successful only when all checks pass:

1. Target element exists.
2. `data-checklist-step-id` exactly equals URL `step`.
3. Target is in/near viewport after scroll.
4. Highlight marker is present on exact target row.

## URL cleanup contract

- `step` query may clear only after verified exact resolution.
- `step` query must not clear while loading, pending DOM, or target verification fails.

## Failure states

- `FAILED_MISSING_STEP`
- `FAILED_TARGET_VERIFY`
- `FAILED_TIMEOUT`

All failure states must remain non-blocking for operator runtime usability.

