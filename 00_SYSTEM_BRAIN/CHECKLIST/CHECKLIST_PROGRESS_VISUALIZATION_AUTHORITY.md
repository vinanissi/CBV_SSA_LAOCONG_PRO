# Checklist Progress Visualization Authority

**Phase:** `PHASE_CHECKLIST_04_PROGRESS_VISUALIZATION`  
**Status:** ACTIVE

## Authority Scope

Derived checklist progress display in checklist header UI.

## Allowed Changes

- Derived progress calculation from existing checklist runtime items
- Header progress UI and progress bar styling
- Diagnostic and governance artifacts

## Forbidden Changes

- No business logic change
- No persistence change
- No schema change
- No workflow redesign
- No checklist status semantics change

## Completion Requirements

- Correct total/completed/remaining/percent values.
- Safe zero-item behavior.
- Existing interaction feedback, toast, focus mode, link runtime, and sheet warning behavior preserved.

