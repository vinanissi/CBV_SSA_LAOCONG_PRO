# OCMS Case Lifecycle Model — V0

**Version:** 0.1  
**Status:** Design authority (conceptual)  
**Phase:** `PHASE_OCMS_01B_CASE_LIFECYCLE_MODEL`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md`  
**Related:** `OCMS_RESULT_MODEL.md`, `OCMS_CASE_TYPE_CATALOG.md`, `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`

---

## 1. Purpose

Define **Case Lifecycle** — the operational phase of a Case from creation through close and archive — **independent** of task status, checklist state, and Case Result.

Answers:

- Case sinh ra như thế nào?
- Case đi qua trạng thái vận hành nào?
- Khi nào review / đóng / archive / reopen?
- Case khác Task Status thế nào?

---

## 2. Lifecycle vs Task Status vs Result

| Dimension | Task Status | Case Lifecycle | Case Result |
|-----------|-------------|----------------|-------------|
| **Granularity** | One Work Item | Whole Case | Whole Case (outcome) |
| **Persistence today** | `TASK_MAIN` | None (V0) | None (V0) |
| **Question** | Task đang thế nào? | Case đang ở giai đoạn nào? | Case kết thúc ra sao? |
| **Mutability** | Task POST | Future case service / derive | Declare at milestone |
| **Example** | In Progress | REVIEW | Approved |
| **Example** | Done | RESOLVED | Approved |
| **Example** | Open | WAITING | (none yet) |

**Invariant:** Completing a task does **not** automatically set Lifecycle to CLOSED or Result to Approved.

**Checklist state:** Item done/undone is **Memory (Checklist Activity)** — not Lifecycle.

---

## 3. Global lifecycle states

| State | Code | Meaning |
|-------|------|---------|
| **NEW** | `NEW` | Case mới tạo hoặc mới nhận diện |
| **TRIAGE** | `TRIAGE` | Phân loại: Case Type, priority, responsibility |
| **ACTIVE** | `ACTIVE` | Đang xử lý |
| **WAITING** | `WAITING` | Chờ người khác, tài liệu, phản hồi, duyệt bên ngoài |
| **REVIEW** | `REVIEW` | Chờ kiểm tra / duyệt / xác nhận nội bộ |
| **BLOCKED** | `BLOCKED` | Kẹt: thiếu dữ liệu, quyền, lỗi quy trình; có thể escalation |
| **RESOLVED** | `RESOLVED` | Xử lý xong nghiệp vụ; chưa đóng/archive |
| **CLOSED** | `CLOSED` | Đóng; không còn hành động thường xuyên |
| **ARCHIVED** | `ARCHIVED` | Lưu trữ; chỉ tra cứu |
| **REOPENED** | `REOPENED` | Đã CLOSED (hoặc RESOLVED) nhưng mở lại |

---

## 4. State definitions

### NEW

Case vừa được tạo (explicit) hoặc **recognized** (inferred from first task/alert/hồ sơ link). No Case Type required yet.

### TRIAGE

Operator or system assigns Case Type, default Responsibility roles, priority, initial Work Items. May skip for simple OPERATIONS cases.

### ACTIVE

Primary work in progress — tasks assigned, checklist executed, modules updated.

### WAITING

External or cross-party dependency — not blocked by internal error. Responsible still owns case.

### REVIEW

Internal gate — Reviewer role must act. Often pairs with Result pending (Approved / Returned / Rejected).

### BLOCKED

Cannot proceed without remediation. Escalation via **Escalation** role + **Handoff** memory — not a separate lifecycle state required. May transition to REVIEW after escalation handoff.

### RESOLVED

Business handling complete; Result may already be set (e.g. Approved). Awaiting formal close or operator confirmation.

### CLOSED

No regular actions; Result should be terminal or stable. Differs from ARCHIVED in retention/access policy (future).

### ARCHIVED

Long-term storage; read-only for operators. Terminal for active lifecycle.

### REOPENED

Transient entry state after reopen — typically moves to ACTIVE or TRIAGE quickly.

---

## 5. Transition rules

### 5.1 Primary flow

```text
NEW → TRIAGE → ACTIVE → WAITING* → REVIEW* → RESOLVED → CLOSED → ARCHIVED
                 ↑__________|          |
                 (return from WAITING)  (return from REVIEW if rework → ACTIVE)
```

`*` = optional hops; may skip TRIAGE for OPERATIONS; may skip WAITING/REVIEW per Case Type.

### 5.2 Branch — BLOCKED

```text
ACTIVE → BLOCKED → ACTIVE          (unblocked)
BLOCKED → REVIEW                   (escalation resolved; needs approval)
BLOCKED → RESOLVED                 (rare; forced close with Result + Decision)
```

Escalation **artifact:** Responsibility (Escalation role) + Memory (Handoff, Comment) + optional Result group **ESCALATED** — not mandatory lifecycle state `ESCALATED`.

### 5.3 Branch — REOPEN

```text
CLOSED → REOPENED → ACTIVE | TRIAGE
ARCHIVED → (generally no reopen without admin ADR; if allowed) → REOPENED → TRIAGE
```

Default: **ARCHIVED** does not reopen without governance exception (documented in §9).

### 5.4 Transition matrix (allowed forward)

| From \ To | TRIAGE | ACTIVE | WAITING | REVIEW | BLOCKED | RESOLVED | CLOSED | ARCHIVED | REOPENED |
|-----------|--------|--------|---------|--------|---------|----------|--------|----------|----------|
| NEW | ✓ | ✓ | | | | | | | |
| TRIAGE | | ✓ | ✓ | | ✓ | | | | |
| ACTIVE | | | ✓ | ✓ | ✓ | ✓ | | | |
| WAITING | | ✓ | | ✓ | ✓ | | | | |
| REVIEW | | ✓ | ✓ | | ✓ | ✓ | | | |
| BLOCKED | | ✓ | | ✓ | | ✓ | | | |
| RESOLVED | | | | | | | ✓ | ✓ | |
| CLOSED | | | | | | | | ✓ | ✓ |
| REOPENED | ✓ | ✓ | | | | | | | |
| ARCHIVED | | | | | | | | | ⚠ admin |

Backward transitions (e.g. REVIEW → ACTIVE for rework) are **allowed** with Memory **Decision** or **Update** — not errors.

---

## 6. Lifecycle by Case Type

| Case Type | Typical path | REVIEW required? | WAITING common? |
|-----------|--------------|------------------|-----------------|
| HO_SO | NEW→TRIAGE→ACTIVE→REVIEW→RESOLVED→CLOSED→ARCHIVED | Yes | Yes (bổ sung giấy tờ) |
| FINANCE | NEW→TRIAGE→ACTIVE→REVIEW→RESOLVED→CLOSED | Yes | Yes (chứng từ) |
| INVOICE | NEW→ACTIVE→WAITING→REVIEW→CLOSED | Yes | Yes (đối soát) |
| MEMBERSHIP | NEW→TRIAGE→ACTIVE→WAITING→RESOLVED→CLOSED | Optional | Yes (liên hệ xã viên) |
| COMPLAINT | NEW→TRIAGE→ACTIVE→BLOCKED?→REVIEW→RESOLVED→CLOSED | Optional | Yes |
| OPERATIONS | NEW→ACTIVE→RESOLVED→CLOSED | Rare | Sometimes |
| PROJECT | NEW→TRIAGE→ACTIVE→BLOCKED→ACTIVE→REVIEW→CLOSED | Yes (milestones) | Yes |
| SUPPORT | NEW→ACTIVE→WAITING→RESOLVED→CLOSED | Rare | Yes |
| COMPLIANCE | NEW→TRIAGE→ACTIVE→REVIEW→BLOCKED→REVIEW→CLOSED | Yes | Yes |
| DOCUMENT | NEW→ACTIVE→REVIEW→RESOLVED→CLOSED→ARCHIVED | Yes | Sometimes |

See `OCMS_CASE_TYPE_CATALOG.md` §7 for lifecycle hints.

---

## 7. Lifecycle + Responsibility

| Lifecycle | Primary roles active |
|-----------|---------------------|
| NEW / TRIAGE | **Responsible** assigns; **Support** may be nominated |
| ACTIVE | **Support** executes; **Responsible** accountable |
| WAITING | **Responsible** owns; **Watcher** may nudge external party |
| REVIEW | **Reviewer** must act; **Responsible** not relieved |
| BLOCKED | **Escalation** engaged; **Responsible** retains ownership |
| RESOLVED / CLOSED | **Reviewer** may have signed; **Responsible** confirms |
| REOPENED | **Responsible** + **Reviewer** (if re-approval needed) |

Lifecycle transition by **Escalation** role requires **Handoff** memory entry.

---

## 8. Lifecycle + Memory

Each lifecycle transition should produce **Memory**:

| Transition | Memory types |
|------------|--------------|
| Any forward/back | **Update**, **Timeline** |
| TRIAGE complete | **Decision** (type + priority) |
| → REVIEW | **Update** + notify Reviewer |
| → BLOCKED | **Comment** + **Handoff** (if escalation) |
| → RESOLVED | **Decision** + **Evidence** (if required by type) |
| → CLOSED | **Decision** + link to **Result** |
| → ARCHIVED | **Update** (archive ref) |
| REOPENED | **Decision** (reason mandatory) |

---

## 9. Lifecycle + Result

| Lifecycle | Typical Result state |
|-----------|---------------------|
| NEW–ACTIVE | Result unset or OPEN-group equivalents |
| WAITING | Result unset; may have in-progress task results |
| REVIEW | Result pending — **Approved / Returned / Rejected** decided here |
| BLOCKED | Result unset or ESCALATED group milestone |
| RESOLVED | Result set (e.g. Approved, Resolved, Completed) |
| CLOSED | Result terminal (Approved, Closed, Reconciled, …) |
| ARCHIVED | Result terminal + Archived where applicable |
| REOPENED | Result may reset to OPEN-group or retain prior with superseding Decision |

**Example:** Lifecycle = **REVIEW**, Result = (pending) → Reviewer acts → Result = **Returned**, Lifecycle → **ACTIVE** (rework).

---

## 10. Reopen rules

1. **From CLOSED:** Allowed with **Decision** memory — reason, actor, date. Target: REOPENED → ACTIVE or TRIAGE.
2. **From ARCHIVED:** Default **denied** — requires admin/governance flag (future ADR).
3. **Responsible** or **Reviewer** may request reopen; **Escalation** path if dispute.
4. Reopen **does not** delete prior Memory — append-only history.
5. Reopen **does not** auto-reopen all child tasks — Work Items handled per task ADR.

---

## 11. Archive rules

1. **Entry:** CLOSED → ARCHIVED after retention policy or operator action.
2. **ARCHIVED** cases: read-only lifecycle; no ACTIVE without reopen exception.
3. **Memory** preserved; attachments remain Evidence references.
4. **Result** should be terminal (e.g. Archived, Reconciled, Closed).
5. HO_SO, DOCUMENT, INVOICE types favor ARCHIVED; OPERATIONS may stop at CLOSED.

---

## 12. Anti-patterns

| Pattern | Reject |
|---------|--------|
| Lifecycle = `TASK_MAIN.STATUS` | Conflates layers |
| Inbox group "Waiting" = Lifecycle WAITING 1:1 | Inbox is task queue UX |
| Checklist 100% = RESOLVED | Checklist is Memory |
| CLOSED without Result on review types | HO_SO/FINANCE need Result |
| ESCALATED as mandatory lifecycle state | Use BLOCKED + Responsibility + Result group |
| Persist lifecycle on TASK_MAIN | Violates separation |

---

## 13. Complete OCMS frame (with Lifecycle)

```text
CASE
├── CASE TYPE
├── LIFECYCLE        ← this document
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

---

## 14. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_CASE_LIFECYCLE_ADDENDUM.md` | ADR binding |
| `OCMS_RESULT_MODEL.md` | Result vs lifecycle §10 |
| `OCMS_CASE_TYPE_CATALOG.md` | Per-type lifecycle hints |
| `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` | CRM + lifecycle §12 |

---

*Append-only. Bump version when lifecycle persistence or API contract is introduced.*
