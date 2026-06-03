# PHASE_DATA_REL_13 — Frontend Data Contract Audit Report

**Result:** GO_WITH_WARNINGS  
**Date:** 2026-06-03  
**Branch:** `phase/data-relationship-refactor-prep`  
**Prerequisites:** `PHASE_DATA_REL_12_SCHEMA_AUTHORITY_DOC_SWEEP`, `PHASE_DATA_REL_02_USER_REFERENCE_CLEANUP_PLAN`

---

## 1. Summary

Audited **Workboard** (`apps/workboard`) and **Worker** (`workers/api`) for alignment with **`03_SHARED/TASK_KEY_CONTRACT.md`** and user-ref policy. **No code changes required** for contract correctness; dev-only `USR-LOCAL-*` stubs and two create-form paths documented.

**Canonical rule (locked):** API/FE field **`taskId`** = sheet **`TASK_MAIN.ID`**. Child checklist satellites use column **`TASK_ID`** on child sheets only.

---

## 2. Task key contract (FE / Worker)

| Surface | Contract | Status |
|---------|----------|--------|
| `apps/workboard/src/api/contracts.ts` | JSDoc: `taskId = TASK_MAIN.ID` on `TaskItem` | OK |
| `workInboxAdapter.ts` | `ID_KEYS` order: `taskId` → `id` → `TASK_ID` → … → `code` | OK (prefer PK) |
| `checklistSheetSchemaManifest.ts` | Child sheets list `TASK_ID` FK | OK |
| FE + Worker scan | No `TASK_MAIN.TASK_ID` identifier | OK |
| `taskWriteStore.ts` | Local ids `TASK-WR-*` (mock, not sheet PK format) | Dev-only |

### Focus / inbox view-models

| Type | Primary id field | Maps to |
|------|------------------|---------|
| `TaskItem` / API | `taskId` | `TASK_MAIN.ID` |
| `InboxItem` / `TaskCardModel` | `id` | Same value via adapter |
| `WorkInboxFocusItem` | `id` (inherited) | Same |
| Checklist runtime | `taskId` on items | Parent `TASK_MAIN.ID` |

---

## 3. User reference contract (FE / Worker)

| Location | Behavior | Prod risk |
|----------|----------|-----------|
| `workers/api/src/auth/userContext.ts` | `ROLE_PROFILES` → `USR-LOCAL-*` when no session | **Low** — header/session prod path uses real directory |
| `workers/api/src/adapters/taskWriteStore.ts` | Mock users + `TASK-WR-*` writes | **None** — not GAS sheet authority |
| `apps/workboard/.../TaskCreateForm.tsx` | Dropdown `USR-LOCAL-*` assignees | **Blocked** on GAS if deployed to sheet (assertActiveUserId) |
| `buildTaskCreationPayload.ts` | `ownerId` = form or `operator.userId` | **Depends** on operator context (local vs directory id) |
| Work Inbox create UX | Uses `ownerId` + `donViId` (PRO-shaped) | Preferred path vs legacy form |

**Policy (unchanged):** Local ids are **expected in dev**; Phase 02 migration maps them before historical sheet cleanup.

---

## 4. Dual create paths

| Path | Entry | Payload shape |
|------|-------|----------------|
| **Legacy** | `TaskCreateForm.tsx` | `CreateTaskBody.assignee` + `USR-LOCAL-*` options |
| **Work Inbox** | `buildTaskCreationPayload.ts` | `ownerId`, `donViId`, `taskTypeId`, related entity |

Both should converge on GAS `createTask` **`OWNER_ID`** = `USER_DIRECTORY.ID`. Legacy form is the main **UX drift** item.

---

## 5. Findings

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| F-13-01 | Info | `TaskItem.taskId` documented in contracts | Keep |
| F-13-02 | Low | `ID_KEYS` includes `'code'` as last resort | Document; avoid relying on TASK_CODE as id |
| F-13-03 | Medium | `TaskCreateForm` hardcodes `USR-LOCAL-*` | Defer: wire to directory API / disable in prod build flag |
| F-13-04 | Info | Mock store uses `TASK-WR-*` not `TASK-*` GAS ids | Dev-only |
| F-13-05 | Info | `UserRef.id` comment: not for OWNER_ID lookup | Display layer uses USER_CODE — see Phase 02 |

---

## 6. Files added

| File | Role |
|------|------|
| `09_AUDIT/scripts/frontendDataContractPhase13Checks.mjs` | Static FE/worker contract checks |
| `09_AUDIT/PHASE_DATA_REL_13_FRONTEND_DATA_CONTRACT_AUDIT_REPORT.md` | This report |

**Doc touch:** `03_SHARED/DATA_REL_AUTHORITY_INDEX.md` — phase 13 entry; `workInboxTypes.ts` — task key comment.

---

## 7. Tests run

```bash
node 09_AUDIT/scripts/frontendDataContractPhase13Checks.mjs
npm run typecheck --prefix apps/workboard
```

| Command | Result |
|---------|--------|
| `frontendDataContractPhase13Checks.mjs` | **GO_WITH_WARNINGS** |
| `apps/workboard` typecheck | Run locally in CI |

---

## 8. Next recommended phase

**PHASE_DATA_REL_14 — Read-only migration inventory scripts** (user/finance/HO_SO row counts, no writes)
