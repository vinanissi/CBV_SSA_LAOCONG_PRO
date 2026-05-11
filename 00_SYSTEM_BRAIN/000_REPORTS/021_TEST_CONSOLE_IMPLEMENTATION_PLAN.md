---
doc: 021_TEST_CONSOLE_IMPLEMENTATION_PLAN
phase: PHASE_B_TEST_RUNTIME_GREEN_BASELINE
purpose: Design-only rollout plan for thin-wrapper Test Console (no production menu code in this phase)
---

# Test Console — implementation plan (delegate-only)

## Thin-wrapper strategy

- **Single** top-level menu label: `🧪 CBV Test Console` (or plain text per org style).
- Each item is a **one-line delegate** to an existing global already registered in the host project (TASK or MC).

## Delegate-only design

- **No new** business mutations: wrappers must not call `taskUpdate`, `hosoCreate`, or any `TASK_MAIN` writers.
- **Allowed:** call `TaskObs_menuHealthCheck`, `TaskObs_menuRunSelfTest`, `TaskObs_menuBootstrapDryRun`, etc., as already implemented.

## Runtime isolation

- TASK script: only delegates to **TASK**-scoped functions (`TaskObs_*`, `buildTaskObsMenu_`).
- MAIN_CONTROL script: only delegates to **`MC_Obs_*`** menu handlers.
- **Never** copy-paste MC code into TASK project to “fake” MC tests — use separate deployment or documented webapp bridge only.

## Menu ownership

| Host project | Owns menu | Notes |
|--------------|-----------|-------|
| TASK Apps Script | `🛡️ TASK OBS` today; may add sibling `🧪 CBV Test Console` | Keeps TASK operator UX self-contained. |
| MAIN_CONTROL | `🛡️ MAIN_CONTROL OBS` | MC operators use MC project. |

## TASK vs MAIN_CONTROL boundary

- **TASK console** exposes TASK OBS + (optional) links/docs to run MC tests “open other spreadsheet” is UX only — not silent cross-id write.
- **MC console** remains authoritative for control-plane OBS sheets (`MC_Obs_*`).

## Rollout order

1. Staging TASK: green baseline checklist complete (`021_TASK_OBS_GREEN_BASELINE_CHECKLIST.md`).
2. Add `buildCbvTestConsoleMenu_()` in TASK project **only** after operator approval; bind menu items to existing `TaskObs_menu*` strings.
3. Document in RUN report + `MEMORY_INDEX` pointer.
4. Repeat pattern on MC project if desired (separate PR/commit).
5. Production: last — same checklist with prod id **only** after explicit governance sign-off.

## Non-goals (this phase)

- No `onOpen` merge conflict resolution beyond add-only second menu (coordinate with existing `307` `onOpen`).
- No monolith merge to unify menus.
