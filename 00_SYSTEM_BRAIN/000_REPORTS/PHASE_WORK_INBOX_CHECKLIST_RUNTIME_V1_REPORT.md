# PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1 — Report

**Phase:** PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-31  
**Architecture:** FE → Worker → GAS → Google Sheet (no direct FE→GAS/Sheet)

---

## 1. Summary

Work Inbox Focus Mode checklist area is now a **real runtime** backed by sheet `TASK_CHECKLIST` (existing PRO schema). Operators can list, create, update, toggle done/open, and soft-delete items per task. Mutations append **TASK_TIMELINE** + **ACTION_AUDIT_LOG** (API_AUDIT_LOG path via wiOp). UI patches local checklist state only — no full workspace snapshot reload.

---

## 2. Files changed

| Layer | File |
|-------|------|
| GAS | `gas-runtime-api/49_WorkInboxChecklist.js` (new) |
| GAS | `gas-runtime-api/04_WorkInboxOperationalConfig.js`, `01_TaskDbConfig.js`, `46_WorkInboxOperationalService.js` |
| Worker | `workers/api/src/contracts/workInboxChecklist.ts` (new) |
| Worker | `workers/api/src/modules/workInboxChecklist.ts` (new) |
| Worker | `workers/api/src/adapters/googleSheetWorkInboxOperationalAdapter.ts`, `router.ts` |
| FE | `apps/workboard/src/modules/task/inbox/checklist/*` (new) |
| FE | `apps/workboard/src/modules/task/inbox/focusRuntime/FocusContentCards.tsx`, `FocusTaskWorkspace.tsx` |
| FE | `apps/workboard/src/api/client.ts`, `api/mockApi.ts`, `styles/index.css` |
| Checks | `apps/workboard/src/modules/task/inbox/checklist/workInboxChecklistChecks.ts` (new) |

---

## 3. DB sheet added/verified

| Sheet | Action |
|-------|--------|
| **TASK_CHECKLIST** | Idempotent bootstrap via `wiOpEnsureChecklistSheet_()` if missing |

**Canonical columns used (unchanged PRO schema):**  
`ID`, `TASK_ID`, `ITEM_NO`, `TITLE`, `IS_REQUIRED`, `IS_DONE`, `DONE_AT`, `DONE_BY`, `NOTE`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_DELETED`

**Note:** Prompt proposed alternate headers (`checklist_id`, `status`, `sort_order`, …). Implementation **reuses existing schema** per rule “Không đổi schema cũ nếu không cần”. API maps `ID`→`checklistId`, `IS_DONE`→`status`, `ITEM_NO`→`sortOrder`.

**Soft delete:** `IS_DELETED = TRUE` (no hard delete).

---

## 4. API actions added

### GAS (`wiOp*`)

| Action | Handler |
|--------|---------|
| `wiOpListChecklist` | `wiOpListChecklist_` |
| `wiOpCreateChecklistItem` | `wiOpCreateChecklistItem_` |
| `wiOpUpdateChecklistItem` | `wiOpUpdateChecklistItem_` |
| `wiOpToggleChecklistItem` | `wiOpToggleChecklistItem_` |
| `wiOpSoftDeleteChecklistItem` | `wiOpSoftDeleteChecklistItem_` |

### Worker REST

| Method | Path | Maps to |
|--------|------|---------|
| GET | `/api/work-inbox/tasks/:taskId/checklist` | list |
| POST | `/api/work-inbox/tasks/:taskId/checklist` | create |
| PATCH | `/api/work-inbox/tasks/:taskId/checklist/:checklistId` | update |
| POST | `/api/work-inbox/tasks/:taskId/checklist/:checklistId/toggle` | toggle |
| DELETE | `/api/work-inbox/tasks/:taskId/checklist/:checklistId` | soft delete |

**Permission:** mutate requires `NOTES` op (VIEWER read-only).

### Timeline / audit events

| Mutation | Timeline | Audit action |
|----------|----------|--------------|
| Create | `CHECKLIST_ITEM_CREATED` | `ACTION_CHECKLIST_CREATE` |
| Update | `CHECKLIST_ITEM_UPDATED` | `ACTION_CHECKLIST_UPDATE` |
| Toggle done | `CHECKLIST_ITEM_DONE` | `ACTION_CHECKLIST_DONE` |
| Toggle reopen | `CHECKLIST_ITEM_REOPENED` | `ACTION_CHECKLIST_UNDONE` |
| Soft delete | `CHECKLIST_ITEM_DELETED` | `ACTION_CHECKLIST_DELETE` |

---

## 5. UI behavior

- Focus card **CHECKLIST** replaces static “CHECKLIST GỢI Ý” stub.
- ☐ / ☑ per item; checkbox toggles persisted state.
- **+ Thêm mục** with inline input.
- Double-click title → inline edit (blur/Enter saves).
- **×** soft-deletes item (hidden after success).
- Loading / error + retry; no full inbox reload on mutate.
- VIEWER: list only (`opPermissions.NOTES === false`).

---

## 6. Tests performed

```
runWorkInboxChecklistRuntimeChecks() → GO_WITH_WARNINGS, 12/12 PASS
npm run build (workboard) → PASS
```

Static checks verify: Worker-only API, soft-delete, timeline/audit hooks, bootstrap, routes, no snapshot reload in hook.

**Not run this session:** live GAS deploy, browser manual checklist on production sheet.

---

## 7. Known limitations

- No drag-and-drop reorder UI; `sortOrder` / `ITEM_NO` set on create/update only.
- No dedicated “insert between rows” API — use `sortOrder` on create.
- `syncTaskProgress` (legacy 05_GAS_RUNTIME) not invoked from gas-runtime-api path.
- Live verification requires GAS `49_WorkInboxChecklist.js` deploy + Worker deploy.

---

## 8. Risks

- Sheet missing in prod → bootstrap creates empty `TASK_CHECKLIST` (idempotent).
- Concurrent edits: last write wins on row patch.
- VIEWER misconfigured as STAFF in env header could allow mutate.

---

## 9. Next recommended phase

1. **PHASE_WORK_INBOX_CHECKLIST_RUNTIME_V1_LIVE_VERIFY** — deploy GAS + Worker, manual UAT on one pilot task.  
2. Optional: wire checklist completion into `PROGRESS_PERCENT` / focus progress bar.  
3. Optional: batch reorder endpoint if operators need frequent insert-between.

---

## 10. Pilot recommendation

**GO_WITH_WARNINGS** — ship after one live create/toggle/delete cycle on pilot spreadsheet.

---

## 11. HOTFIX_WORK_INBOX_CHECKLIST_APPEND_ROW_WIDTH (2026-05-31)

**Root cause:** `wiOpCreateChecklistItem_` gọi `wiOpAppendRowFast_` + `taskDbRecordToRow_`, tạo mảng row theo `info.headers.length` (header đã `filter(Boolean)`). Sheet `TASK_CHECKLIST` production có **65 cột vật lý** (`getLastColumn()`), trong khi row append chỉ có **1–14 phần tử** → `setValues([row])` trên range `1×65` báo lỗi *“Dữ liệu có 1 nhưng dải ô có 65”*.

**Fix:** `wiOpBuildChecklistSheetRow_` — `headerRow.map(...)` theo từng cột vật lý hàng 1; `wiOpAppendChecklistRow_` — `setValues` với `width = row.length === lastCol`. Read/patch dùng `wiOpGetChecklistPhysicalHeaderMap_` cho toggle/delete/update trên sheet rộng.

**Files:** `gas-runtime-api/49_WorkInboxChecklist.js`, `workInboxChecklistChecks.ts` (static check).

**Deploy:** Chỉ re-push GAS `49_WorkInboxChecklist.js` (không đổi Worker/FE).

### v2 (same hotfix id — timeline/audit path)

Nếu UI vẫn báo *“Dữ liệu có 1 nhưng dải ô có 65”* sau deploy `49` only: lỗi thường ở **`wiOpAppendTimelineAndAuditCombined_`** (TASK_TIMELINE / ACTION_AUDIT_LOG) vẫn gọi `wiOpAppendRowFast_` + `taskDbRecordToRow_`.

**Additional fix:** `gas-runtime-api/13_WorkInboxAppendFast.js` — `wiOpBuildSheetRowPhysical_` + `wiOpAppendRowFast_` dùng `headerRow.map` / dense row width = `getLastColumn()`. Create: timeline/audit bọc try/catch — checklist vẫn `ok` nếu timeline fail (warning).

**Deploy v2:** Push **`13_WorkInboxAppendFast.js`** và **`49_WorkInboxChecklist.js`** (thứ tự load: `13` trước `49`).

### v3 — getRange numRows (root cause of rowCols=14 / range 65 rows)

Message `rowCols=14, rangeCols=14` nhưng Google báo *dải ô có 65* **hàng**: code dùng `getRange(nextRow, 1, nextRow, width)` — tham số thứ 3 là **`numRows`**, không phải `endRow`. Khi `nextRow=65` → range **65×14**, data **1×14** → lỗi.

**Fix:** `getRange(nextRow, 1, 1, width)` (1 hàng). Batch: `getRange(nextRow, 1, matrix.length, width)`.

**Deploy v3:** Re-push `13_WorkInboxAppendFast.js` + `49_WorkInboxChecklist.js`.
