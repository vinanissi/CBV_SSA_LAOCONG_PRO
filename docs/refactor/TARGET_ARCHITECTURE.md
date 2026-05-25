# Target Architecture — CBV Modular Operational Workspace

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Standard:** CBV Operational Ecosystem Standard V1

---

## 1. Tuyên bố kiến trúc

CBV refactor thành **CBV Modular Operational Workspace**: không gian vận hành cho đội nhỏ, HTX, điều phối hồ sơ / task / tài chính.

CBV **không phải** ERP, admin dashboard tổng hợp, workflow builder, hay SaaS clone.

CBV **là** Operational Workspace: action-first, mobile-first, human-in-loop, incremental.

---

## 2. Sơ đồ mục tiêu

```
CBV Workspace
│
├─ TASK          → Google Sheet + AppSheet API
├─ FINANCE       → Google Sheet + AppSheet API
├─ HO_SO         → Google Sheet + AppSheet API
│
├─ MODULE PLUGIN
│    ├─ TASK plugin
│    ├─ FINANCE plugin
│    └─ HO_SO plugin
│
├─ CLOUDFLARE
│    ├─ Worker
│    │    ├─ API bridge
│    │    ├─ auth
│    │    ├─ sync
│    │    ├─ projection
│    │    └─ plugin runtime
│    └─ FE
│         └─ Operational Workboard
│
└─ TOOLS
     ├─ Cursor
     └─ Codex
```

---

## 3. Phân lớp trách nhiệm

| Lớp | Vai trò | Nguyên tắc |
|-----|---------|------------|
| **Google Sheet** | Operational Database | Nguồn dữ liệu tin cậy; append-only; không thay DB |
| **AppSheet** | Operational Mobile Runtime | Quick CRUD, slice, form; giữ nguyên trong production |
| **Apps Script** | Sheet Automation Runtime | Business rules, trigger, bootstrap, audit; không rewrite sang backend mới lúc này |
| **Cloudflare Worker** | API / Projection / Plugin / Auth Bridge | FE không gọi thẳng Sheet/AppSheet; Worker là cổng duy nhất cho Workboard FE |
| **FE (Workboard)** | Operational Workboard | Mobile-first, action-first; gọi Worker, không bind trực tiếp Sheet |
| **Cursor / Codex** | Development Tools | AI-assisted refactor; human review bắt buộc |

---

## 4. Luồng dữ liệu mục tiêu

```
Operator (mobile)  ──► AppSheet ──► Google Sheet ◄── GAS (automation)
                                              ▲
Operator (workboard) ──► Workboard FE ──► Cloudflare Worker ──► GAS / projection
                                              │
                                              └── auth + permission + DTO projection
```

**Hiện tại (transitional):** WebApp vẫn bind GAS doGet trực tiếp. **Mốc 1** có thể giữ pattern này; Worker bridge là bước incremental sau khi Workboard Core ổn định.

---

## 5. Module plugin model

Mỗi domain nghiệp vụ là một **plugin** với contract thống nhất:

| Plugin | Responsibility | Projection qua Worker |
|--------|----------------|----------------------|
| **TASK** | Queue, assignment, overdue, approval | Task list DTO, detail, timeline events |
| **FINANCE** | Thu/chi, chứng từ, xác nhận | Transaction DTO, missing-doc alerts |
| **HO_SO** | Hồ sơ xã viên, GPLX, CCCD, xe, đăng kiểm | Profile DTO, file refs, expiry warnings |

Plugin **không** sở hữu database riêng — đọc/ghi qua Sheet contract + GAS service hiện có.

Phase RF_01: **chỉ định nghĩa** plugin boundary trong tài liệu; **chưa** implement plugin runtime.

---

## 6. Chức năng bắt buộc (cross-cutting)

| # | Capability | Owner (target) |
|---|------------|----------------|
| 1 | Permission Runtime | Worker auth + GAS assert + AppSheet filter (đồng bộ role) |
| 2 | Operational Search | Worker projection (simple query; không search engine riêng ở giai đoạn đầu) |
| 3 | Timeline Runtime | Append-only audit; GAS write; Worker read projection |
| 4 | Notification Center | Worker + GAS HOME_ALERT; FE notification panel |
| 5 | File Runtime | HO_SO_FILE + TASK attachments; Drive link; preview qua Worker |
| 6 | Smart Filter | FE filter UI; Worker query params; không auto-routing |
| 7 | Assignment Runtime | GAS assignment service; FE action; manager workload view |
| 8 | Quick Actions | FE shortcuts; permission-gated |

---

## 7. Nguyên tắc bất biến

### PHẢI

- Append-only artifacts (report, handoff, audit)
- Production-safe, human-in-loop, manual-first
- Incremental refactor — small milestone, deploy được, dùng thật được
- Test/report/handoff mỗi mốc (CBV_TCS_V1)
- Không fake DONE

### KHÔNG

- Rewrite toàn hệ
- Thay DB (Sheet vẫn là operational database)
- Bỏ AppSheet
- Microservice hóa quá mức
- Auto-migration destructive
- Đổi schema production không có quyết định migration có chủ đích
- AI auto-decision cho nghiệp vụ vận hành
- Thêm NocoDB / Plane / Outline ở phase RF_01

---

## 8. Quan hệ với kiến trúc hiện tại

| Hiện tại | Target | Cách chuyển |
|----------|--------|-------------|
| GAS WebApp renderer | Workboard FE + Worker | Bóc projection API từ GAS; FE gọi Worker dần dần |
| AppSheet slices | AppSheet + role sync | Map role mới → AppSheet USERSETTINGS |
| ADMIN/OPERATOR/VIEWER | 6 roles mở rộng | Migration role mapping có doc; không đổi enum production đột ngột |
| Module services rời | Plugin contract | Wrap service hiện có; không rewrite logic |

---

## 9. Phase RF_01 scope

**Documentation-first baseline only.**

Tạo `docs/refactor/*` để định hướng kiến trúc, module, quyền, search, UI, roadmap, rủi ro.

**Chưa** thực hiện code runtime lớn, **chưa** deploy Worker, **chưa** thay WebApp binding.
