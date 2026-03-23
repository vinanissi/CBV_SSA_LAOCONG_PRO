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

| Action | Label | GAS Function | When | Effect |
|--------|-------|--------------|------|--------|
| BẮT ĐẦU | Start | `taskStartAction([ID])` | NEW, ASSIGNED | STATUS → IN_PROGRESS; START_DATE if blank |
| HOÀN THÀNH | Complete | `taskCompleteAction([ID], resultSummary)` | IN_PROGRESS, WAITING | STATUS → DONE, DONE_AT |
| HỦY | Cancel | `taskCancelAction([ID], note)` | NEW, ASSIGNED, IN_PROGRESS, WAITING | STATUS → CANCELLED |
| MỞ LẠI | Reopen | `taskReopenAction([ID])` | DONE, CANCELLED | STATUS → IN_PROGRESS |

**Legacy aliases:** ACT_TASK_START → taskStartAction, ACT_TASK_COMPLETE → taskCompleteAction, ACT_TASK_CANCEL → taskCancelAction

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
