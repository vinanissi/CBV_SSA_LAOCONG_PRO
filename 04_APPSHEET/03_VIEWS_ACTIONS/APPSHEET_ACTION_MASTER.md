# AppSheet Action Master — CBV_SSA_LAOCONG_PRO

Canonical action catalog. Actions must call GAS webhook — NOT "Update row" for workflow.

---

## HO_SO Actions

| Action | Target | Purpose |
|--------|--------|---------|
| ACT_HO_SO_ACTIVATE | HO_SO_MASTER | Set STATUS = ACTIVE |
| ACT_HO_SO_DEACTIVATE | HO_SO_MASTER | Set STATUS = INACTIVE |
| ACT_HO_SO_ARCHIVE | HO_SO_MASTER | Set STATUS = ARCHIVED |

---

## TASK Actions (PRO)

| Action | Label | PENDING_ACTION | validStatuses | Confirmation | Show_If |
|--------|-------|----------------|---------------|--------------|---------|
| ACT_TASK_START | Bắt đầu | CMD:taskStart | NEW, ASSIGNED | ✅ ~20s | STATUS = ASSIGNED + NOT ⏳ |
| ACT_TASK_WAIT | Tạm chờ | CMD:taskWait | IN_PROGRESS | ✅ ~20s | STATUS = IN_PROGRESS + NOT ⏳ |
| ACT_TASK_RESUME | Tiếp tục | CMD:taskResume | WAITING | ✅ ~20s | STATUS = WAITING + NOT ⏳ |
| ACT_TASK_COMPLETE | Hoàn thành | CMD:taskComplete | IN_PROGRESS, WAITING | ✅ ~20s | STATUS + checklist + NOT ⏳ |
| ACT_TASK_CANCEL | Huỷ | CMD:taskCancel | NEW,ASSIGNED,IN_PROGRESS,WAITING | ✅ ~20s | NOT terminal + NOT ⏳ |
| ACT_TASK_REOPEN | Mở lại | CMD:taskReopen | DONE, CANCELLED | ✅ ~20s | STATUS in DONE/CANCELLED + NOT ⏳ |
| ACT_TASK_ARCHIVE | Lưu trữ | CMD:taskArchive | DONE, CANCELLED | ✅ ~20s | STATUS in DONE/CANCELLED + NOT ⏳ |

---

## FINANCE Actions

| Action | Target | Purpose |
|--------|--------|---------|
| ACT_FIN_CONFIRM | FINANCE_TRANSACTION | STATUS → CONFIRMED |
| ACT_FIN_CANCEL | FINANCE_TRANSACTION | STATUS → CANCELLED |
| ACT_FIN_ARCHIVE | FINANCE_TRANSACTION | STATUS → ARCHIVED |

---

## Rules

- **Do NOT** use AppSheet "Update row" to change STATUS directly
- **Recommend:** Action calls GAS webhook; GAS validates and writes
- If using AppSheet update: mirror workflow guard with strict condition
- GAS enforces: validateTaskTransition, ensureTaskCanComplete, etc.

---

## Dangers if Misconfigured

- STATUS editable in form → user can bypass workflow
- Action updates STATUS without GAS → no validation, no log
- TASK_COMPLETE without checklist check → invalid DONE state

---

## CMD: Protocol — Action Feedback Pattern (Production)

Pattern chuẩn cho tất cả TASK workflow actions trong CBV PRO.

**3 lớp bảo vệ:**

1. Confirmation message → user biết phải chờ ~20s
2. `validStatuses` guard (GAS) → chặn Bot fire lần 2
3. `FEEDBACK_DISPLAY` → user thấy trạng thái realtime

**Tham chiếu:**

- Spec đầy đủ: `APPSHEET_TASK_ACTION_RULES.md` Section 8
- GAS implementation: `99_APPSHEET_WEBHOOK.gs` → `withTaskFeedback()`
- Bot config: `BOT_TASK_WEBHOOK` → `EVENT_PENDING_ACTION_CHANGED`
