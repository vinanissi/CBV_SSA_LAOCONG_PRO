# OCMS Case Type Catalog — V0

**Version:** 0.1  
**Status:** Design authority (conceptual classification)  
**Phase:** `PHASE_OCMS_01A_CASE_TYPE_AND_RESULT_MODEL`  
**Branch:** `phase/ocms-foundation-v1`  
**ADR:** `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md`  
**Result detail:** `OCMS_RESULT_MODEL.md`

---

## 1. Purpose

Catalog **Case Type** codes for CBV OCMS V0. Case Type answers: *đây là loại case gì?* and drives default patterns for checklist, documents, SLA intent, responsibility, memory emphasis, and result model.

**Not persisted** in this phase — no `CASE_TYPE` sheet.

---

## 2. Catalog index

| Code | Tên tiếng Việt | Pilot priority |
|------|----------------|----------------|
| `HO_SO` | Hồ sơ xã viên / hồ sơ vận hành | **P0** |
| `OPERATIONS` | Công việc vận hành nội bộ | **P0** |
| `FINANCE` | Thu chi, tạm ứng, quyết toán, công nợ | **P0** |
| `COMPLAINT` | Khiếu nại, phản hồi, tranh chấp | **P1** |
| `MEMBERSHIP` | Gia nhập, gia hạn, thanh lý xã viên | **P1** |
| `INVOICE` | Hóa đơn, chứng từ, XML, đối soát | **P1** |
| `DOCUMENT` | Soạn, duyệt, lưu trữ, bàn giao tài liệu | **P1** |
| `PROJECT` | Việc dự án, triển khai, mở xã | **P2** |
| `SUPPORT` | Hỗ trợ nhân sự / đơn vị / xã viên | **P2** |
| `COMPLIANCE` | Kiểm tra, audit, pháp lý, quy định | **P2** |

---

## 3. Type definitions

### 3.1 HO_SO

| Field | Value |
|-------|-------|
| **code** | `HO_SO` |
| **tên tiếng Việt** | Hồ sơ xã viên / hồ sơ vận hành |
| **mô tả** | Case xử lý hồ sơ xã viên, tài xế, phương tiện, giấy tờ — tiếp nhận, kiểm tra, duyệt, trả lại, lưu trữ |
| **ví dụ case** | Duyệt hồ sơ gia nhập xã viên mới; bổ sung giấy tờ GPLX hết hạn; hồ sơ phương tiện đăng ký mới |
| **module liên quan** | HO_SO (`HO_SO_MASTER`, `HO_SO_FILE`), TASK, DOCS |
| **checklist pattern** | Tiếp nhận → Kiểm tra đủ giấy tờ → Xác minh thông tin → Duyệt / Trả lại → Lưu trữ |
| **responsibility default** | **Responsible:** cán bộ hồ sơ; **Support:** task assignee; **Reviewer:** trưởng bộ phận; **Escalation:** quản lý vận hành; **Watcher:** xã viên / reporter |
| **memory emphasis** | Attachment (giấy tờ), Checklist Activity, Decision (duyệt/trả), Timeline (`HO_SO_UPDATE_LOG`) |
| **result model gợi ý** | Received → Validating → Approved \| Returned \| Rejected → Archived |
| **pilot priority** | **P0** |

---

### 3.2 FINANCE

| Field | Value |
|-------|-------|
| **code** | `FINANCE` |
| **tên tiếng Việt** | Thu chi, tạm ứng, quyết toán, công nợ |
| **mô tả** | Case liên quan dòng tiền: tạm ứng, phiếu chi, thu, quyết toán, đối soát công nợ |
| **ví dụ case** | Quyết toán tạm ứng tháng 5; đối soát công nợ xã viên A; duyệt chi mua vật tư |
| **module liên quan** | FINANCE (`FINANCE_TRANSACTION`, `FINANCE_LOG`), TASK, INVOICE (cross) |
| **checklist pattern** | Lập phiếu → Đính kèm chứng từ → Đối chiếu → Duyệt → Thanh toán → Quyết toán |
| **responsibility default** | **Responsible:** kế toán phụ trách; **Support:** người tạm ứng; **Reviewer:** kế toán trưởng / TGĐ; **Escalation:** ban lãnh đạo; **Watcher:** bộ phận yêu cầu |
| **memory emphasis** | Attachment (chứng từ), Update (số tiền), Decision (duyệt chi), Evidence (sao kê) |
| **result model gợi ý** | Draft → Verified → Approved → Paid → Reconciled → Closed |
| **pilot priority** | **P0** |

---

### 3.3 INVOICE

| Field | Value |
|-------|-------|
| **code** | `INVOICE` |
| **tên tiếng Việt** | Hóa đơn, chứng từ, XML, đối soát |
| **mô tả** | Case xử lý hóa đơn điện tử / giấy: nhận, parse, khớp đơn, xử lý lỗi, xuất kế toán |
| **ví dụ case** | Đối soát hóa đơn XML tháng 4; sửa lỗi MST không khớp; xuất batch sang phần mềm kế toán |
| **module liên quan** | INVOICE, FINANCE, DOCS |
| **checklist pattern** | Nhận HĐ → Parse/validate → Match PO/đơn → Xử lý lỗi → Duyệt → Export → Archive |
| **responsibility default** | **Responsible:** kế toán hóa đơn; **Support:** mua hàng / ops; **Reviewer:** kế toán trưởng; **Escalation:** CFO path; **Watcher:** bộ phận mua |
| **memory emphasis** | Attachment (XML/PDF), Update (match status), Timeline, Decision |
| **result model gợi ý** | Received → Parsed → Matched \| Error → Exported → Archived |
| **pilot priority** | **P1** |

---

### 3.4 MEMBERSHIP

| Field | Value |
|-------|-------|
| **code** | `MEMBERSHIP` |
| **tên tiếng Việt** | Gia nhập, gia hạn, thanh lý xã viên |
| **mô tả** | Case vòng đời thành viên: gia nhập, gia hạn phí, thay đổi hạng, thanh lý |
| **ví dụ case** | Gia hạn xã viên năm 2026; thủ tục gia nhập tài xế mới; thanh lý xã viên chuyển đơn vị |
| **module liên quan** | HO_SO, FINANCE (phí), MEMBERSHIP (AppSheet nếu có), TASK |
| **checklist pattern** | Tiếp nhận → Liên hệ xã viên → Thu phí / hồ sơ → Duyệt → Cập nhật danh sách → Đóng |
| **responsibility default** | **Responsible:** cán bộ xã viên; **Support:** CS; **Reviewer:** trưởng phòng; **Escalation:** ban điều hành; **Watcher:** xã viên |
| **memory emphasis** | Comment (liên hệ), Attachment (hợp đồng), Decision, Timeline |
| **result model gợi ý** | Open → Contacted → Renewed \| Terminated \| Cancelled |
| **pilot priority** | **P1** |

---

### 3.5 COMPLAINT

| Field | Value |
|-------|-------|
| **code** | `COMPLAINT` |
| **tên tiếng Việt** | Khiếu nại, phản hồi, tranh chấp |
| **mô tả** | Case xử lý phản hồi tiêu cực, tranh chấp nội bộ / với xã viên, escalation dịch vụ |
| **ví dụ case** | Khiếu nại phí không rõ; tranh chấp ca / chuyến; phản hồi thái độ CS |
| **module liên quan** | TASK, HO_SO (nếu gắn xã viên), HOME_ALERT |
| **checklist pattern** | Tiếp nhận → Xác minh → Điều tra → Đề xuất xử lý → Phản hồi → Đóng |
| **responsibility default** | **Responsible:** CS lead; **Support:** điều tra viên; **Reviewer:** quản lý; **Escalation:** ban TGĐ; **Watcher:** người khiếu nại |
| **memory emphasis** | Comment, Timeline, Decision, Handoff (escalation), Evidence |
| **result model gợi ý** | Open → Investigating → Resolved \| Escalated → Closed |
| **pilot priority** | **P1** |

---

### 3.6 OPERATIONS

| Field | Value |
|-------|-------|
| **code** | `OPERATIONS` |
| **tên tiếng Việt** | Công việc vận hành nội bộ |
| **mô tả** | Case công việc hàng ngày không gắn hồ sơ tài chính phức tạp — mặc định gần Work Inbox task |
| **ví dụ case** | Kiểm kê cuối tuần; cập nhật quy trình nội bộ; xử lý việc gấp từ ban điều hành |
| **module liên quan** | TASK (primary), DOCS |
| **checklist pattern** | Nhận việc → Thực hiện → Kiểm tra → Hoàn thành (generic Work Inbox checklist) |
| **responsibility default** | **Responsible:** OWNER_ID; **Support:** ASSIGNEE_ID; **Reviewer:** optional; **Escalation:** quản lý trực; **Watcher:** REPORTER_ID |
| **memory emphasis** | Checklist Activity, Comment, Update, Timeline (`TASK_UPDATE_LOG`) |
| **result model gợi ý** | Open → In Progress → Completed \| Deferred \| Cancelled |
| **pilot priority** | **P0** |

---

### 3.7 PROJECT

| Field | Value |
|-------|-------|
| **code** | `PROJECT` |
| **tên tiếng Việt** | Việc dự án, triển khai, mở xã |
| **mô tả** | Case nhiều bước, nhiều task, milestone — triển khai hệ thống, mở xã mới, dự án dài hạn |
| **ví dụ case** | Triển khai Work Inbox pilot tại xã B; mở xã mới Q3; dự án chuẩn hóa hồ sơ |
| **module liên quan** | TASK (nhiều), PROJECT (future), DOCS, HO_SO |
| **checklist pattern** | Kickoff → Milestone 1..N → Review → Deliverable → Sign-off → Close |
| **responsibility default** | **Responsible:** PM; **Support:** squad members; **Reviewer:** sponsor; **Escalation:** steering; **Watcher:** stakeholders |
| **memory emphasis** | Decision (milestone), Handoff, Attachment (deliverable), Timeline (federated) |
| **result model gợi ý** | Planned → Active → Blocked → Delivered → Closed |
| **pilot priority** | **P2** |

---

### 3.8 SUPPORT

| Field | Value |
|-------|-------|
| **code** | `SUPPORT` |
| **tên tiếng Việt** | Hỗ trợ nhân sự / đơn vị / xã viên |
| **mô tả** | Case hỗ trợ kỹ thuật hoặc vận hành — IT, quy trình, hướng dẫn sử dụng hệ thống |
| **ví dụ case** | Hỗ trợ đăng nhập AppSheet; hướng dẫn nhập liệu hồ sơ; hỗ trợ đơn vị mới |
| **module liên quan** | TASK, DOCS, HO_SO (optional) |
| **checklist pattern** | Tiếp nhận → Chẩn đoán → Xử lý / hướng dẫn → Xác nhận → Đóng |
| **responsibility default** | **Responsible:** support agent; **Support:** L1 assignee; **Reviewer:** team lead; **Escalation:** L2/L3; **Watcher:** requester |
| **memory emphasis** | Comment, Timeline, Handoff (L2), Attachment (screenshot) |
| **result model gợi ý** | Open → In Progress → Completed \| Escalated → Closed |
| **pilot priority** | **P2** |

---

### 3.9 COMPLIANCE

| Field | Value |
|-------|-------|
| **code** | `COMPLIANCE` |
| **tên tiếng Việt** | Kiểm tra, audit, pháp lý, quy định |
| **mô tả** | Case đảm bảo tuân thủ: audit nội bộ, kiểm tra pháp lý, khắc phục finding |
| **ví dụ case** | Audit quy trình thu phí; rà soát hợp đồng mẫu; kiểm tra lưu trữ hồ sơ theo quy định |
| **module liên quan** | DOCS, HO_SO, COMPLIANCE (future), TASK |
| **checklist pattern** | Lập kế hoạch audit → Thu thập → Đánh giá → Finding → Khắc phục → Xác nhận → Close |
| **responsibility default** | **Responsible:** compliance officer; **Support:** auditee; **Reviewer:** legal / TGĐ; **Escalation:** board path; **Watcher:** bộ phận bị audit |
| **memory emphasis** | Evidence, Decision, Attachment ( báo cáo ), Timeline, Handoff |
| **result model gợi ý** | Open → In Review → Finding → Cleared → Closed |
| **pilot priority** | **P2** |

---

### 3.10 DOCUMENT

| Field | Value |
|-------|-------|
| **code** | `DOCUMENT` |
| **tên tiếng Việt** | Soạn, duyệt, lưu trữ, bàn giao tài liệu |
| **mô tả** | Case vòng đời văn bản: soạn thảo, trình duyệt, ban hành, lưu trữ, bàn giao |
| **ví dụ case** | Soạn quy trình mới; duyệt công văn gửi Sở; lưu trữ hợp đồng mẫu |
| **module liên quan** | DOCS, TASK |
| **checklist pattern** | Draft → Review → Approve → Publish → Archive / Handoff |
| **responsibility default** | **Responsible:** người soạn; **Support:** task assignee; **Reviewer:** người duyệt; **Escalation:** lãnh đạo; **Watcher:** bộ phận nhận văn bản |
| **memory emphasis** | Attachment (bản chính), Decision, Comment, Handoff, Version (future) |
| **result model gợi ý** | Draft → In Review → Approved → Published \| Returned \| Cancelled |
| **pilot priority** | **P1** |

---

## 4. Case Type drives (summary matrix)

| Code | SLA intent (doc only) | Review required | Evidence typical |
|------|----------------------|-----------------|------------------|
| HO_SO | 3–5 ngày làm việc | Yes | Giấy tờ scan |
| FINANCE | Theo kỳ kế toán | Yes | Chứng từ gốc |
| INVOICE | 24–48h xử lý lỗi | Yes | XML/PDF |
| MEMBERSHIP | Theo chu kỳ phí | Yes | Hợp đồng |
| COMPLAINT | 48h phản hồi đầu | Optional | Ghi âm/ghi chú |
| OPERATIONS | Theo task due | Optional | Minimal |
| PROJECT | Milestone-based | Yes | Deliverable |
| SUPPORT | 4h L1 / 24h L2 | Optional | Screenshot |
| COMPLIANCE | Audit calendar | Yes | Báo cáo audit |
| DOCUMENT | Theo lịch ban hành | Yes | Bản signed |

*SLA = design intent only — no timer runtime in V0.*

---

## 5. Complete OCMS frame (reference)

```text
CASE
├── CASE TYPE        ← this catalog
├── RESPONSIBILITY   ← OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md
├── WORK / STEPS
├── MEMORY
├── RESULT           ← OCMS_RESULT_MODEL.md
└── MODULE PROJECTION ← OCMS_DOMAIN_MODEL.md §3.3
```

---

## 6. Document map

| Document | Role |
|----------|------|
| `ADR_OCMS_CASE_TYPE_RESULT_ADDENDUM.md` | ADR binding |
| `OCMS_RESULT_MODEL.md` | Result per type |
| `OCMS_CASE_RESPONSIBILITY_MEMORY_MODEL.md` | CRM pillars |

---

## 7. Lifecycle hints by Case Type

Typical lifecycle emphasis (not enforced in V0):

| Code | Entry | Review gate | WAITING common | Archive typical |
|------|-------|-------------|----------------|-----------------|
| HO_SO | TRIAGE | Yes | Bổ sung giấy tờ | Yes |
| FINANCE | TRIAGE | Yes | Chứng từ | CLOSED |
| INVOICE | ACTIVE | Yes | Đối soát | Yes |
| MEMBERSHIP | TRIAGE | Optional | Liên hệ xã viên | CLOSED |
| COMPLAINT | TRIAGE | Optional | Phản hồi | CLOSED |
| OPERATIONS | ACTIVE (skip TRIAGE) | Rare | Sometimes | CLOSED |
| PROJECT | TRIAGE | Milestones | Dependencies | CLOSED |
| SUPPORT | ACTIVE | Rare | L2 wait | CLOSED |
| COMPLIANCE | TRIAGE | Yes | Audit window | ARCHIVED |
| DOCUMENT | ACTIVE | Yes | Duyệt lãnh đạo | ARCHIVED |

**BLOCKED** may appear on: COMPLAINT, PROJECT, COMPLIANCE, FINANCE (dispute).

**REOPENED:** allowed from CLOSED for HO_SO, COMPLAINT, FINANCE with Decision memory.

Full transitions: `OCMS_CASE_LIFECYCLE_MODEL.md` §5–§6.

This section does not alter §1–§6 above.

---

## 8. Relation hints by Case Type

Compact relation defaults (see `OCMS_CASE_RELATION_MODEL.md` §6–§7):

| Code | PRIMARY | TARGET | SECONDARY | SOURCE | EVIDENCE_REF | BLOCKED_BY |
|------|---------|--------|-----------|--------|--------------|------------|
| HO_SO | HO_SO | XA_VIEN | PHUONG_TIEN, DOCUMENT, DON_VI | — | DOCUMENT | — |
| FINANCE | FINANCE_TRANSACTION | PERSON, DON_VI | HO_SO | — | INVOICE, DOCUMENT | — |
| INVOICE | INVOICE | ORGANIZATION | FINANCE_TRANSACTION | — | DOCUMENT | — |
| MEMBERSHIP | XA_VIEN | XA_VIEN | HO_SO, FINANCE_TRANSACTION | — | DOCUMENT | — |
| COMPLAINT | PERSON/XA_VIEN | — | DOCUMENT | ALERT, TASK | DOCUMENT | PERSON, ORG, TASK |
| OPERATIONS | TASK | — | DOCUMENT, PERSON, DON_VI | — | — | — |
| PROJECT | PROJECT | — | DOCUMENT, DON_VI | — | DOCUMENT | TASK |
| SUPPORT | PERSON/DON_VI | — | DOCUMENT | TASK, ALERT | DOCUMENT | — |
| COMPLIANCE | DOCUMENT/DON_VI | PERSON, DON_VI | — | — | DOCUMENT | — |
| DOCUMENT | DOCUMENT | DON_VI, ORG | PERSON | — | DOCUMENT | — |

This section does not alter §1–§7 above.

---

*Append-only. New types require ADR amend.*
