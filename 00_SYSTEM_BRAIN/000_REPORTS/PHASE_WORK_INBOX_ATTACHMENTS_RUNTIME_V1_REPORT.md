# PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1 — Report

**Phase:** PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1  
**Verdict:** GO_WITH_WARNINGS  
**Date:** 2026-05-31  
**Architecture:** FE → Worker → GAS → Google Sheet (no direct FE→GAS/Sheet)

---

## 1. Summary

Work Inbox Focus Mode now has a **real attachments runtime** on sheet `TASK_ATTACHMENT` (existing PRO schema). Operators can list, add LINK/TEXT attachments, update metadata, and soft-delete per task. Mutations append **TASK_TIMELINE** (`ATTACHMENT_ADDED` / `ATTACHMENT_DELETED` / `ATTACHMENT_UPDATED`) and **ACTION_AUDIT_LOG** (`ACTION_ATTACHMENT_CREATE` / `DELETE` / `UPDATE`). UI patches local attachment state only — no full workspace snapshot reload.

**V1 scope:** LINK + TEXT only. FILE/IMAGE upload returns guarded stub — no new storage (R2/S3/Drive upload path not added).

---

## 2. Files changed

| Layer | File |
|-------|------|
| GAS | `gas-runtime-api/50_WorkInboxAttachments.js` (new) |
| GAS | `gas-runtime-api/04_WorkInboxOperationalConfig.js`, `01_TaskDbConfig.js`, `46_WorkInboxOperationalService.js` |
| Worker | `workers/api/src/contracts/workInboxAttachments.ts` (new) |
| Worker | `workers/api/src/modules/workInboxAttachments.ts` (new) |
| Worker | `workers/api/src/adapters/googleSheetWorkInboxOperationalAdapter.ts`, `router.ts` |
| FE | `apps/workboard/src/modules/task/inbox/attachments/*` (new) |
| FE | `focusRuntime/FocusContentCards.tsx`, `RightContextTabs.tsx`, `WorkInboxFocusRuntime.tsx`, `FocusTaskWorkspace.tsx` |
| FE | `actionRuntime/useWorkInboxActionRuntime.ts`, `WorkInboxFocusActionHost.tsx` |
| FE | `api/client.ts`, `api/mockApi.ts`, `styles/index.css` |
| Checks | `attachments/workInboxAttachmentsChecks.ts` (new) |

---

## 3. Existing schema reused or new sheet created

| Sheet | Action |
|-------|--------|
| **TASK_ATTACHMENT** | Idempotent bootstrap via `wiOpEnsureAttachmentSheet_()` if tab missing |

**Canonical columns used (unchanged PRO schema):**  
`ID`, `TASK_ID`, `SOURCE_MODE`, `ATTACHMENT_TYPE`, `TITLE`, `FILE_NAME`, `FILE_URL`, `DRIVE_FILE_ID`, `NOTE`, `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_DELETED`, …

**Note:** Prompt proposed alternate headers (`URL`, `TEXT_CONTENT`, `SIZE_BYTES`, …). Implementation **reuses existing schema** per rule “Không đổi schema cũ nếu không cần”. Mapping:

| API field | Sheet column |
|-----------|--------------|
| attachmentId | ID |
| type LINK | ATTACHMENT_TYPE=LINK, body in FILE_URL |
| type TEXT | ATTACHMENT_TYPE=TEXT, body in NOTE (title fallback) |
| url | FILE_URL |
| textContent | NOTE |

**Soft delete:** `IS_DELETED = TRUE` (no hard delete).

---

## 4. API actions added

### GAS (`wiOp*`)

| Action | Handler |
|--------|---------|
| `wiOpListAttachments` | `wiOpListAttachments_` |
| `wiOpCreateAttachment` | `wiOpCreateAttachment_` |
| `wiOpUpdateAttachment` | `wiOpUpdateAttachment_` |
| `wiOpSoftDeleteAttachment` | `wiOpSoftDeleteAttachment_` |
| `wiOpCreateFileAttachment` | stub — not enabled V1 |
| `wiOpCreatePastedImageAttachment` | stub — not enabled V1 |

### Worker REST

| Method | Path |
|--------|------|
| GET | `/api/work-inbox/tasks/:taskId/attachments` |
| POST | `/api/work-inbox/tasks/:taskId/attachments` |
| PATCH | `/api/work-inbox/tasks/:taskId/attachments/:attachmentId` |
| DELETE | `/api/work-inbox/tasks/:taskId/attachments/:attachmentId` |

**Permission:** mutate requires `DOCUMENT` op (VIEWER read-only).

### Timeline / audit events

| Mutation | Timeline | Audit action |
|----------|----------|--------------|
| Create | `ATTACHMENT_ADDED` | `ACTION_ATTACHMENT_CREATE` |
| Update | `ATTACHMENT_UPDATED` | `ACTION_ATTACHMENT_UPDATE` |
| Soft delete | `ATTACHMENT_DELETED` | `ACTION_ATTACHMENT_DELETE` |

---

## 5. Upload support status

| Capability | V1 |
|------------|-----|
| Link attachment | **Enabled** |
| Text / paste content | **Enabled** (TEXT → NOTE) |
| Clipboard paste in dialog | **Enabled** (FE) |
| FILE upload | **Disabled** — GAS returns message, no storage |
| IMAGE paste/upload | **Disabled** — stub only |

---

## 6. UI behavior

- **TÀI LIỆU GẦN ĐÂY** (Focus center-right): live list, icon/type, creator, time, open link, soft-delete (if permitted), **+ Thêm tài liệu**.
- **Tab Tài liệu** (right panel): full list + **+ Đính kèm tài liệu**.
- **… Thao tác khác → Đính kèm tài liệu**: opens shared add dialog (controlled state from action runtime).
- Modal: type Link / Nội dung dán, title, URL or body, note, paste from clipboard, save.
- After add/delete: local `setItems` patch — no `getTaskWorkspaceSnapshot`.

---

## 7. Tests performed

| Test | Result |
|------|--------|
| `runWorkInboxAttachmentsRuntimeChecks()` | **PASS** 14/14 — status `GO_WITH_WARNINGS` |
| `npm run build` (workboard) | **PASS** (see test evidence) |
| Live browser / GAS deploy | **Pending** |

---

## 8. Known limitations

- FILE/IMAGE attachments rejected until approved upload path exists.
- TEXT body stored in `NOTE` column (not separate `TEXT_CONTENT` column).
- Operational bundle `documents[]` legacy list not merged with TASK_ATTACHMENT rows in V1 (attachment UI is dedicated runtime).
- Live deploy required before pilot operators use production sheet.

---

## 9. Risks

- Wide-sheet `setValues` regressions mitigated via `getRange(nextRow, 1, 1, width)` + `wiOpBuildSheetRowPhysical_` (same pattern as checklist hotfix).
- Duplicate fetch if both preview + panel mount same hook on same task — acceptable for V1 (two list calls on focus); optimize later with shared cache if needed.

---

## 10. Next recommended phase

- **PHASE_WORK_INBOX_ATTACHMENTS_UPLOAD_V2** — only after ADR for Drive/GAS upload path.
- Optional: single shared attachment cache between preview + panel to cut duplicate GET.

---

## 11. Pilot readiness

**GO_WITH_WARNINGS** — code complete; requires GAS push `50_WorkInboxAttachments.js` + Worker deploy + manual checklist items 1–16 from test evidence before operator pilot.
