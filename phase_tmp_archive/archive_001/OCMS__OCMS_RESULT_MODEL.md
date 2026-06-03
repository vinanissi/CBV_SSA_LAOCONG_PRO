# OCMS Result Model — V0

**Version:** 0.1  
**Status:** Design authority (conceptual)  
**Phase:** `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md`  
**Related:** `OCMS_CASE_TYPE_CATALOG.md`, `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md`

---

## 1. Purpose

Define **Result** for CBV OCMS: terminal or milestone **outcome** of a Case — not task row **status**.

---

## 2. Result vs status

| Dimension | Task status (`TASK_MAIN`) | Case Result (OCMS) |
|-----------|---------------------------|---------------------|
| **Scope** | Single Work Item / task row | Case (may span many Work Items) |
| **Mutation** | GAS/Worker POST on task fields | **Derived** or **declared** at case level (future) |
| **Operator question** | *Task này đang ở trạng thái gì?* | *Case này kết thúc / tiến tới đâu, theo nghĩa nghiệp vụ?* |
| **Examples** | Open, In Progress, Done (task) | Approved, Returned, Reconciled, Archived (case) |
| **Review / evidence** | Not modeled in status alone | Result binds Reviewer role + Evidence memory |

**Invariant V0:** No new status column on `TASK_MAIN` for Case Result.

---

## 3. Result is not only COMPLETED

Case Result includes:

- **Positive closure** — Completed, Approved, Paid, Delivered, Resolved, Archived
- **Negative / return** — Rejected, Returned, Cancelled
- **Pause** — Deferred, Blocked
- **Escalation** — Escalated (intermediate or terminal per type)
- **Open / in-flight** — Open, In Progress, Investigating, Validating

Binary "done" is insufficient for HO_SO (Returned for correction), FINANCE (Reconciled), COMPLAINT (Escalated).

---

## 4. Global result groups

Cross-type grouping for dashboards and filters (conceptual):

| Group | Meaning | Example results |
|-------|---------|-----------------|
| **OPEN** | Active; not terminal | Open, In Progress, Investigating, Draft, Planned, Active |
| **COMPLETED** | Work done; may still need review | Completed, Delivered, Resolved |
| **APPROVED** | Formally accepted | Approved, Verified, Paid, Renewed |
| **REJECTED** | Denied; terminal negative | Rejected, Terminated (hard) |
| **RETURNED** | Sent back for correction | Returned, Error (fixable) |
| **DEFERRED** | Explicitly paused | Deferred, Blocked |
| **CANCELLED** | Withdrawn / void | Cancelled |
| **ESCALATED** | Elevated path | Escalated |
| **CLOSED** | Terminal archive / no further action | Closed, Archived, Reconciled, Exported |

One **specific result** maps to one **group** (future binding table).

---

## 5. Result by Case Type

### HO_SO

| Result | Group | Notes |
|--------|-------|-------|
| Received | OPEN | Hồ sơ tiếp nhận |
| Validating | OPEN | Đang kiểm tra hồ sơ |
| Approved | APPROVED | Duyệt hồ sơ |
| Returned | RETURNED | Trả lại bổ sung |
| Rejected | REJECTED | Từ chối |
| Archived | CLOSED | Lưu trữ |

### FINANCE

| Result | Group | Notes |
|--------|-------|-------|
| Draft | OPEN | Phiếu nháp |
| Verified | OPEN | Đã đối chiếu sơ bộ |
| Approved | APPROVED | Duyệt chi / thu |
| Paid | APPROVED | Đã thanh toán |
| Reconciled | CLOSED | Quyết toán xong |
| Closed | CLOSED | Đóng kỳ |

### INVOICE

| Result | Group | Notes |
|--------|-------|-------|
| Received | OPEN | Nhận hóa đơn |
| Parsed | OPEN | Đã parse XML/PDF |
| Matched | APPROVED | Khớp đơn / PO |
| Error | RETURNED | Lỗi cần sửa |
| Exported | CLOSED | Xuất kế toán |
| Archived | CLOSED | Lưu trữ |

### MEMBERSHIP

| Result | Group | Notes |
|--------|-------|-------|
| Open | OPEN | Hồ sơ gia nhập/gia hạn mở |
| Contacted | OPEN | Đã liên hệ xã viên |
| Renewed | APPROVED | Gia hạn thành công |
| Terminated | REJECTED | Thanh lý |
| Cancelled | CANCELLED | Hủy thủ tục |

### COMPLAINT

| Result | Group | Notes |
|--------|-------|-------|
| Open | OPEN | Tiếp nhận |
| Investigating | OPEN | Đang xử lý |
| Resolved | COMPLETED | Đã xử lý xong |
| Escalated | ESCALATED | Chuyển cấp |
| Closed | CLOSED | Đóng case |

### OPERATIONS

| Result | Group | Notes |
|--------|-------|-------|
| Open | OPEN | Việc mới |
| In Progress | OPEN | Đang làm |
| Completed | COMPLETED | Hoàn thành |
| Deferred | DEFERRED | Hoãn |
| Cancelled | CANCELLED | Hủy |

### PROJECT

| Result | Group | Notes |
|--------|-------|-------|
| Planned | OPEN | Lên kế hoạch |
| Active | OPEN | Triển khai |
| Blocked | DEFERRED | Bị chặn |
| Delivered | COMPLETED | Bàn giao |
| Closed | CLOSED | Đóng dự án |

### SUPPORT

Uses OPERATIONS-like set: Open → In Progress → Completed / Deferred / Cancelled; Escalated when L2 required.

### COMPLIANCE

| Result | Group | Notes |
|--------|-------|-------|
| Open | OPEN | Kiểm tra mở |
| In Review | OPEN | Đang audit |
| Finding | RETURNED | Phát hiện cần khắc phục |
| Cleared | APPROVED | Đạt |
| Closed | CLOSED | Đóng audit |

### DOCUMENT

| Result | Group | Notes |
|--------|-------|-------|
| Draft | OPEN | Soạn thảo |
| In Review | OPEN | Chờ duyệt |
| Approved | APPROVED | Duyệt văn bản |
| Published | CLOSED | Ban hành / lưu trữ |
| Returned | RETURNED | Trả lại sửa |
| Cancelled | CANCELLED | Hủy soạn thảo |

Full type defaults: `OCMS_CASE_TYPE_CATALOG.md`.

---

## 6. Result + Responsibility + Memory

Every **terminal or milestone Result** should be traceable to:

| Binding | Question |
|---------|----------|
| **Who closes (Responsible / Reviewer)** | Ai chốt result? |
| **Evidence (Memory)** | Bằng chứng nào bắt buộc? (attachment, signed doc) |
| **Decision (Memory)** | Quyết định nào ghi nhận? (approval comment) |
| **Timeline (Memory)** | Sự kiện chuyển result trên log nào? |

### Example — HO_SO Approved

| Element | Binding |
|---------|---------|
| Closer | **Reviewer** (and **Responsible** accountable) |
| Evidence | Attachment: CMND, hợp đồng; Checklist: đủ giấy tờ |
| Decision | Memory type **Decision** — "Duyệt hồ sơ HD-2026-001" |
| Timeline | `HO_SO_UPDATE_LOG` + task `TASK_UPDATE_LOG` |

### Example — FINANCE Reconciled

| Element | Binding |
|---------|---------|
| Closer | **Reviewer** + finance approver |
| Evidence | Attachment: sao kê, phiếu chi; Update: số tiền khớp |
| Decision | Approved → Paid → Reconciled chain in Memory |
| Timeline | `FINANCE_LOG` |

### Example — COMPLAINT Escalated

| Element | Binding |
|---------|---------|
| Closer | **Escalation** role receives; **Responsible** remains |
| Evidence | Comment + timeline of prior investigation |
| Decision | Handoff memory to escalation target |
| Timeline | Escalation event in federated Memory view |

---

## 7. Derivation rules (V0 — conceptual)

1. **Single-task case (OPERATIONS):** Result may **mirror** task completion → group COMPLETED, but label **Completed** (case) vs task status (technical).
2. **Multi-task case (PROJECT, HO_SO):** Result = aggregate rule (future) — e.g. all checklist done + Reviewer Decision → Approved.
3. **Alert-only case:** Result from HOME_ALERT resolve → Resolved / Closed.
4. **No auto-result** in V0 — operator or future rule engine declares milestone.

---

## 8. Anti-patterns

| Pattern | Reject |
|---------|--------|
| Map Case Result 1:1 to `TASK_MAIN.STATUS` | Loses type-specific outcomes |
| COMPLETED only | Ignores Returned, Reconciled, Archived |
| Result without Reviewer on APPROVED types | HO_SO, FINANCE, DOCUMENT need review binding |
| Persist RESULT sheet in this phase | Violates no-schema |

---

## 9. Document map

| Document | Role |
|----------|------|
| `OCMS_CASE_TYPE_CATALOG.md` | Per-type result hints |
| `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` | Result pillar in CRM |
| `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md` | Binding ADR |

---

## 10. Lifecycle and Result relationship

| Concept | Role |
|---------|------|
| **Lifecycle** | Operational **phase** — NEW, ACTIVE, REVIEW, CLOSED, … |
| **Result** | Business **outcome** — Approved, Returned, Reconciled, … |
| **Task status** | Work Item technical state — not documented here |

**Orthogonal examples:**

| Lifecycle | Result | Valid? |
|-----------|--------|--------|
| REVIEW | (pending) | Yes — awaiting Reviewer |
| REVIEW | Returned | Yes — rework; Lifecycle may → ACTIVE |
| ACTIVE | (none) | Yes — work ongoing |
| RESOLVED | Approved | Yes — ready to close |
| CLOSED | Approved | Yes — terminal pair |
| WAITING | Open-group | Yes — external dependency |

**ESCALATED** is a **Result group** and Memory/Responsibility event — not a required Lifecycle state. Use Lifecycle **BLOCKED** when work cannot proceed.

Full lifecycle spec: `OCMS_CASE_LIFECYCLE_MODEL.md` §9.

This section does not alter §1–§9 above.

---

## 11. Result and Relation

| Result context | Relation requirement (guideline) |
|----------------|-----------------------------------|
| HO_SO Approved | PRIMARY HO_SO + EVIDENCE_REF DOCUMENT |
| FINANCE Reconciled | PRIMARY FINANCE_TRANSACTION |
| INVOICE Matched | PRIMARY INVOICE + SECONDARY FINANCE_TRANSACTION |
| COMPLAINT Resolved | PRIMARY PERSON/XA_VIEN + SOURCE trace |
| DOCUMENT Published | PRIMARY DOCUMENT + TARGET org/unit |

Result declaration does **not** auto-create relations — relations are validated at REVIEW (future).

Full spec: `OCMS_CASE_RELATION_MODEL.md` §11.

This section does not alter §1–§10 above.

---

## 12. Read Model result fields

Contract **`result`** object (nullable):

| Field | Maps from |
|-------|-----------|
| `code` | Type-specific result code |
| `group` | Global result group |
| `label` | Operator label |
| `source` | DeriveSource |
| `confidence` | Inference quality |

`null` when no outcome. Task complete ≠ `result` without inference rule (mapping §5).

This section does not alter §1–§11 above.

---

*Append-only. Bump version when result persistence or API contract is introduced.*
