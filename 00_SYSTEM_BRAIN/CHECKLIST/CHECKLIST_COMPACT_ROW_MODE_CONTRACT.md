# Checklist Compact Row Mode Contract

**Phase:** `PHASE_CHECKLIST_08_COMPACT_ROW_MODE`  
**Status:** ACTIVE

## Objective

Increase checklist information density by compacting row presentation while preserving readability and all prior checklist UX/runtime behaviors.

## Compact requirements

- Normal row layout is compacted (target visual height approx. `80-120px` where content allows).
- Focused row remains prominent but not excessively tall.
- Counts/signals remain visible: comments, attachments, links, history.
- Copy-link action remains discoverable.
- Pending/saved/failed row state remains visible.

## Detail safety

- Metadata may truncate in compact view (`line clamp`) but critical access is preserved through existing expanded/detail UI.
- No critical metadata is permanently removed.

## Boundaries

- No business logic/persistence/schema/workflow changes.
- Preserve focus/progress/copy-link/comment/toast/interaction/link/sheet contracts.

