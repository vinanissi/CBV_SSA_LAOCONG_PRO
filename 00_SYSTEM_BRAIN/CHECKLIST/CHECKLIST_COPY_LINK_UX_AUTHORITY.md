# Checklist Copy Link UX Authority

**Phase:** `PHASE_CHECKLIST_05_COPY_LINK_UX`  
**Status:** ACTIVE

## Authority Scope

Checklist row copy-link interaction polish and clipboard feedback UX.

## Allowed Changes

- Copy-link button label/icon/feedback text
- Clipboard success/failure handling
- Copy-state guard for rapid duplicate actions
- Diagnostics and governance artifacts

## Forbidden Changes

- No business logic change
- No persistence change
- No schema change
- No Link Runtime v1 URL contract change
- No deep-link parser/anchor redesign

## Completion Requirements

- Copy action remains discoverable.
- Success/failure feedback is explicit and non-silent.
- Copied URL contract remains valid.
- Existing focus/progress/toast/interaction/deep-link behavior remains stable.

