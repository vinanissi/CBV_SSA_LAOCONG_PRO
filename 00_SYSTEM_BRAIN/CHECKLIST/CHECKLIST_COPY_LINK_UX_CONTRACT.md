# Checklist Copy Link UX Contract

**Phase:** `PHASE_CHECKLIST_05_COPY_LINK_UX`  
**Status:** ACTIVE

## Objective

Polish checklist step copy-link UX while preserving LINK Runtime v1 deep-link contract.

## URL contract

- Must use: `/inbox/<taskId>?step=<checklistItemId>`
- `step` parameter appears exactly once.
- `taskId` and `checklistItemId` are required.

## Copy UX behavior

- Copy action is visible/discoverable on each checklist row.
- Copy success feedback: `Đã sao chép link`.
- Copy failure feedback: `Không thể sao chép link`.
- Clipboard failure is not silent.
- Copy action does not mutate checklist/task state.

## Clipboard behavior

- Prefer `navigator.clipboard.writeText` when available.
- Failures must show error feedback.
- Rapid duplicate copy requests should be guarded to reduce noisy toasts.

## Boundaries

- No deep-link parser changes.
- No step-anchor contract changes.
- Keep compatibility with toast, focus mode, progress visualization, and interaction feedback.

