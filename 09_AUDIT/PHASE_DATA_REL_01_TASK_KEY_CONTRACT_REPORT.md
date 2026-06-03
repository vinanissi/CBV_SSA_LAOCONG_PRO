# PHASE_DATA_REL_01 — Task Key Contract Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Audit basis:** `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md`

---

## 1. Summary

Locked the task parent/child key contract: **`TASK_MAIN.ID`** is the physical primary key; child **`TASK_ID`** columns reference **`TASK_MAIN.ID`**; runtime DTO field **`taskId`** maps to **`ID`**. No physical **`TASK_MAIN.TASK_ID`** column exists or was added.

---

## 2. Files changed

| File | Change |
|------|--------|
| `03_SHARED/TASK_KEY_CONTRACT.md` | **NEW** — canonical contract |
| `01_SCHEMA/TASK_MAIN_SCHEMA.md` | Key contract section |
| `01_SCHEMA/TASK_CHECKLIST_SCHEMA.md` | FK → `TASK_MAIN.ID` |
| `01_SCHEMA/TASK_ATTACHMENT_SCHEMA.md` | FK → `TASK_MAIN.ID` |
| `01_SCHEMA/TASK_UPDATE_LOG_SCHEMA.md` | FK → `TASK_MAIN.ID` |
| `03_SHARED/TASK_SYSTEM_ARCHITECTURE.md` | Reference table + hierarchy |
| `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md` | TASK_MAIN note + child FK targets |
| `06_DATABASE/TASK_MAIN_SCHEMA.md` | Child FK table |
| `gas-runtime-api/31_TaskDbSchemaMap.js` | Header comment |
| `apps/workboard/src/api/contracts.ts` | `TaskItem.taskId` doc comment |
| `09_AUDIT/scripts/taskKeyContractPhase01Checks.mjs` | **NEW** — static checks |

---

## 3. Findings fixed (contract clarity)

| Finding | Action |
|---------|--------|
| Ambiguous “Ref TASK_MAIN” on child `TASK_ID` | Updated `01_SCHEMA/*` + architecture docs to **FK → TASK_MAIN.ID** |
| No single authority doc for PK vs DTO `taskId` | Added `03_SHARED/TASK_KEY_CONTRACT.md` |
| Risk of implying missing `TASK_MAIN.TASK_ID` column | Explicit “do not add” in contract + TASK_MAIN schema |

---

## 4. Findings deferred

| Finding | Reason |
|---------|--------|
| `06_DATABASE/TASK_SCHEMA.md` still says `→ TASK_MAIN` without `.ID` | Legacy DB doc pack; non-runtime; update in doc sweep or PHASE 06 |
| `02_MODULES/TASK_CENTER/DATA_MODEL.md` same phrasing | Module mirror; low runtime impact |
| AppSheet manuals (`04_APPSHEET/*`) filter text already correct (`[TASK_ID] = [TASK_MAIN].[ID]`) | No code change required |
| `OCMS_DOMAIN_MODEL.md` row `TASK_ID \| Live (TASK_MAIN)` in archives | Misleading but archived; live `00_SYSTEM_BRAIN/OCMS/OCMS_DOMAIN_MODEL.md` uses mutation path wording only |

---

## 5. Audit before / after

### Runtime (unchanged — already correct)

| Layer | Before | After |
|-------|--------|-------|
| GAS `taskDbCreateTask_` | Writes `ID` via `taskDbMakeId_('TASK')` | Same |
| GAS map row | `taskId` ← `rec.ID` | Same + documented |
| `CBV_TASK_DB_EXPECTED.TASK_MAIN` | No `TASK_ID` column | Same |
| `90_BOOTSTRAP_AUDIT_SCHEMA` FK rules | `parentKey: 'ID'` | Same |
| Worker / FE `TaskItem.taskId` | Maps to sheet `ID` | Comment added |

### Workbook validation (from DATA_RELATIONSHIP audit)

| Relationship | Status |
|--------------|--------|
| `TASK_CHECKLIST.TASK_ID` → `TASK_MAIN.ID` | OK (106 tasks) |
| `TASK_ATTACHMENT.TASK_ID` → `TASK_MAIN.ID` | OK |
| `TASK_UPDATE_LOG.TASK_ID` → `TASK_MAIN.ID` | OK |
| Checklist satellites `TASK_ID` → `TASK_MAIN.ID` | OK |

---

## 6. Static inspection

```bash
node 09_AUDIT/scripts/taskKeyContractPhase01Checks.mjs
```

Checks:

- `TASK_KEY_CONTRACT.md` present
- `TASK_MAIN` expected headers exclude parent `TASK_ID`
- `taskDbMapTaskSummaryRow_` uses `rec.ID` for `taskId`
- Bootstrap FK audit uses `parentKey: 'ID'`
- Zero runtime-code hits for `TASK_MAIN.TASK_ID` as a column reference (GAS/Worker/FE paths)

---

## 7. Tests run

| Test | Result |
|------|--------|
| `node 09_AUDIT/scripts/taskKeyContractPhase01Checks.mjs` | Pass (GO_WITH_WARNINGS suite) |
| `npm run build` (`apps/workboard`) | Pass (contracts comment only) |
| `workers/api` typecheck | Not run — no Worker logic change |

---

## 8. Risks / rollback

| Risk | Mitigation |
|------|------------|
| Developers add `TASK_MAIN.TASK_ID` in new code | Contract doc + schema “do not add”; static grep check |
| AppSheet ref misconfigured to wrong parent column | Manual already uses `[TASK_MAIN].[ID]` |
| Rollback | Revert doc commits only; no data migration |

---

## 9. Next recommended phase

**PHASE_DATA_REL_02 — User Reference Cleanup Plan** (`09_AUDIT/PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP_PLAN.md`)

---

## 10. Authority alignment

| Source | Aligned |
|--------|---------|
| `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md` | Yes |
| `01_SCHEMA/TASK_MAIN_SCHEMA.md` | Yes |
| `gas-runtime-api/31_TaskDbSchemaMap.js` | Yes |
| `09_AUDIT/DATA_RELATIONSHIP_AUDIT_REPORT_20260603.md` §3, §5 | Yes |

No new schema columns. No CASE runtime introduced.
