# Case Runtime Authority — V1

**Version:** 1.0  
**Status:** **ACCEPTED** (binding for `PHASE_CASE_REFACTOR_*`)  
**Phase:** `PHASE_CASE_REFACTOR_01_CASE_AUTHORITY`  
**ADR:** `ADR_CASE_CENTRIC_RUNTIME.md`  
**Extends:** `OCMS_DOMAIN_MODEL.md`, `OCMS_CASE_KEY_AUTHORITY.md`, `OCMS_CASE_LIFECYCLE_MODEL.md`, `OCMS_READ_MODEL_CONTRACT.md`

---

## 1. Case

### Definition

**Case** = primary operational unit that groups **context, work, evidence, history, responsibility, and outcome** around one real operational matter.

Case is the **operational memory container** for how CBV handles work end-to-end.

### A Case may represent

- Hồ sơ xã viên / hồ sơ xe  
- Hóa đơn / đề xuất chi  
- Khiếu nại / yêu cầu hỗ trợ  
- Vấn đề vận hành / dự án nhỏ  
- Tài liệu cần xử lý  
- Tuân thủ / kiểm tra  

### A Case is NOT

| Not a Case | Why |
|------------|-----|
| A single Task row | Task is one work item; Case may span many tasks |
| A checklist only | Checklist is completion structure inside Case |
| A document folder only | Documents are evidence under Case |
| A UI card / strip alone | UI projects Case; does not define it |
| `TASK_MAIN.STATUS` | Task status ≠ Case WorkflowState |

---

## 2. Task

**Task** = assignable **work item / action** under a Case.

| Property | Rule |
|----------|------|
| Owner | `OWNER_ID` (required for assignment semantics) |
| Status | `TASK_MAIN.STATUS` — execution state |
| Due date | `DUE_DATE` when scheduled |
| Action | Complete, assign, pause, forward (Focus / inbox) |
| Timeline trace | Append via task update log / work-inbox timeline |
| Documents | Optional links; may also exist at Case level |

**Authority:** Task must not remain the **top-level operational context** after Case Workspace is active — Case header/context leads; Task list is a section.

**Persistence (transition):** Task remains persistence root. Mutations target `TASK_MAIN` until persistence ADR.

**Transition rule:** A Task **may exist without a resolved Case** during transition (e.g. discovery `NONE`, weak anchors). UI shows honest diagnostics; do not fabricate Case.

---

## 3. Checklist

**Checklist** = required **steps, evidence, or completion criteria** inside a Case.

| Rule | Detail |
|------|--------|
| Not auto-Task | Checklist items are **not** Tasks by default |
| Promotion | Become Task only if separate **owner**, **deadline**, **status**, **document**, **follow-up**, or **timeline trace** is required |
| Today | Rows often `TASK_CHECKLIST` keyed by `TASK_ID` — **physical store is task-scoped; logical owner is Case** via the task’s Case anchor |

---

## 4. Document

**Document** = evidence, proof, file, link, or attachment related to the Case.

| Rule | Detail |
|------|--------|
| Primary owner | **Case** |
| Task link | Allowed when evidence is task-specific |
| Sources | Drive, upload, PDF, image, spreadsheet, external URL |
| This phase | No document store / no new tables |

---

## 5. Timeline

**Timeline** = **append-only** operational history of a Case.

May include: task updates, checklist events, document events, handoff notes, WorkflowState changes, manual comments, system observations.

| Rule | Detail |
|------|--------|
| Mutability | Append-only; no silent overwrite |
| Storage today | Task-scoped sheets (`TASK_TIMELINE`, `TASK_UPDATE_LOG`, …) |
| Target | Federated **read** by `caseKey` (phase 04) |

**No event store** in refactor phases 01–04.

---

## 6. Comment

**Decision (V1):** **Comment = Timeline entry type** (Option A).

| Rule | Detail |
|------|--------|
| Not a separate Case entity | Avoid extra persistence surface at CBV scale |
| Representation | `entryType: COMMENT` (or equivalent) in timeline read model |
| Writes | Use existing note/comment POST paths until Case write model exists |
| Future | Separate entity only if phase 05+ audit proves need |

---

## 7. Handoff

**Handoff** = structured **continuation summary** for transferring or resuming a Case.

Must be able to convey:

- Current state / WorkflowState  
- Pending work (checklist + tasks)  
- Risks / blockers  
- Next action  
- Responsible person  
- Required documents  

| Rule | Detail |
|------|--------|
| Owner | **Case** |
| Task handoff | Projection or section inside Case handoff only |
| Today | Assign + timeline derivation (no `HANDOFF` sheet) |

---

## 8. WorkflowState

**WorkflowState** = current **stage** of Case lifecycle.

| Rule | Detail |
|------|--------|
| Not a workflow engine | No auto-routing, no BPMN, no silent transitions |
| ≠ Task status | `TASK_MAIN.STATUS` does not replace WorkflowState |
| Derivation | May be derived from task status, module status, lifecycle rules until persisted |
| Canonical values | See §9 |

---

## 9. Case lifecycle (canonical)

| Code | Purpose (EN) | UI (VI example) |
|------|----------------|-----------------|
| `NEW` | Created, not triaged | Mới |
| `TRIAGE` | Classification / routing | Tiếp nhận |
| `ACTIVE` | In progress | Đang xử lý |
| `WAITING` | Blocked on external party | Chờ |
| `REVIEW` | Verification / approval | Rà soát |
| `BLOCKED` | Internal blocker | Tắc |
| `RESOLVED` | Outcome achieved | Đã xử lý |
| `CLOSED` | Closed operationally | Đóng |
| `ARCHIVED` | Historical | Lưu trữ |
| `REOPENED` | Reopened after close | Mở lại |

Canonical codes are **stable**; Vietnamese labels may vary in UI.

**Orthogonality:** Lifecycle ≠ `OCMS_RESULT_MODEL` result ≠ task status (per OCMS ADRs).

---

## 10. Case responsibility

| Role | Semantics |
|------|-----------|
| **Responsible** | Primary operator accountable for Case progression |
| **Support** | Assists; not primary owner |
| **Reviewer** | Reviews outcome / evidence |
| **Escalation** | Supervisor / escalation path |
| **Watcher** | Informed; no action duty |

| Rule | Detail |
|------|--------|
| Responsible | Mandatory in UI **when data exists** |
| Missing data | Show honest empty state — **do not fabricate** |
| Source | USER_DIRECTORY, task owner, HO_SO owner fields, OCMS responsibility memory |

---

## 11. Case identity

| Rule | Detail |
|------|--------|
| Derivation | From existing Task + anchors initially (`RELATED_ENTITY_*`, HO_SO, FINANCE, ALERT) |
| caseKey | Logical / read-model; **authoritative format:** `OCMS_CASE_KEY_AUTHORITY.md` |
| Operator edit | **caseKey is not operator-editable** |
| Display | Raw key **must not dominate** operator UI |
| Multi-task | Multiple Tasks may share one Case |
| Persistence | **Deferred** — no `CASE_MAIN` in V1 authority |

---

## 12. Case persistence boundary

```text
NO CASE_MAIN UNTIL PROVEN NECESSARY
```

Decision phase: **`PHASE_CASE_REFACTOR_05_PERSISTENCE_DECISION`**.

Until then: projection-only Case; TASK_MAIN and related sheets remain write targets.

---

## 13. Case workspace (authority only)

Target structure (implementation in phase 03+):

```text
CASE WORKSPACE
├── Case Header
├── Case Context
├── AI Summary (optional / deferred content)
├── Checklist
├── Tasks
├── Documents
├── Timeline
├── Handoff
└── Action Bar
```

Detail: `CASE_WORKSPACE_LAYOUT_AUTHORITY.md`.

**Must not revert** to Task Detail as sole root when Case Workspace flag is on.

---

## 14. Feature flag naming (resolved)

| Name | Usage |
|------|--------|
| `VITE_OCMS_CASE_STRIP_ENABLED` | **Runtime** env (Vite) — canonical for FE |
| `OCMS_CASE_STRIP_ENABLED` | **Documentation / authority** alias — means same gate |

Future workspace: `VITE_CASE_WORKSPACE_ENABLED` (reserved; not implemented in phase 01).

---

## 15. Relationship to OCMS pack

| OCMS doc | Case V1 relationship |
|----------|----------------------|
| `OCMS_READ_MODEL_CONTRACT.md` | CaseReadModel remains contract; Case V1 adds runtime refactor binding |
| `OCMS_CASE_DISCOVERY_AUTHORITY.md` | Unchanged; discovery feeds Case identity |
| `OCMS_CASE_LIFECYCLE_MODEL.md` | WorkflowState aligns with lifecycle codes |
| `OCMS_CASE_RELATION_MODEL.md` | Relations part of Case Context |

**On conflict:** STOP → document → FAIL or GO_WITH_WARNINGS per entrypoint.

---

*Binding authority for Case-Centric refactor. Amend via ADR + version bump.*
