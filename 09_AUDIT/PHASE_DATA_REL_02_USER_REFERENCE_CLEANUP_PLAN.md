# PHASE_DATA_REL_02 — User Reference Cleanup Plan

**Result:** PLAN_ONLY (no workbook mutation in this phase)  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_01_TASK_KEY_CONTRACT` (GO_WITH_WARNINGS)  
**Audit basis:** `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`

---

## 1. Summary

Workbook `DEV_FIN_CBV_SSA_LAOCONG_DB` has **valid task FKs** but **user reference drift**: local dev ids (`USR-LOCAL-*`), UAT actor (`UAT_OPERATOR`), and automation literal (`system`) appear in assignment and log fields without matching `USER_DIRECTORY.ID`. GAS **already blocks new invalid assignments** via `assertActiveUserId` on `OWNER_ID` / `REPORTER_ID`; drift is mostly **historical rows**, **Worker local mock**, and **log fallback** paths.

This phase defines inventory, mapping, formal system actor, fallback policy, and a staged migration — **no sheet writes**.

---

## 2. Authority alignment

| Source | Rule |
|--------|------|
| `01_SCHEMA/USER_DIRECTORY_SCHEMA.md` | `USER_DIRECTORY` is canonical; inbound refs should use **`ID`** |
| `03_SHARED/USER_TASK_FINANCE_MAPPING.md` | `OWNER_ID`, `REPORTER_ID`, `DONE_BY`, `CONFIRMED_BY` → `USER_DIRECTORY.ID`; `ACTOR_ID` → ID **or** email fallback |
| `03_SHARED/USER_RUNTIME_STANDARD.md` | No hardcoded production users in seed; logs may store email when user not in directory |
| `00_META/CBV_ADMIN_GOVERNANCE_STANDARD.md` | `system` / blank `cbvUser()` must not run admin mutations |

### Authority tension (documented, not resolved here)

| Topic | Design doc | Runtime reality |
|-------|------------|-----------------|
| `TASK_MAIN.OWNER_ID` storage | Schema: `USER_DIRECTORY.ID` | `gas-runtime-api/34_TaskDbUserDisplay.js` treats `OWNER_ID` as **USER_CODE or ID** for display lookup; values stay as stored |
| `getUserById` | ID primary | Also resolves **USER_CODE** and **email** (legacy compat) — `02_USER_SERVICE.js` |

**Decision for migration:** Target stored value = **`USER_DIRECTORY.ID`** for assignment fields. Display layer may continue to resolve by ID, USER_CODE, or email. Do not bulk-rewrite to USER_CODE-only.

---

## 3. Drift inventory (workbook audit)

From `DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md` (106 `TASK_MAIN`, 8 `USER_DIRECTORY` rows):

| Drift value | Severity | Tables / fields | Count (audit) | Class |
|-------------|----------|-----------------|---------------|--------|
| `USR-LOCAL-STAFF` | High | `TASK_MAIN.OWNER_ID` | 1+ | Dev/local mock id — **not** in `USER_DIRECTORY` |
| `USR-LOCAL-MGR` | High | `TASK_MAIN.REPORTER_ID` | 1+ | Dev/local mock id |
| `UAT_OPERATOR` | High | `TASK_MAIN.OWNER_ID`, `REPORTER_ID` | 2 refs | UAT API header / evidence runs — **not** in directory |
| `USR-LOCAL-*` (other) | Medium | `TASK_CHECKLIST.DONE_BY` | 3 rows | Local checklist completion |
| `system` | Low (expected) | `TASK_UPDATE_LOG.ACTOR_ID` | ~132 combined with local/UAT | Trigger / no session / `cbvUser()` fallback |
| `system` | Low | `FINANCE_LOG.ACTOR_ID` | 12 rows | Same |
| Email strings | Low/OK | `ACTOR_ID` in logs | (subset of 132) | Allowed fallback per mapping doc |

**Repo-only ids (must not reach production sheet via new writes):**

| Id | Where defined | Risk |
|----|---------------|------|
| `USR-LOCAL-ADMIN`, `USR-LOCAL-MGR`, `USR-LOCAL-STAFF`, `USR-LOCAL-FIN`, `USR-LOCAL-HS`, `USR-LOCAL-USER`, `USR-LOCAL-VIEW` | `workers/api/src/auth/userContext.ts`, `taskWriteStore.ts`, `mockData.ts` | Local Worker RF_11 writes |
| Same subset | `apps/workboard/src/modules/task/TaskCreateForm.tsx` `ASSIGNEE_OPTIONS` | UI can post local ids to API |
| `UAT_OPERATOR` | OCMS/checklist UAT evidence (POST body / scripts) | Can land on sheet if GAS path bypasses validation |

---

## 4. Affected tables and fields

| Table | Field | FK target | Validation today (GAS) | Validation today (Worker local) |
|-------|-------|-----------|------------------------|-------------------------------|
| `TASK_MAIN` | `OWNER_ID` | `USER_DIRECTORY.ID` | `assertActiveUserId` on create/update/assign — `20_TASK_SERVICE.js` | `taskWriteStore` accepts `USR-LOCAL-*` |
| `TASK_MAIN` | `REPORTER_ID` | `USER_DIRECTORY.ID` | `assertActiveUserId` when non-empty | Same |
| `TASK_CHECKLIST` | `DONE_BY` | `USER_DIRECTORY.ID` | **No** assert on write; stores mapped id or `''` — `markChecklistDone` | N/A |
| `TASK_UPDATE_LOG` | `ACTOR_ID` | ID or email; `system` de facto | `mapCurrentUserEmailToInternalId() \|\| cbvUser()` — `_addTaskUpdateLog` | `taskDb` passes through |
| `FINANCE_LOG` | `ACTOR_ID` | ID or email; `system` | `logFinance` same pattern — `30_FINANCE_SERVICE.js` | N/A |
| `FINANCE_TRANSACTION` | `CONFIRMED_BY` | `USER_DIRECTORY.ID` | Mapped id or `''` on confirm — no assert if empty | N/A |
| `ADMIN_AUDIT_LOG` | `ACTOR_ID` | ID or email (per mapping) | `98_audit_logger.js` uses `cbvUser()` | N/A |
| `HO_SO_MASTER` | `OWNER_ID` | `USER_DIRECTORY.ID` | `hosoValidateOptionalRefUser` when set | N/A |

Audit repair: `96_TASK_SYSTEM_AUDIT_REPAIR.js` flags `INVALID_USER_REF` when `OWNER_ID` / `REPORTER_ID` ∉ active user id set (built from `USER_DIRECTORY.ID` only in that pass).

---

## 5. Proposed mapping (requires live directory export)

**Step 0 — mandatory before any row update:** Export `USER_DIRECTORY` from target workbook (all columns). Build `user_ref_inventory.csv`:

```text
sheet,row_id,field,current_value,class,proposed_target_id,approved_by,applied_at
```

### 5.1 Formal system actor (recommended)

Add **one** canonical row (seed/migration script, admin-approved):

| Column | Value |
|--------|--------|
| `ID` | `UD_SYSTEM` (fixed; do not use `cbvMakeId` if id must be stable across envs) |
| `USER_CODE` | `SYSTEM` |
| `FULL_NAME` | `System (automated)` |
| `DISPLAY_NAME` | `Hệ thống` |
| `EMAIL` | *(empty)* |
| `ROLE` | `ADMIN` or dedicated `SYSTEM` enum if added later |
| `STATUS` | `ACTIVE` |
| `IS_SYSTEM` | `TRUE` |
| `ALLOW_LOGIN` | `FALSE` |
| `NOTE` | `[SYSTEM] Reserved actor for triggers/bootstrap — not assignable` |

**Reserved literals (document only, do not use as `OWNER_ID`):**

| Literal | Meaning | Display resolution |
|---------|---------|-------------------|
| `system` | `cbvUser()` when no Google session | Map to `UD_SYSTEM` in **new** log rows only (optional backfill) |
| `UAT_OPERATOR` | UAT harness actor | Never seed in prod directory; replace rows with real operator `ID` |
| `USR-LOCAL-*` | Dev/Worker mock | Map to real users or mark `[DEV_ORPHAN]` |

**Assignability rule:** `assertActiveUserId` must **reject** `UD_SYSTEM` for `OWNER_ID` / `REPORTER_ID` / `DONE_BY` / `CONFIRMED_BY` (add `IS_SYSTEM === true` guard in PHASE 05).

### 5.2 Local / UAT id mapping (template)

Until export is available, use **role-intent** mapping — **replace IDs below with actual `USER_DIRECTORY.ID` from export**:

| Drift id | Intent | Proposed mapping strategy |
|----------|--------|---------------------------|
| `USR-LOCAL-STAFF` | Operator / staff | `USER_DIRECTORY` row with `ROLE=OPERATOR` (or `USER`) and matching real person |
| `USR-LOCAL-MGR` | Manager | Row with `ROLE=MANAGER` or `ADMIN` per org |
| `USR-LOCAL-FIN` | Finance | Row with finance-capable user |
| `USR-LOCAL-HS` | Hồ sơ | HO_SO-capable operator |
| `USR-LOCAL-ADMIN` | Admin | Directory `ROLE=ADMIN` |
| `UAT_OPERATOR` | UAT only | Map to operator who ran UAT **or** leave row + `NOTE=[UAT_HISTORICAL]` if task is disposable |

**Do not** add `USR-LOCAL-*` as permanent `USER_DIRECTORY.ID` values in production unless explicitly adopting them as `USER_CODE` aliases (not recommended — collides with Worker mock contract).

### 5.3 `system` and email in `ACTOR_ID`

| Current | Action |
|---------|--------|
| Valid `USER_DIRECTORY.ID` | Keep |
| Corporate email not in directory | Keep (audit trail) OR invite user then backfill to `ID` |
| `system` | Optional backfill → `UD_SYSTEM` (low priority, 259 log rows) |
| `USR-LOCAL-*` / `UAT_OPERATOR` in logs | Backfill using same table as §5.2 or leave as historical orphan |

---

## 6. Updated ACTOR_ID / assignment fallback policy (proposed authority)

Merge into `03_SHARED/USER_TASK_FINANCE_MAPPING.md` in a follow-up doc commit (PHASE 05 or small DOC patch):

### Assignment fields (`OWNER_ID`, `REPORTER_ID`, `DONE_BY`, `CONFIRMED_BY`)

1. **Store:** `USER_DIRECTORY.ID` only.  
2. **Validate on write:** `assertActiveUserId` (ACTIVE, not deleted, **not `IS_SYSTEM`**).  
3. **Default on create:** `mapCurrentUserEmailToInternalId()`; if null → `REPORTER_ID` / `CONFIRMED_BY` = `''` (not email).  
4. **`DONE_BY`:** Require non-empty `USER_DIRECTORY.ID` when `IS_DONE=true` (future guard).

### Log fields (`ACTOR_ID` in `TASK_UPDATE_LOG`, `FINANCE_LOG`, `ADMIN_AUDIT_LOG`)

1. **Preferred:** `USER_DIRECTORY.ID` from `mapCurrentUserEmailToInternalId()`.  
2. **Fallback:** Session email when user not in directory.  
3. **Automation:** Use `UD_SYSTEM` instead of literal `system` for **new** rows after system user exists.  
4. **Reserved:** Literal `system` remains readable in historical rows; `getUserDisplay('system')` should resolve via alias map or return `Hệ thống`.  
5. **Forbidden in new rows:** `USR-LOCAL-*`, `UAT_OPERATOR` unless those ids exist in `USER_DIRECTORY` with `NOTE=[DEV]`.

### Runtime surfaces

| Surface | Action |
|---------|--------|
| GAS `createTask` / `updateTask` | Keep `assertActiveUserId` — already correct |
| GAS `markChecklistDone` | Add `assertActiveUserId` when `actorId` non-empty (PHASE 05) |
| GAS `logFinance` / `_addTaskUpdateLog` | Prefer `UD_SYSTEM` over `cbvUser()` when session is `system` (PHASE 05) |
| Worker `taskWriteStore` | Document: local ids **must not** sync to production GAS DB |
| Workboard `TaskCreateForm` | Replace `ASSIGNEE_OPTIONS` with API-fed `getActiveUsers()` / GAS user list (implementation phase) |
| UAT scripts | Pass real `USER_DIRECTORY.ID` in POST body, not `UAT_OPERATOR` |

---

## 7. Migration phases (execution order)

| Step | Scope | Mutates data? | Owner |
|------|--------|---------------|--------|
| M0 | Export inventory + sign-off mapping table | No | Operator + admin |
| M1 | Insert `UD_SYSTEM` via `seedUserDirectory` extension or one-off admin row | Yes (1 row) | GAS admin |
| M2 | `TASK_MAIN` fix 4 high-severity OWNER/REPORTER refs | Yes (≤4 cells) | Manual or `20_TASK_MIGRATION_HELPER` script |
| M3 | `TASK_CHECKLIST.DONE_BY` (3 rows) | Yes | Same |
| M4 | Optional log backfill `system` → `UD_SYSTEM` | Yes (bulk) | Deferred — audit only |
| M5 | FE/Worker: stop emitting `USR-LOCAL-*` against prod | No code→sheet | Dev deploy |
| M6 | Re-run `auditUserDirectory` + `96_TASK_SYSTEM_AUDIT_REPAIR` | No | Verify |

### Rollback

| Step | Rollback |
|------|----------|
| M1 | Soft-delete `UD_SYSTEM` (`IS_DELETED=TRUE`) — do not reuse id for a person |
| M2–M3 | Restore prior cell values from M0 CSV backup |
| M4 | Restore `ACTOR_ID` column snapshot from backup sheet tab |
| M5 | Revert FE deploy only |

### Proposed GAS inventory function (not implemented in PHASE 02)

```javascript
// Proposal: auditUserReferenceDrift_() in 09_AUDIT or 96_TASK_SYSTEM_AUDIT_REPAIR
// - Load USER_DIRECTORY ids + user_codes + emails into sets
// - Scan TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG
// - Emit { table, rowId, field, value, driftClass: LOCAL|UAT|SYSTEM|EMAIL|OK }
```

---

## 8. Findings fixed (this phase)

| Finding | Action |
|---------|--------|
| No consolidated user-ref migration plan | This document |
| Ambiguous `system` handling | Proposed `UD_SYSTEM` + reserved literal policy |
| Local/UAT ids undocumented | Classified + mapping template |
| Drift between schema (ID) and taskDb display (CODE) | Documented; migration targets **ID** |

---

## 9. Findings deferred

| Finding | Target phase |
|---------|----------------|
| Workbook row updates | M2–M4 after admin sign-off |
| `getUserDisplay('system')` | PHASE 05 runtime guard |
| `TaskCreateForm` local assignees | Workboard + API user list phase |
| `DONE_BY` assert on complete | PHASE 05 |
| `USER_DIRECTORY` runtime columns (`DON_VI_ID`, `TEAM_ID`, …) vs architecture | Separate schema doc phase |
| Bulk email→ID backfill in logs | Optional M4 |

---

## 10. Static inspection

```bash
node 09_AUDIT/scripts/userReferencePhase02Checks.mjs
```

Expected: **GO_WITH_WARNINGS** (local mock ids present in Worker/FE by design).

**2026-06-03 run:** `GO_WITH_WARNINGS` — 7/7 checks pass; 20 drift hits confined to `apps/workboard` + `workers/api` (no `05_GAS_RUNTIME` production paths).

---

## 11. Tests run

| Command | Result |
|---------|--------|
| `node 09_AUDIT/scripts/userReferencePhase02Checks.mjs` | **GO_WITH_WARNINGS** (7/7 pass) |
| Workbook FK re-validation | Not run (xlsx not in repo) |
| `npm run typecheck` (workers/workboard) | Not required — no runtime code change in PHASE 02 |

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Wrong user mapped in M2 | Mandatory M0 CSV + single-row dry run |
| `UD_SYSTEM` used as assignee | `IS_SYSTEM` + assert guard |
| Breaking UAT scripts | Keep `UAT_OPERATOR` in test env only; document prod ban |
| taskDb still shows raw `USR-*` codes | After M2, display resolves via directory |

---

## 13. Next recommended phase

**PHASE_DATA_REL_03 — Finance Relationship Repair Plan** (`VP54`, `FINANCE_LOG.FIN_ID` orphans).

---

## 14. Files changed (PHASE 02)

| File | Change |
|------|--------|
| `09_AUDIT/PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP_PLAN.md` | **NEW** — this plan |
| `09_AUDIT/scripts/userReferencePhase02Checks.mjs` | **NEW** — static drift discovery |
| `00_SYSTEM_BRAIN/006_PHASES/PHASE_REGISTRY.md` | Registry row |
