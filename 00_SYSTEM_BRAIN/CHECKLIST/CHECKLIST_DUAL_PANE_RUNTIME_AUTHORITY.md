# Checklist Dual Pane Runtime Authority

**Phase:** `PHASE_CHECKLIST_10_DUAL_PANE_RUNTIME`  
**Status:** ACTIVE

## Authority Scope

Dual-pane layout, shared focus context, navigator-only checklist rows, and focused-step detail panel in the right context column.

## Allowed Changes

- `ChecklistDualPaneFocusProvider` and focus sync
- `FocusedChecklistStepDetailPanel`
- Navigator-only row treatment
- CSS/layout for dual pane
- Diagnostics and governance artifacts

## Forbidden Changes

- No business logic change
- No persistence change
- No schema change
- No deep-link URL contract changes
- No Dossier Runtime contract change (aggregate panel remains task-level)

## Completion Requirements

- Focused step drives right pane content.
- Checklist does not duplicate full detail when dual pane is on.
- Task-level dossier remains reachable.
- Prior checklist runtime contracts do not regress.
