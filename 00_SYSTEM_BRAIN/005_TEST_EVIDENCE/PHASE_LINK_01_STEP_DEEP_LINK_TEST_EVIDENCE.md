# Test Evidence — PHASE_LINK_01_STEP_DEEP_LINK

## Coverage summary

Code review + static checks validate deep-link generation/parsing/consume logic and stale-step handling. DOM scrolling/highlighting and clipboard behavior require browser/UAT to be fully Verified.

## Detailed test items

| Test item | Evidence source | Status |
|-----------|------------------|--------|
| Deep link generation | `buildChecklistStepDeepLinkPath()` / `buildChecklistStepDeepLinkHref()` implementation reviewed; `stepDeepLinkChecks` covers `step=...` present | Verified |
| Deep link parsing | `parseChecklistStepIdFromSearchParams()` reviewed; `useChecklistStepDeepLinkConsumer` consumes only when `checklistReady` and `step` is present | Verified |
| Deep link navigation (valid step) | Consumer wiring calls dossier bus with `source: step_deep_link` and reuses cross-focus operations (scroll/expand/highlight) | Partially Verified |
| Deep link navigation (invalid/stale step id) | `requestDossierCrossFocus()` uses `validateDossierFocusRequest` against known checklist ids; stale ids return `GO_WITH_WARNINGS` and do not scroll | Partially Verified |
| Missing step handling (no `?step=`) | Consumer reads `step` and returns early when `null`; also uses `consumedRef` guard to prevent re-consume | Verified |
| URL cleanup behavior | Consumer clears `step` via `clearChecklistStepFromSearchParams` and performs `navigate(..., { replace: true })` | Partially Verified |
| Copy-link behavior | `copyChecklistStepLinkToClipboard()` uses `navigator.clipboard.writeText()` when available and returns warnings when unavailable | Partially Verified |
| Regression verification | `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts` pass + `npm run build` (apps/workboard) pass | Verified |

## Commands executed

- `npx tsx 00_SYSTEM_BRAIN/LINK/stepDeepLinkChecks.ts` → `GO_WITH_WARNINGS`
- `npm run build` (apps/workboard) → pass (see phase build log)
