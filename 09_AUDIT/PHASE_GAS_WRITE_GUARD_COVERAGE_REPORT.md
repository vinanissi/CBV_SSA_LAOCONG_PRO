# PHASE_DATA_REL_11 — GAS Write Guard Coverage Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_05_RUNTIME_GUARD`, `PHASE_DATA_REL_07_HO_SO_RELATED_PAIR_GUARD`, `PHASE_WORKER_ENVELOPE_CONTRACT`

---

## 1. Summary

Broadened the Phase 05 runtime-guard audit into a **coverage matrix** across all primary GAS write services (`20_TASK`, `30_FINANCE`, `10_HOSO`, `45_SHARED_WITH`). **No new runtime code** in this phase — inventory + static verification only.

**Tier A (FULL_ACTIVE):** Task create/update/assign/checklist-done; Finance `DON_VI_ID` / `CONFIRMED_BY` when set.  
**Tier B (EXISTS_REF):** HO_SO user/DON_VI via `hosoValidateOptionalRef*` — row must exist, **not** `STATUS=ACTIVE`.  
**Tier C (GAPS):** `shareTaskWith` / `unshareTaskWith` — no `assertActiveUserId`; log `ACTOR_ID` paths deferred to Phase 02.

---

## 2. Coverage matrix

| Domain | Write function | Guard tier | User ref | DON_VI ref | Parent FK | Notes |
|--------|----------------|------------|----------|------------|-----------|-------|
| TASK | `createTask` | FULL_ACTIVE | `assertActiveUserId` | `assertActiveDonViId` | — | Phase 05 |
| TASK | `updateTask` | FULL_ACTIVE | patch | patch | — | |
| TASK | `assignTask` | FULL_ACTIVE | owner | — | task | |
| TASK | `markChecklistDone` | FULL_ACTIVE | `DONE_BY` | — | checklist | Phase 05 |
| TASK | `addChecklistItem` | PARENT_FK | — | — | `taskFindById` | No user fields |
| TASK | `addTaskAttachment` | ENUM_PARENT | — | — | task + enum | |
| TASK | `_addTaskUpdateLog` | DEFERRED | email/system OK | — | task | Phase 02 |
| FINANCE | `createTransaction` | FULL_ACTIVE_OPTIONAL | — | `financeAssertOptionalDonViId_` | — | |
| FINANCE | `updateDraftTransaction` | FULL_ACTIVE_OPTIONAL | — | patch DON_VI | parent | |
| FINANCE | `logFinance` | PARENT_FK | mapped actor | — | `FIN_ID` → FIN row | |
| FINANCE | `setFinanceStatus` | FULL_ACTIVE_OPTIONAL | `CONFIRMED_BY` | — | txn | on CONFIRMED |
| FINANCE | `createFinanceAttachment` | PARENT_FK | — | — | `FINANCE_ID` | |
| HO_SO | `createHoSo` / `updateHoso` | EXISTS_REF | `hosoValidateOptionalRefUser` | `hosoValidateOptionalRefDonVi` | type master | Not ACTIVE-only |
| HO_SO | `addHosoRelation` | RELATION_PAIR_REQUIRED | — | — | HO_SO + target | Both RELATED_* required |
| HO_SO | `createHoSoRelation` | RELATION_PAIR_SYMMETRIC | — | — | FROM/TO master | `hosoAssertRelatedRecordPair_` (Phase 07) |
| SHARED | `shareTaskWith` | **GAP** | **none** | — | task row | **Recommended:** `assertActiveUserId` |

---

## 3. Guard tier definitions

| Tier | Meaning | Example |
|------|---------|---------|
| `FULL_ACTIVE` | `assertActiveUserId` / `assertActiveDonViId` | `createTask` |
| `FULL_ACTIVE_OPTIONAL` | Assert only when field non-empty | `financeAssertOptionalDonViId_` |
| `EXISTS_REF` | `_findById` / `donViFindById` without ACTIVE check | `hosoValidateOptionalRefUser` |
| `PARENT_FK` | Parent entity must exist | `logFinance`, `addChecklistItem` |
| `RELATION_PAIR_*` | RELATED_TABLE + RELATED_RECORD_ID rules | Phase 07 pair helper |
| `DEFERRED_ACTOR` | Logs allow system/email until UD_SYSTEM | `_addTaskUpdateLog` |
| `GAP_NO_USER_ASSERT` | Known missing guard | `shareTaskWith` |

---

## 4. Findings (gaps — no code change this phase)

| ID | Severity | Finding | Recommended follow-up |
|----|----------|---------|------------------------|
| G-11-01 | Medium | `shareTaskWith` / `unshareTaskWith` do not validate `userId` in `USER_DIRECTORY` ACTIVE | Add `assertActiveUserId` in `_updateSharedWith` after Phase 02 seed |
| G-11-02 | Low | HO_SO `OWNER_ID` / `MANAGER_USER_ID` — exists-only, inactive users allowed | Align with `assertActiveUserId` when HO_SO UX stable |
| G-11-03 | Low | HO_SO `DON_VI_ID` — exists-only vs finance `assertActiveDonViId` | Unify after `VP54` migration (Phase 03) |
| G-11-04 | Info | Task/finance logs use email or `system` for `ACTOR_ID` | Phase 02 `UD_SYSTEM` + policy doc |
| G-11-05 | Info | `addChecklistItem` — no `CREATED_BY` user assert | Uses `cbvUser()` session only |

---

## 5. Out of scope (unchanged from Phase 05)

| Area | Reason |
|------|--------|
| `workers/api` / Workboard local stores | Not sheet authority |
| `gas-runtime-api/40_TaskDbService.js` | Legacy RF_12 |
| Schema bootstrap / column insert | Admin-only (`45_SHARED_WITH` `add*Column`) |
| Historical workbook rows | Migration phases 02–04 |

---

## 6. Static verification

```bash
node 09_AUDIT/scripts/gasWriteGuardCoveragePhase11Checks.mjs
node 09_AUDIT/scripts/runtimeGuardPhase05Checks.mjs
node 09_AUDIT/scripts/runDataRelAuditSuite.mjs
```

| Script | Result |
|--------|--------|
| `gasWriteGuardCoveragePhase11Checks.mjs` | **GO_WITH_WARNINGS** (SHARED_WITH gap) |
| `runtimeGuardPhase05Checks.mjs` | **GO** (includes Phase 07) |
| `runDataRelAuditSuite.mjs` | **GO_WITH_WARNINGS** (Phase 03 finance plan) |

---

## 7. Files added

| File | Role |
|------|------|
| `09_AUDIT/scripts/gasWriteGuardCoveragePhase11Checks.mjs` | Coverage inventory + structural checks |
| `09_AUDIT/PHASE_GAS_WRITE_GUARD_COVERAGE_REPORT.md` | This report |

---

## 8. Next recommended phase

**PHASE_DATA_REL_12 — Schema / Authority Doc Sweep** (`90_BOOTSTRAP_SCHEMA`, `03_SHARED/*`, ADR cross-links)
