# Checklist Comment Signaling Authority

**Phase:** `PHASE_CHECKLIST_06_COMMENT_SIGNALING`  
**Status:** ACTIVE

## Authority Scope

Checklist row comment/feedback signaling UX based on existing in-memory feedback data.

## Allowed Changes

- Derived count display
- Row comment signal attributes/classes
- Non-destructive visual distinction between zero and non-zero comment count
- Diagnostics and governance artifacts

## Forbidden Changes

- No business logic change
- No persistence change
- No schema change
- No unread-state invention without existing data support
- No deep-link/copy-link/focus/progress contract changes

## Completion Requirements

- Neutral zero-comment state.
- Distinct non-zero comment signal with count.
- Existing feedback open flow remains usable.
- Runtime regressions (focus/progress/copy-link/toast/link/sheet) are not introduced.

