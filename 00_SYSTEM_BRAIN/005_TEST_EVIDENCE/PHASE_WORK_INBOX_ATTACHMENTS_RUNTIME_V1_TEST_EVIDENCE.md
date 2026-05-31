# PHASE_WORK_INBOX_ATTACHMENTS_RUNTIME_V1 — Test Evidence

**Date:** 2026-05-31  
**Environment:** Local repo static + build (no live GAS in this run)

---

## Automated

| Command | Result |
|---------|--------|
| `runWorkInboxAttachmentsRuntimeChecks()` | **PASS** 14/14 — status `GO_WITH_WARNINGS` |
| `npm run build` (apps/workboard) | **PASS** |

### Static check suite IDs (all pass)

- ATTACH_FE_WORKER_API_ONLY
- ATTACH_UI_PREVIEW_AND_PANEL
- ATTACH_MORE_MENU_OPENS_DIALOG
- ATTACH_LOCAL_PATCH
- ATTACH_NO_FULL_SNAPSHOT
- ATTACH_GAS_SOFT_DELETE
- ATTACH_GAS_TIMELINE_AUDIT
- ATTACH_GAS_BOOTSTRAP
- ATTACH_V1_LINK_TEXT_ONLY
- ATTACH_WORKER_ROUTES
- ATTACH_GAS_ACTIONS
- ATTACH_ADAPTER
- ATTACH_UI_DIALOG
- ATTACH_GETRANGE_NUMROWS_FIX

---

## Manual checklist (pending live deploy)

| # | Step | Status |
|---|------|--------|
| 1 | Bootstrap TASK_ATTACHMENT if missing | PENDING LIVE |
| 2 | Open task with existing attachment | PENDING LIVE |
| 3 | Add link attachment | PENDING LIVE |
| 4 | Link in “Tài liệu gần đây” | PENDING LIVE |
| 5 | Open link works | PENDING LIVE |
| 6 | Add text attachment | PENDING LIVE |
| 7 | Reload — attachment persists | PENDING LIVE |
| 8 | Soft-delete attachment | PENDING LIVE |
| 9 | Reload — deleted hidden | PENDING LIVE |
| 10 | Sheet IS_DELETED=TRUE | PENDING LIVE |
| 11 | TIMELINE ATTACHMENT_ADDED/DELETED | PENDING LIVE |
| 12 | AUDIT ACTION_ATTACHMENT_CREATE/DELETE | PENDING LIVE |
| 13 | Network — Worker URLs only | PENDING LIVE |
| 14 | No script.google.com from browser | PENDING LIVE |
| 15 | No snapshot storm | PENDING LIVE |
| 16 | Build/test pass | **PASS** (build) |

---

## Notes

- Mock API supports attachments in demo mode (`VITE_TASK_MOCK` / task mock path).
- FILE/IMAGE upload intentionally not tested — rejected by design in V1.
