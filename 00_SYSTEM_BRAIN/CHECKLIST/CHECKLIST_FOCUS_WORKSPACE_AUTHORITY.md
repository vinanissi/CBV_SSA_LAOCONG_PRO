# Checklist Focus Workspace Authority

**Phase:** `PHASE_CHECKLIST_09_FOCUS_WORKSPACE`  
**Status:** ACTIVE

## Authority Scope

Local focus workspace controls and layout treatment for focused vs non-focused checklist rows.

## Allowed Changes

- Local UI state for workspace mode
- Workspace controls (enter/exit/prev/next/clear focus)
- Minimized non-focused step navigator
- Supporting CSS and diagnostics/governance artifacts

## Forbidden Changes

- No business logic change
- No persistence change
- No schema change
- No deep-link URL contract changes
- No hidden workflow transitions

## Completion Requirements

- Workspace mode can be entered/exited safely.
- Focused step remains action-complete and prominent.
- Non-focused steps remain accessible.
- Existing checklist runtime contracts do not regress.

