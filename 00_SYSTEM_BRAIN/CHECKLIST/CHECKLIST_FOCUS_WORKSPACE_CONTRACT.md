# Checklist Focus Workspace Contract

**Phase:** `PHASE_CHECKLIST_09_FOCUS_WORKSPACE`  
**Status:** ACTIVE

## Objective

Provide a local UI-only focus workspace mode where one focused checklist step becomes the primary work surface and other steps are minimized.

## State

- `focusWorkspaceEnabled: boolean`
- `focusedChecklistItemId: string | null`

## Required behavior

- Enter/exit focus workspace.
- Previous/next focused step navigation with safe boundaries.
- Minimized non-focused step navigator with click-to-focus.
- Deep-link-resolved step remains compatible with focus.
- No data persistence changes; UI-only.

## Boundaries

- No workflow/business/schema/persistence changes.
- Preserve existing interaction/toast/focus/progress/copy/comment/compact/link/sheet runtime behaviors.

