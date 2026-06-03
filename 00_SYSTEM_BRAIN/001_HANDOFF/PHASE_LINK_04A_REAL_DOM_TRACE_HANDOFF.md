# Handoff — PHASE_LINK_04A_REAL_DOM_TRACE

## Result

`GO_WITH_WARNINGS`

## What changed

- `useChecklistStepDeepLinkConsumer` now emits gated trace events when enabled by env/window flag.
- Trace events are retained in `window.__CBV_LINK_TRACE_EVENTS__` (bounded buffer).
- Diagnostics updated to check trace-gating presence.

## How to capture real DOM trace

1. Set `VITE_LINK_DEEP_LINK_TRACE_ENABLED=true` (or in console: `window.__CBV_LINK_TRACE_ENABLED__ = true`).
2. Open `/inbox/<taskId>?step=<checklistItemId>`.
3. After resolution, inspect `window.__CBV_LINK_TRACE_EVENTS__`.
4. Record sanitized trace excerpt and optional screenshot in next UAT evidence update.

## Verify commands

```bash
npx tsx 00_SYSTEM_BRAIN/LINK/deferredStepResolutionChecks.ts
npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts
cd apps/workboard && npm run build
```

