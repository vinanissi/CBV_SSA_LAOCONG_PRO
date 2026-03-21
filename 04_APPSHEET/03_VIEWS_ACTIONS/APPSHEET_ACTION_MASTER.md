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

## TASK Actions

| Action | Target | Purpose |
|--------|--------|---------|
| ACT_TASK_ASSIGN | TASK_MAIN | Assign owner |
| ACT_TASK_START | TASK_MAIN | STATUS → IN_PROGRESS |
| ACT_TASK_WAITING | TASK_MAIN | STATUS → WAITING |
| ACT_TASK_RESUME | TASK_MAIN | STATUS → IN_PROGRESS |
| ACT_TASK_COMPLETE | TASK_MAIN | STATUS → DONE (GAS enforces checklist) |
| ACT_TASK_CANCEL | TASK_MAIN | STATUS → CANCELLED |
| ACT_TASK_ARCHIVE | TASK_MAIN | STATUS → ARCHIVED |

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
