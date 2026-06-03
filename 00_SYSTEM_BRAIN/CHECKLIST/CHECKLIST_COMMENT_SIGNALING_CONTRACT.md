# Checklist Comment Signaling Contract

**Phase:** `PHASE_CHECKLIST_06_COMMENT_SIGNALING`  
**Status:** ACTIVE

## Objective

Improve checklist feedback/comment visibility using derived UI signaling only.

## Signal model

- `NONE`: no feedback comments
- `HAS_COMMENTS`: feedback count > 0
- `HAS_UNREAD_OR_NEW`: not used in this phase because current feedback model has no read/unread field

This phase applies **count-based signaling only**.

## Required behavior

- Show feedback count in row signal.
- Count > 0 is visually distinguishable from zero state.
- Feedback action remains clickable and behavior remains unchanged.

## Row attributes

- `data-checklist-comment-signal="none|has-comments"`
- `data-checklist-comment-count="<number>"`

## Boundaries

- No comment persistence changes.
- No schema changes.
- No fabricated unread/new marker without supporting data.
- Preserve focus/progress/copy-link/toast/interaction/link runtime behaviors.

