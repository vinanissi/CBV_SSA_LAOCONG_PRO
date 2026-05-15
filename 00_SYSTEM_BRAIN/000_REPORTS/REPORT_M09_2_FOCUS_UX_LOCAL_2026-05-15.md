# M09.2 — Focus Operation UX (local)

**Date:** 2026-05-15  
**Checks:** `node scripts/cbv-marker-contract-self-check.mjs` → **PASS** (M09 contract 32 markers).  
**GAS:** **NOT VERIFIED ON GAS**.

## Summary

Interactive task runtime panel (`999G`) now renders a **Focus Operation** layout: hero, session, structured context, next-action block, quick log (empty), quick note form, consolidated AppSheet messaging, action bar, workflow links, hidden debug strip. **10 new M09.2 markers** added to contract + HTML probe + `999H`. **11 new test checks** in `999H` (plus `M09_FOCUS_EMPTY_STATE_MARKERS`). `buildSession_` exposes **`focusMode`**. M09.1 row-key and SOP contracts preserved in bridge/runtime logic.

## Files

- `05_GAS_RUNTIME/999G_MILESTONE_09_INTERACTIVE_TASK_RUNTIME.js`
- `05_GAS_RUNTIME/999H_MILESTONE_09_INTERACTIVE_TASK_TEST_CONSOLE.js`
- `00_SYSTEM_BRAIN/000_TEST_CONSOLE/CBV_TCS_V1/contracts/CBV_M09_INTERACTIVE_TASK_MARKER_CONTRACT.json`
- `05_GAS_RUNTIME/html/WEBAPP_STAFF_WORKBOARD.html`
- `00_SYSTEM_BRAIN/000_PROMPTS/120_PHASE_M09_2_FOCUS_OPERATION_UX_UPGRADE_PROMPT.md`

## Next

`clasp push` → M09 → M07 → M08 test consoles; new Drive bundle append-only.
