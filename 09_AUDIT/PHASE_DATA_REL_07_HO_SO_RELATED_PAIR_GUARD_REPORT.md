# PHASE_DATA_REL_07 — HO_SO RELATED_* Pair Guard Report

**Result:** GO  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_05_RUNTIME_GUARD_AUDIT`, `PHASE_DATA_REL_06_CLOSEOUT_REAUDIT`

---

## 1. Summary

Closed open finding: `createHoSoRelation` allowed **half-populated** `RELATED_TABLE` / `RELATED_RECORD_ID` (validate only when both non-empty). Added `hosoAssertRelatedRecordPair_` — both fields required together, or both empty; when both set, calls `hosoValidateRelationTarget`.

`addHosoRelation` already required both fields via `ensureRequired` — unchanged.

---

## 2. Files changed

| File | Change |
|------|--------|
| `05_GAS_RUNTIME/10_HOSO_SERVICE.js` | `hosoAssertRelatedRecordPair_`; `createHoSoRelation` uses it |
| `09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs` | Phase 07 pair guard checks |
| `09_AUDIT/PHASE_DATA_REL_07_HO_SO_RELATED_PAIR_GUARD_REPORT.md` | **NEW** |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` | Registry row |

---

## 3. Behavior (after)

| Input | Result |
|-------|--------|
| Both empty | OK (master–master edge only) |
| Both set | OK after `hosoValidateRelationTarget` |
| `RELATED_TABLE` only | Error: `RELATED_RECORD_ID required when RELATED_TABLE is set` |
| `RELATED_RECORD_ID` only | Error: `RELATED_TABLE required when RELATED_RECORD_ID is set` |

---

## 4. Findings fixed

| Finding | Action |
|---------|--------|
| Partial RELATED_* on `createHoSoRelation` | Pair guard + FK validate when complete |
| Static check too weak (`if (relTable && relId &&`) | Replaced with `HOSO_CREATE_RELATED_PAIR_GUARD` |

---

## 5. Findings deferred

| Finding | Phase |
|---------|--------|
| Workbook `FROM_TYPE` graph normalization | Phase 04 migration (admin sign-off) |
| Satellite `RELATED_TABLE` whitelist | M-HO-3 |
| Phase 05/06 report wording update | **Done** — Phase 08 |

---

## 6. Tests run

```bash
node 09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs
npm run typecheck --prefix workers/api
npm run typecheck --prefix apps/workboard
```

| Command | Result |
|---------|--------|
| `runtimeGuardPhase05Checks.mjs` | **GO_WITH_WARNINGS** — 13/13 pass; Phase 07 pair checks included |
| `workers/api` typecheck | **Pass** |
| `apps/workboard` typecheck | **Pass** |

---

## 7. Risks / rollback

| Risk | Mitigation |
|------|------------|
| Clients sent only `RELATED_TABLE` | Now throws; fix client or supply both fields |

**Rollback:** Revert `hosoAssertRelatedRecordPair_` block in `10_HOSO_SERVICE.js`.

---

## 8. Next recommended phase

**PHASE_DATA_REL_08 — Report / Evidence Consistency Sweep** (update Phase 05/06 reports to reference Phase 07).
