# OCMS Case Relation Model — V0

**Version:** 0.1  
**Status:** Design authority (conceptual)  
**Phase:** `PHASE_OCMS_01C_CASE_RELATION_MODEL`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_RELATION_ADDENDUM.md`

---

## 1. Purpose

Define **Case Relation** — conceptual links from a Case to business entities — answering:

- Case liên quan tới thực thể nghiệp vụ nào?
- Xã viên / hồ sơ / phương tiện / đơn vị / giao dịch / hóa đơn / tài liệu nào?
- Quan hệ nào PRIMARY, quan hệ nào SECONDARY?
- Một hồ sơ có nhiều case? Một case nhiều hồ sơ?

---

## 2. Relation vs Case Key vs Module Projection vs Attachment

| Layer | Question | Mutable by | Example |
|-------|----------|------------|---------|
| **Case Key** | Case là ai / mã gì? | Convention (future) | `HO_SO:HS-2026-001` |
| **Case Relation** | Case **gắn** entity nào, vai trò gì? | Future relation service | `HO_SO:HS-2026-001` role **PRIMARY** |
| **Module Projection** | Module **hiển thị** gì? | Read API / sheet | Name, status from `HO_SO_MASTER` |
| **Attachment (Memory)** | **Bằng chứng** file nào? | Work Inbox attachments | `CCCD_scan.pdf` |
| **Work Item (TASK)** | **Việc** nào trong queue? | `TASK_MAIN` | Task T-1001 |

**Example (HO_SO case):**

```text
Case Key:     HO_SO:HS-2026-001

Relations:
  HO_SO:HS-2026-001     PRIMARY
  XA_VIEN:XV-0001       TARGET
  PHUONG_TIEN:51H-12345  SECONDARY
  DOCUMENT:DOC-001      EVIDENCE_REF
  DON_VI:HTX_TT_HOI     SECONDARY

Projections:
  HO_SO_MASTER row HS-2026-001
  HO_SO_FILE attachments index

Memory Attachments:
  CCCD scan, Hợp đồng, Biên nhận (may also have DOCUMENT relations)
```

---

## 3. Relation target types

| Type | Code | Description | Typical ID source |
|------|------|-------------|-------------------|
| Xã viên | `XA_VIEN` | Thành viên / tài xế | `HO_SO_MASTER`, member code |
| Hồ sơ | `HO_SO` | Hồ sơ nghiệp vụ | `HO_SO_ID` |
| Phương tiện | `PHUONG_TIEN` | Xe / tài sản / thiết bị | Vehicle reg / asset code |
| Đơn vị | `DON_VI` | HTX / phòng ban / tổ | Unit code |
| Giao dịch TC | `FINANCE_TRANSACTION` | Thu chi / tạm ứng / công nợ | Transaction ID |
| Hóa đơn | `INVOICE` | HĐ / XML / chứng từ | Invoice ref |
| Tài liệu | `DOCUMENT` | Văn bản / hợp đồng nghiệp vụ | Doc ID (not file blob) |
| Nhân sự | `PERSON` | Người phụ trách / liên hệ | `USER_DIRECTORY` / external |
| Tổ chức | `ORGANIZATION` | NCC / đối tác / cơ quan | Org code |
| Dự án | `PROJECT` | Dự án / chiến dịch | Project ID |
| Cảnh báo | `ALERT` | HOME_ALERT / signal | `ALERT_ID` |
| Task | `TASK` | Work Item liên quan | `TASK_ID` |

---

## 4. Relation roles

| Role | Meaning |
|------|---------|
| **PRIMARY** | Thực thể chính của case (one per target-type group — see §5) |
| **SECONDARY** | Liên quan phụ |
| **SOURCE** | Nguồn phát sinh case |
| **TARGET** | Đối tượng cần xử lý trực tiếp |
| **EVIDENCE_REF** | Entity làm bằng chứng (often DOCUMENT) |
| **DEPENDENCY** | Case phụ thuộc để tiếp tục |
| **DUPLICATE_OF** | Nghi trùng case/entity |
| **CHILD_OF** | Case/thực thể con (phân rã) |
| **PARENT_OF** | Case/thực thể cha (tổng hợp) |
| **BLOCKED_BY** | Đang kẹt vì entity/case này |

---

## 5. Cardinality rules

1. **One Case → many Relations** (0..N).
2. Each Relation = **`targetType` + `targetId` + `role`** (+ optional metadata future).
3. **PRIMARY guideline:** At most **one PRIMARY** per Case per **target type** (e.g. one PRIMARY HO_SO). Multiple SECONDARY allowed.
4. **One target entity → many Cases** (e.g. one `XA_VIEN` many membership + complaint cases).
5. **TASK relation** points to related tasks — does **not** replace Work Item execution model; primary work may still be inbox task.
6. **DOCUMENT relation** = business document entity — does **not** replace Attachment Memory (file may have both).
7. **Case-to-Case** relations use roles CHILD_OF / PARENT_OF / DUPLICATE_OF / BLOCKED_BY with `targetType` = future `CASE` or Case Key string (V0: document as convention only, no CASE table).

---

## 6. Primary relation rules

| Case Type | Expected PRIMARY | Typical TARGET |
|-----------|------------------|----------------|
| HO_SO | HO_SO | XA_VIEN |
| FINANCE | FINANCE_TRANSACTION | PERSON or DON_VI |
| INVOICE | INVOICE | ORGANIZATION |
| MEMBERSHIP | XA_VIEN | — |
| COMPLAINT | PERSON or XA_VIEN | — |
| OPERATIONS | TASK | — |
| PROJECT | PROJECT | — |
| SUPPORT | PERSON or DON_VI | — |
| COMPLIANCE | DOCUMENT or DON_VI | PERSON / DON_VI |
| DOCUMENT | DOCUMENT | DON_VI / ORGANIZATION |

If PRIMARY missing at TRIAGE lifecycle, relation gap should be filled before REVIEW (future rule).

---

## 7. Relation by Case Type (detail)

### HO_SO

| Role | Types |
|------|-------|
| PRIMARY | HO_SO |
| TARGET | XA_VIEN |
| SECONDARY | PHUONG_TIEN, DOCUMENT, DON_VI |
| EVIDENCE_REF | DOCUMENT |

### FINANCE

| Role | Types |
|------|-------|
| PRIMARY | FINANCE_TRANSACTION |
| TARGET | PERSON, DON_VI |
| EVIDENCE_REF | INVOICE, DOCUMENT |
| SECONDARY | HO_SO, XA_VIEN |

### INVOICE

| Role | Types |
|------|-------|
| PRIMARY | INVOICE |
| SECONDARY | FINANCE_TRANSACTION |
| TARGET | ORGANIZATION |
| EVIDENCE_REF | DOCUMENT |

### MEMBERSHIP

| Role | Types |
|------|-------|
| PRIMARY | XA_VIEN |
| SECONDARY | HO_SO, FINANCE_TRANSACTION |
| TARGET | XA_VIEN |

### COMPLAINT

| Role | Types |
|------|-------|
| PRIMARY | PERSON or XA_VIEN |
| SOURCE | ALERT, TASK |
| EVIDENCE_REF | DOCUMENT |
| BLOCKED_BY | PERSON, ORGANIZATION, TASK |

### OPERATIONS

| Role | Types |
|------|-------|
| PRIMARY | TASK |
| SECONDARY | DOCUMENT, PERSON, DON_VI |

### PROJECT

| Role | Types |
|------|-------|
| PRIMARY | PROJECT |
| CHILD_OF / PARENT_OF | TASK (future CASE) |
| SECONDARY | DOCUMENT, DON_VI, PERSON |

### SUPPORT

| Role | Types |
|------|-------|
| PRIMARY | PERSON or DON_VI |
| SOURCE | TASK, ALERT |
| EVIDENCE_REF | DOCUMENT |

### COMPLIANCE

| Role | Types |
|------|-------|
| PRIMARY | DOCUMENT or DON_VI |
| EVIDENCE_REF | DOCUMENT |
| TARGET | PERSON, DON_VI |

### DOCUMENT

| Role | Types |
|------|-------|
| PRIMARY | DOCUMENT |
| TARGET | DON_VI, ORGANIZATION |
| SECONDARY | PERSON (reviewer as PERSON relation optional) |

See `OCMS_CASE_TYPE_CATALOG.md` §8.

---

## 8. Related case rules

- **PARENT_OF / CHILD_OF:** Project case may parent task-level cases (future); decomposition without merging Work Items.
- **DUPLICATE_OF:** Triage may flag duplicate HO_SO or COMPLAINT cases; Resolution = close duplicate with Decision memory.
- **BLOCKED_BY:** Lifecycle BLOCKED often correlates with BLOCKED_BY relation to TASK, PERSON, or missing DOCUMENT.
- **Cross-case search:** Index by PRIMARY target (future) — e.g. all cases for `XA_VIEN:XV-0001`.

---

## 9. Relation + Responsibility

| Relation role | Responsibility hint |
|---------------|----------------------|
| PRIMARY HO_SO / XA_VIEN | **Responsible** often tied to hồ sơ owner |
| TARGET PERSON | **Support** or subject of case |
| SOURCE ALERT | **Watcher** or **Escalation** from alert assignee |
| EVIDENCE_REF DOCUMENT | **Reviewer** validates evidence |
| BLOCKED_BY | **Escalation** role engages |

Relations do **not** assign roles automatically in V0 — they **inform** Responsibility binding phases.

---

## 10. Relation + Memory

| Memory type | Relation tie |
|-------------|--------------|
| Attachment | May reference same file as DOCUMENT relation — Attachment = bytes/ref in Memory; DOCUMENT relation = business doc entity |
| Decision | May cite PRIMARY entity ID |
| Handoff | May transfer PRIMARY TARGET (e.g. XA_VIEN case handoff) |
| Timeline | Logs relation add/remove (future) |

---

## 11. Relation + Result

- Result **Approved** on HO_SO often requires PRIMARY HO_SO + EVIDENCE_REF DOCUMENT relations satisfied.
- Result **Reconciled** on FINANCE requires PRIMARY FINANCE_TRANSACTION relation.
- Result does not create relations — relations are preconditions or audit context.

---

## 12. Relation + Lifecycle

| Lifecycle | Relation activity |
|-----------|-------------------|
| NEW | Optional SOURCE (ALERT, TASK) |
| TRIAGE | Assign PRIMARY + TARGET; add SECONDARY |
| ACTIVE | Add/update SECONDARY, DEPENDENCY |
| WAITING | DEPENDENCY on external DOCUMENT / PERSON |
| BLOCKED | BLOCKED_BY relation required |
| REVIEW | EVIDENCE_REF must be complete for review types |
| CLOSED / ARCHIVED | Relations read-only |

---

## 13. Anti-patterns

| Pattern | Reject |
|---------|--------|
| Case Key = full relation set | Key identifies case; relations are graph |
| Module Projection row = Relation | Projection is read cache |
| Attachment row = DOCUMENT relation only | Need both semantics when applicable |
| TASK relation replaces inbox Work Item | Work Item remains execution unit |
| Many PRIMARY HO_SO on one case | Violates guideline |
| Persist relations on TASK_MAIN columns | Use future relation store or derive phase |

---

## 14. Complete OCMS frame

```text
CASE
├── CASE TYPE
├── LIFECYCLE
├── RELATION(S)      ← this document
├── RESPONSIBILITY
├── WORK / STEPS
├── MEMORY
├── RESULT
└── MODULE PROJECTION
```

---

## 15. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_CASE_RELATION_ADDENDUM.md` | ADR |
| `OCMS_CASE_TYPE_CATALOG.md` | §8 relation hints |
| `OCMS_CASE_LIFECYCLE_MODEL.md` | §15 lifecycle + relation |
| `OCMS_RESULT_MODEL.md` | §11 result + relation |

---

## 16. Read Model usage of relations

Contract field **`relations[]`**:

- Each item: `targetType`, `targetId`, `role`, `label`, `source`, `confidence`, optional `projectionKey`
- **`projectionKey`** links to `projections.{key}` — relation metadata ≠ projection payload
- **`diagnostics.missingRelations`** when PRIMARY expected per `caseType` absent

Examples: `OCMS_READ_MODEL_EXAMPLES.md`.

This section does not alter §1–§15 above.

---

*Append-only. Bump version when relation persistence or API contract is introduced.*
