# Handoff — PHASE_RF_07 Real Usage UAT and Runtime Lock

## Summary

RF_07 locks CBV Operational Workspace Runtime v1. Contract docs in `docs/runtime-lock/`. Tag prepared: **`v2.4.1-RF-RUNTIME-LOCK-V1`** (do not push unless requested).

## Verify

1. `clasp push`
2. Run RF_02 → RF_07 tests in 🧪 CBV Test Console
3. Browser walkthrough per `docs/runtime-lock/UAT_CHECKLIST_V1.md`
4. Review `docs/runtime-lock/RUNTIME_LOCK_DECISION.md`

## Stabilization fix

- RF_02 nav no longer uses stub links to `/workspace` for Hồ sơ/Tài chính — permission-gated real routes.

## Locked semantics

- Read-first, manual-first, ACTIVE_READONLY plugins, EXECUTION_LOCKED writes.

## Do NOT after lock

- Schema change, runtime rewrite, WebApp auto-actions, breaking route renames.

## Next phase

**PHASE_RF_08_AI_ASSISTED_OPERATOR_LAYER** — must respect runtime lock v1.
