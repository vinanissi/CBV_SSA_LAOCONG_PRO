# PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — Handoff

**Status:** Implementation complete (code + static checks). Live deploy pending.  
**Date:** 2026-05-31

---

## What was delivered

- Real checklist CRUD in Work Inbox Focus (`TASK_CHECKLIST` sheet).
- Chain: `WorkInboxChecklistSection` → `api.*` → Worker `/api/work-inbox/tasks/.../checklist` → GAS `wiOp*` → Sheet.
- Append-only timeline + audit on every mutate.

---

## Deploy checklist

1. **GAS** — push `gas-runtime-api` including new file `49_WorkInboxChecklist.js` (after `46_WorkInboxOperationalService.js` / config).
2. **Worker** — deploy `workers/api` with new routes in `router.ts`.
3. **FE** — build/deploy workboard (`npm run build` verified).
4. Confirm spreadsheet has or receives `TASK_CHECKLIST` tab (bootstrap runs on first mutate/list).

---

## Manual verification (operator)

1. Open `/inbox/:taskId` focus on a task with existing or empty checklist.
2. **+ Thêm mục** → item appears; reload page → item persists.
3. Double-click title → edit → save.
4. Toggle ☐/☑ → state persists after reload.
5. **×** delete → item gone after reload (soft-deleted in sheet).
6. Sheet **TASK_TIMELINE**: rows for create/update/done/delete.
7. Sheet **ACTION_AUDIT_LOG** (or OP_STORE fallback): `ACTION_CHECKLIST_*` rows.
8. Network tab: only Worker URLs under `/api/work-inbox/.../checklist` — no `script.google.com` from browser.
9. Toggle 3× quickly — no snapshot storm (no repeated `getTaskWorkspaceSnapshot`).

---

## Static test command

```bash
cd apps/workboard
npx tsx -e "import { runWorkInboxChecklistRuntimeChecks } from './src/modules/task/inbox/checklist/workInboxChecklistChecks.ts'; console.log(runWorkInboxChecklistRuntimeChecks());"
```

---

## Key files for next agent

| Area | Path |
|------|------|
| GAS handlers | `gas-runtime-api/49_WorkInboxChecklist.js` |
| Action router | `gas-runtime-api/46_WorkInboxOperationalService.js` |
| Worker | `workers/api/src/modules/workInboxChecklist.ts` |
| FE hook | `apps/workboard/src/modules/task/inbox/checklist/useWorkInboxChecklistRuntime.ts` |
| UI | `apps/workboard/src/modules/task/inbox/checklist/WorkInboxChecklistSection.tsx` |

---

## Schema mapping (for support)

| API field | Sheet column |
|-----------|--------------|
| checklistId | ID |
| taskId | TASK_ID |
| sortOrder | ITEM_NO |
| isDone / status | IS_DONE |
| isDeleted | IS_DELETED |

---

## Blockers / warnings

- **GO_WITH_WARNINGS** until live GAS+Worker deploy confirmed.
- Do not rename `TASK_CHECKLIST` columns without ADR — breaks `CBV_TASK_DB_EXPECTED` validation.
