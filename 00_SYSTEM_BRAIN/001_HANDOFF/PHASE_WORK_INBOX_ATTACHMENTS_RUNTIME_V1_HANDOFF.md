# PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1 — Handoff

**Status:** Implementation complete (code + static checks). Live deploy pending.  
**Date:** 2026-05-31

---

## What was delivered

- Real attachments CRUD in Work Inbox Focus (`TASK_ATTACHMENT` sheet).
- Chain: `WorkInboxAttachmentsSection` → `api.*` → Worker `/api/work-inbox/tasks/.../attachments` → GAS `wiOp*` → Sheet.
- V1: **LINK** + **TEXT** only; FILE/IMAGE upload stubbed.
- Append-only timeline + audit on every mutate.

---

## Deploy checklist

1. **GAS** — push `gas-runtime-api` including `50_WorkInboxAttachments.js` (after config / `46_WorkInboxOperationalService.js`).
2. **Worker** — deploy `workers/api` with attachment routes in `router.ts`.
3. **FE** — build/deploy workboard (`npm run build`).
4. Confirm spreadsheet has or receives `TASK_ATTACHMENT` tab (bootstrap on first list/mutate).

---

## Manual verification (operator)

1. Open focus on a task; confirm **TÀI LIỆU GẦN ĐÂY** loads (or empty state).
2. **+ Thêm tài liệu** → Link → URL + title → save → appears in preview.
3. **Mở** opens URL in new tab.
4. **… → Đính kèm tài liệu** opens same dialog from more menu.
5. Tab **Tài liệu** shows full list; add TEXT paste → persists after reload.
6. Soft-delete (×) → gone after reload; sheet `IS_DELETED=TRUE`.
7. **TASK_TIMELINE**: `ATTACHMENT_ADDED` / `ATTACHMENT_DELETED`.
8. **ACTION_AUDIT_LOG**: `ACTION_ATTACHMENT_CREATE` / `ACTION_ATTACHMENT_DELETE`.
9. Network: only Worker `/api/work-inbox/.../attachments` — no `script.google.com`.
10. Add/delete 3× — no snapshot storm.

---

## Static test command

```bash
cd apps/workboard
npx tsx -e "import { runWorkInboxAttachmentsRuntimeChecks } from './src/modules/task/inbox/attachments/workInboxAttachmentsChecks.ts'; console.log(runWorkInboxAttachmentsRuntimeChecks());"
```

---

## Key files for next agent

| Area | Path |
|------|------|
| GAS handlers | `gas-runtime-api/50_WorkInboxAttachments.js` |
| Action router | `gas-runtime-api/46_WorkInboxOperationalService.js` |
| Worker | `workers/api/src/modules/workInboxAttachments.ts` |
| FE hook | `apps/workboard/src/modules/task/inbox/attachments/useWorkInboxAttachmentsRuntime.ts` |
| UI | `WorkInboxAttachmentsSection.tsx`, `WorkInboxAddAttachmentDialog.tsx` |

---

## Schema mapping (for support)

| API field | Sheet column |
|-----------|--------------|
| attachmentId | ID |
| type LINK | ATTACHMENT_TYPE, FILE_URL |
| type TEXT | ATTACHMENT_TYPE, NOTE |
| isDeleted | IS_DELETED |

---

## Blockers / warnings

- **GO_WITH_WARNINGS** until live GAS+Worker deploy confirmed.
- Do not enable FILE/IMAGE without storage ADR.
- Checklist hotfix (`getRange(row,1,1,width)`) pattern reused — keep when editing append paths.
