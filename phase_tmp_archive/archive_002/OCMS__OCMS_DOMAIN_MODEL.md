# OCMS Domain Model — V0 (Foundation)

**Version:** 0.1  
**Status:** Design authority (conceptual)  
**Phase:** `PHASE_OCMS_00_DESIGN_AUTHORITY`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_FOUNDATION.md`

---

## 1. Purpose

Describe the **Operational Case Management System** domain for CBV in a way that:

- Respects **AS-IS runtimes** (TASK_MAIN, HOME_ALERT, HO_SO_*, FINANCE_*, plugins).
- Preserves **Work Inbox V3** as the task execution front door.
- Avoids premature persistence (no new tables in V0).

This document is the **canonical conceptual model** until a future version introduces persisted Case records.

---

## 2. Operator mental model

```text
Hôm nay tôi xử lý việc gì?          → Work Inbox (Work Items)
Việc này thuộc hồ sơ / case nào?    → Case context (read-first, later)
Tôi cần mở module nào?              → Deep link (HO_SO, FINANCE, DOCS, …)
Chuyện gì đã xảy ra?                → Episode / timeline (append-only logs)
```

Work Inbox answers **queue** questions. OCMS answers **context and continuity** across modules.

---

## 3. Core entities

### 3.1 Case (logical)

| Attribute | V0 rule |
|-----------|---------|
| **Identity** | Conceptual; **Case Key** TBD in phase 01 (may derive from `HO_SO_ID`, composite task keys, or operator-assigned ref) |
| **State** | Not stored in foundation; inferred from child Work Items + module projections |
| **Owner** | Aligns with task `OWNER_ID` / hồ sơ owner fields when bound |
| **Visibility** | Inherits TASK_MAIN PRO rules (`IS_PRIVATE`, `SHARED_WITH`) when case view is task-anchored |

**Invariant:** No OCMS foundation code writes a Case row.

### 3.2 Work Item

Actionable operator queue entry.

| Subtype | AS-IS runtime | Operator surface |
|---------|---------------|------------------|
| **TaskWorkItem** | `TASK_MAIN` | Work Inbox groups, Focus Mode |
| **AlertWorkItem** | `HOME_ALERT` | Today / alert cards (when wired) |
| **ModuleWorkItem** (future) | Module-specific queues | Plugin quick actions |

**Invariant:** Mutations follow the **source runtime ADR** for that subtype (task POST → TASK_MAIN; alert claim → HOME_ALERT).

### 3.3 Module Projection

Read-only (or read-first) view of domain data attached to a Case.

| Module | Typical sheets / API | UI pattern |
|--------|----------------------|------------|
| HO_SO | `HO_SO_MASTER`, `HO_SO_FILE` | `/ho-so/:id`, search |
| FINANCE | `FINANCE_TRANSACTION`, logs | Finance plugin / alerts |
| DOCS | Document refs (TBD binding) | Deep link |
| TASK | `TASK_MAIN`, `TASK_UPDATE_LOG` | Inbox + Focus |

Projections **do not** own Case lifecycle in V0.

### 3.4 Episode

Append-only operational history segment.

| Source | Log |
|--------|-----|
| Task mutations | `TASK_UPDATE_LOG` (canonical) |
| Legacy RF task path | `TASK_TIMELINE` (read-only legacy) |
| Hồ sơ | `HO_SO_UPDATE_LOG` |
| Finance | `FINANCE_LOG` |

OCMS treats episodes as **federated timeline** — merge in UI only after explicit phase; no merged table in V0.

### 3.5 Actor

Operator or system identity performing work.

| Field source | Notes |
|--------------|-------|
| `USER_DIRECTORY` | Display names for task assignee / owner |
| GAS session / Worker auth | Permission gates |

### 3.6 Alert (projection entity)

Already defined in `ADR_HOME_ALERT_RUNTIME_BINDING.md`. In OCMS:

- Alert is a **Work Item**, not Case root state.
- Resolving alert does not imply task complete unless business rule added later.

---

## 4. Relationships (conceptual ER)

```text
┌─────────────┐
│    Case     │  (logical, V0)
└──────┬──────┘
       │ 1..*
       ▼
┌─────────────┐     ┌──────────────────┐
│  Work Item  │────▶│ Module Projection │
└──────┬──────┘     └──────────────────┘
       │
       │ generates
       ▼
┌─────────────┐
│   Episode   │  (append-only logs)
└─────────────┘
```

**Cardinality (target, not enforced in V0):**

- One Case → many Work Items (tasks + alerts + module todos).
- One TaskWorkItem → zero or one primary HO_SO projection (when `HO_SO_ID` or equivalent present on task row).
- Many episodes per Work Item.

---

## 5. Boundaries with Work Inbox V3

| Concern | Owner |
|---------|--------|
| Inbox groups (Need Action, Waiting, …) | Work Inbox V3 module authority |
| Focus Mode single-task UX | Work Inbox V3 |
| Task status / complete / assign | TASK_MAIN runtime |
| Case panel / cross-module strip (future) | OCMS phases (read-first) |

OCMS **must not** change inbox grouping rules or default route in foundation.

---

## 6. Boundaries with CBV prod baseline

When a Case view is anchored on `TASK_MAIN`:

- **`SHARED_WITH`** and **`IS_PRIVATE`** apply unchanged (workspace rule + TASK_MAIN PRO spec).
- Case-level sharing (future) requires ADR + schema — out of V0.

---

## 7. Identity & keys (deferred)

| Key | V0 status |
|-----|-----------|
| `TASK_ID` | Live (TASK_MAIN) |
| `ALERT_ID` | Live (HOME_ALERT) |
| `HO_SO_ID` / master codes | Live (module sheets) |
| **Case Key** | **Not defined** — phase 01 convention |

Recommended convention (non-binding until phase 01): `CASE_KEY = primary HO_SO_ID` when task links hồ sơ; else `CASE_KEY = TASK_ID` for task-only matters.

---

## 8. Anti-patterns (forbidden in OCMS phases unless ADR)

| Anti-pattern | Why |
|--------------|-----|
| Dual write task + case table | Divergence |
| Mock case aggregate in production | Silent degradation |
| Inbox row = Case row 1:1 | Tasks can exist without hồ sơ; cases can span many tasks |
| Cognition bucket as Case type | Violates operator-first inbox |

---

## 9. Document map

| Artifact | Role |
|----------|------|
| `ADR_OCMS_FOUNDATION.md` | Binding decisions |
| `OCMS_ROADMAP.md` | Phased delivery |
| Work Inbox V3 authority | Inbox / Focus IA |
| `ADR_TASK_RUNTIME_SOURCE_OF_TRUTH.md` | Task writes |
| `ADR_HOME_ALERT_RUNTIME_BINDING.md` | Alert writes |

---

## 10. Related model — CRM extension (V0A)

Strategic core **Case + Responsibility + Memory (CRM)** is defined in:

- `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_FOUNDATION_CRM_ADDENDUM.md`

This section does not alter §3–§9 definitions above.

---

## 11. Related model — Case Type + Result extension (V0B)

Case Type classification and Result outcome model:

- `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_TYPE_CATALOG.md`
- `00_SYSTEM_BRAIN/OCMS/OCMS_RESULT_MODEL.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md`

Complete OCMS frame:

```text
CASE → CASE TYPE | RESPONSIBILITY | WORK/STEPS | MEMORY | RESULT | MODULE PROJECTION
```

This section does not alter §3–§10 definitions above.

---

## 12. Related model — Case Lifecycle extension (V0C)

Case operational phase model (independent of task status and Result):

- `00_SYSTEM_BRAIN/OCMS/OCMS_CASE_LIFECYCLE_MODEL.md`
- `00_SYSTEM_BRAIN/002_DECISIONS/ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md`

Complete OCMS frame:

```text
CASE → CASE TYPE | LIFECYCLE | RESPONSIBILITY | WORK/STEPS | MEMORY | RESULT | MODULE PROJECTION
```

This section does not alter §3–§11 definitions above.

---

*Append-only. Bump version when persisted Case model is introduced.*
