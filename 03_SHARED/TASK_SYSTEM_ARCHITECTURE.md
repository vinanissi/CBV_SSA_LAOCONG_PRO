# TASK System Architecture

**Canonical model.** CBV-compliant. Task belongs to HTX; users are shared.

---

## 1. Architecture Diagram

```
HO_SO_MASTER (HTX business entity)
        ↓
     TASK_MAIN
        ↑
USER_DIRECTORY (shared operational users)
```

- **HTX belongs to the task** — TASK_MAIN.HTX_ID → HO_SO_MASTER.ID (HO_SO_TYPE=HTX)
- **OWNER / REPORTER / ACTOR belong to USER_DIRECTORY** — TASK_MAIN.OWNER_ID, REPORTER_ID; TASK_UPDATE_LOG.ACTOR_ID; TASK_CHECKLIST.DONE_BY
- **Users do not belong to HTX by default** — USER_DIRECTORY.HTX_ID is optional; users are shared across the system

---

## 2. Design Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | HO_SO_MASTER stores business entities only | HTX, XA_VIEN, XE, TAI_XE — not users |
| 2 | USER_DIRECTORY stores system-operational users only | Shared across tasks, finance, HO_SO |
| 3 | TASK_MAIN contains HTX_ID | Task belongs to HTX |
| 4 | TASK_MAIN contains OWNER_ID and REPORTER_ID | Ref USER_DIRECTORY |
| 5 | Checklist, attachment, update log are child tables of TASK_MAIN | TASK_ID → TASK_MAIN |
| 6 | AppSheet refs are safe and non-destructive | Allow Adds OFF; ACTIVE_USERS from USER_DIRECTORY |
| 7 | GAS is the real workflow validator | assertActiveUserId, validateTaskTransition |

---

## 3. Table Roles

| Table | Role | Notes |
|-------|------|-------|
| HO_SO_MASTER | Business entities | HTX, XA_VIEN, XE, TAI_XE; NOT user store |
| USER_DIRECTORY | Operational users | Shared; OWNER, REPORTER, ACTOR, DONE_BY, CONFIRMED_BY |
| TASK_MAIN | Task record | Belongs to HTX (HTX_ID); assigned to USER (OWNER_ID) |
| TASK_CHECKLIST | Child of TASK_MAIN | DONE_BY → USER_DIRECTORY |
| TASK_ATTACHMENT | Child of TASK_MAIN | TASK_ID → TASK_MAIN |
| TASK_UPDATE_LOG | Child of TASK_MAIN | TASK_ID → TASK_MAIN; ACTOR_ID → USER_DIRECTORY |

---

## 4. Reference Directions

| From | Column | To | Notes |
|------|--------|-----|-------|
| TASK_MAIN | HTX_ID | HO_SO_MASTER (HO_SO_TYPE=HTX) | Task belongs to HTX |
| TASK_MAIN | OWNER_ID | USER_DIRECTORY | Assignee |
| TASK_MAIN | REPORTER_ID | USER_DIRECTORY | Reporter/creator |
| TASK_MAIN | RELATED_ENTITY_ID | Polymorphic | By RELATED_ENTITY_TYPE |
| TASK_CHECKLIST | TASK_ID | TASK_MAIN | Child |
| TASK_CHECKLIST | DONE_BY | USER_DIRECTORY | Who marked done |
| TASK_ATTACHMENT | TASK_ID | TASK_MAIN | Child |
| TASK_UPDATE_LOG | TASK_ID | TASK_MAIN | Child |
| TASK_UPDATE_LOG | ACTOR_ID | USER_DIRECTORY (or email fallback) | Who performed action |
| USER_DIRECTORY | HTX_ID | HO_SO_MASTER (optional) | Optional org assignment; users shared by default |

---

## 5. Shared Users vs Task–HTX Binding

| Concept | Meaning |
|---------|---------|
| **Users are shared** | USER_DIRECTORY is system-wide; same user can own tasks across multiple HTX |
| **Task belongs to HTX** | TASK_MAIN.HTX_ID links task to a specific HTX; scope/filter by HTX |
| **No mandatory user–HTX binding** | USER_DIRECTORY.HTX_ID is optional; used only when user is explicitly tied to one HTX |
| **Do not bind users to fixed HTX unless required** | Default: users operate across all HTX |

---

## 6. Child Table Hierarchy

```
TASK_MAIN
├── TASK_CHECKLIST (TASK_ID)
├── TASK_ATTACHMENT (TASK_ID)
└── TASK_UPDATE_LOG (TASK_ID)
```

---

## 7. References

- 03_SHARED/TASK_DATA_FLOW.md
- 03_SHARED/USER_SYSTEM_CONSOLIDATED.md
- 02_MODULES/TASK_CENTER/DATA_MODEL.md
- 02_MODULES/TASK_CENTER/TASK_ENFORCEMENT_RULES.md
- 09_AUDIT/TASK_ARCHITECTURE_AUDIT.md
