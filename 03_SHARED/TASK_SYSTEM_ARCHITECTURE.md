# TASK System Architecture (Final)

**Canonical model.** Non-hybrid. Task belongs to DON_VI; users are global.

**Source:** 00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md

---

## 1. Architecture Diagram

```
DON_VI (organization unit)
        ↓
     TASK_MAIN
        ↑
USER_DIRECTORY (global operational users)
MASTER_CODE (TASK_TYPE via TASK_TYPE_ID)
```

- **Task belongs to DON_VI** — TASK_MAIN.DON_VI_ID → DON_VI.ID
- **Task type from MASTER_CODE** — TASK_MAIN.TASK_TYPE_ID → MASTER_CODE (MASTER_GROUP=TASK_TYPE)
- **OWNER / REPORTER / ACTOR** — Ref USER_DIRECTORY (global, no HTX)
- **Users are global** — No USER_DIRECTORY.HTX_ID; users operate across all DON_VI

---

## 2. Design Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | DON_VI is sole organization table | HTX, CONG_TY, BO_PHAN, etc. are DON_VI_TYPE values |
| 2 | USER_DIRECTORY stores global operational users | Shared across tasks, finance; no DON_VI/HTX binding |
| 3 | TASK_MAIN contains DON_VI_ID | Task organizational ownership |
| 4 | TASK_MAIN contains TASK_TYPE_ID | Ref MASTER_CODE (MASTER_GROUP=TASK_TYPE) |
| 5 | TASK_MAIN contains OWNER_ID and REPORTER_ID | Ref USER_DIRECTORY |
| 6 | Checklist, attachment, update log are child tables | TASK_ID → TASK_MAIN |
| 7 | GAS is the real workflow validator | assertActiveUserId, validateTaskTransition |

---

## 3. Reference Directions

| From | Column | To | Notes |
|------|--------|-----|-------|
| TASK_MAIN | DON_VI_ID | DON_VI | Task organizational unit |
| TASK_MAIN | TASK_TYPE_ID | MASTER_CODE | MASTER_GROUP=TASK_TYPE |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | Assignee |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | Reporter/creator |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | Child |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | Who marked done |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | Child |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | Child |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY | Who performed action |

**Removed:** TASK_MAIN.HTX_ID, USER_DIRECTORY.HTX_ID. See DEPRECATED_OLD_DESIGN_ITEMS.md.

---

## 4. Child Table Hierarchy

```
TASK_MAIN
├── TASK_CHECKLIST (TASK_ID)
├── TASK_ATTACHMENT (TASK_ID)
└── TASK_UPDATE_LOG (TASK_ID)
```
