# HOTFIX PHASE 89.1 — WebApp doGet Dispatcher Binding Fix — Prompt

READ FIRST:

00_SYSTEM_BRAIN/000_RUNTIME_ENTRYPOINT.md

---

## Issue

Web App URL with route query:

- `?route=/workspace`

returned:

```json
{"ok":false,"code":"GET_NOT_SUPPORTED"}
```

Meaning:

- Existing `doGet` (from webhook module) overrode Phase 89 renderer `doGet`.

## Mission

Fix `doGet` routing so these work:

- `?route=/workspace`
- `?route=/home-alert/my-queue`
- `?route=/home-alert/sla`
- `?route=workspace`
- `?path=/workspace`

Constraints:

- Preserve `action=ping`.
- Preserve old GET behavior when possible (legacy fallback).
- No destructive writes; no ENV-A; no AI runtime; no production claim.

## Approach

- Ensure **one effective global** `doGet(e)` is bound in a **late-loaded** dispatcher file.
- Keep Phase 89 renderer as `CbvWebAppWorkspace_doGet(e)` (non-global).
- Update `.clasp.json` `filePushOrder` to place dispatcher after webhook/router files.

