# Module Mapping — Current → Target Plugin

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`

---

## 1. Tổng quan mapping

| Domain | Hiện tại (runtime-freeze) | Target plugin | Phase RF_01 |
|--------|---------------------------|---------------|-------------|
| TASK | `02_MODULES/TASK_CENTER/` + GAS `20_*` | TASK plugin | Doc only |
| FINANCE | `02_MODULES/FINANCE/` + finance GAS | FINANCE plugin | Doc only |
| HO_SO | `02_MODULES/HO_SO/` + GAS `10_*` | HO_SO plugin | Doc only |

---

## 2. TASK — mapping chi tiết

### 2.1 Google Sheet

| Sheet / artifact | Vai trò |
|------------------|---------|
| `TASK_MAIN` | Bản ghi task chính (STATUS, PRIORITY, OWNER_ID, RELATED_ENTITY_*) |
| `TASK_ATTACHMENT` (nếu có) | File đính kèm task |
| Columns prod | `SHARED_WITH`, `IS_PRIVATE` — visibility baseline |

Schema ref: `06_DATABASE/TASK_MODULE_SCHEMA_NORMALIZED.md`, `02_MODULES/TASK_CENTER/SHEET_DICTIONARY.md`.

### 2.2 AppSheet

| Surface | Mục đích |
|---------|----------|
| Slices `TASK_MY_*`, `TASK_MY_OPEN`, `TASK_MY_TASKS` | Việc của tôi, queue |
| Security filter | `ANY(SELECT(...))`, `CONTAINS([SHARED_WITH], ...)` — prod spec |
| Forms / detail | Claim, assign, resolve, upload |
| AppSheet bridge (WebApp) | Deep link qua Script Properties — `998Y_*` |

Ref: `04_APPSHEET/APPSHEET_SLICE_MAP.md`, `APPSHEET_SECURITY_FILTERS.md`.

### 2.3 GAS runtime

| Service | Chức năng |
|---------|-----------|
| `20_TASK_SERVICE.js` | CRUD, assign, status transition |
| `45_SHARED_WITH_SERVICE.js` | share/unshare, set private, `canUserSeeTask` |
| Assignment / SLA / HOME_ALERT | Queue, overdue, attention |

### 2.4 Worker projection (target — chưa build)

| Endpoint (concept) | DTO |
|--------------------|-----|
| `GET /task/queue` | Grouped task cards (my, pending, overdue, approval) |
| `GET /task/:id` | Task detail + related entity |
| `GET /task/:id/timeline` | Append-only events |
| `POST /task/:id/action` | Permission-gated quick action |

### 2.5 FE Workboard (target)

| Màn hình | Nội dung |
|----------|----------|
| Công việc | Việc của tôi, chờ xử lý, quá hạn, chờ duyệt |
| Task detail | Timeline, actions, file |
| Quick actions | Tạo task, giao việc, gửi duyệt |

**Hiện có:** Staff workboard MVP (`998Y_*`), timeline/kanban pages (pilot).

---

## 3. FINANCE — mapping chi tiết

### 3.1 Google Sheet

Bảng giao dịch tài chính (draft, confirmed, archived), evidence links — xem `02_MODULES/FINANCE/SERVICE_MAP.md`.

### 3.2 AppSheet

Forms/slices cho tạo draft, attach evidence, xác nhận (pilot binding).

### 3.3 GAS runtime

| Function (concept) | Mô tả |
|--------------------|-------|
| `createTransaction` | Tạo giao dịch draft |
| `confirmTransaction` | Xác nhận thu/chi (audit CONFIRMED_BY) |
| `searchTransactions` | Filter theo hồ sơ/đơn vị |
| `getFinanceSummary` | Tổng hợp read-only |

### 3.4 Worker projection (target — chưa build)

| Endpoint (concept) | DTO |
|--------------------|-----|
| `GET /finance/receivable` | Khoản cần thu |
| `GET /finance/payable` | Khoản cần chi |
| `GET /finance/missing-docs` | Chứng từ thiếu |
| `POST /finance/:id/confirm` | Xác nhận thanh toán |

### 3.5 FE Workboard (target)

| Màn hình | Nội dung |
|----------|----------|
| Tài chính | Queue thu/chi, thiếu chứng từ |
| Quick actions | Xác nhận thu chi, upload chứng từ |

**Hiện có:** Service map + GAS; WebApp finance workboard **mỏng** — chưa MVP production.

---

## 4. HO_SO — mapping chi tiết

### 4.1 Google Sheet

| Sheet | Nội dung |
|-------|----------|
| `HO_SO_MASTER` | Hồ sơ xã viên, xe, tài xế, HTX |
| `HO_SO_FILE` | CCCD, GPLX, đăng ký xe, hợp đồng |
| `HO_SO_RELATION` | Liên kết đa hình |

Ref: `02_MODULES/HO_SO/SHEET_DICTIONARY.md`.

Trường search-relevant: `ID_NO` (CCCD/GPLX/biển số), `MANAGER_USER_ID`, `STATUS`.

### 4.2 AppSheet

Ref views, file upload inline, hồ sơ detail — `04_APPSHEET/` attachment docs.

### 4.3 GAS runtime

| Service | Chức năng |
|---------|-----------|
| `10_HOSO_SERVICE.js` | createHoSo, file attach, relation |
| User validation | `assertValidUserId(OWNER_ID)` |

### 4.4 Worker projection (target — chưa build)

| Endpoint (concept) | DTO |
|--------------------|-----|
| `GET /hoso/search` | By tên, SĐT, biển số, mã hồ sơ |
| `GET /hoso/:id` | Profile + files + relations |
| `GET /hoso/:id/expiry` | GPLX/đăng kiểm sắp hết hạn |

### 4.5 FE Workboard (target)

| Màn hình | Nội dung |
|----------|----------|
| Hồ sơ | Danh sách, filter loại hồ sơ |
| Detail | File preview, timeline, related tasks/finance |
| Quick actions | Tạo hồ sơ, upload giấy tờ |

**Hiện có:** GAS + AppSheet; HO_SO workboard FE **chưa** đầy đủ.

---

## 5. Ma trận: Sheet / AppSheet / Worker / FE

| Module | Google Sheet | AppSheet | Worker projection | FE Workboard | RF_01 status |
|--------|:------------:|:--------:|:-----------------:|:------------:|:--------------:|
| TASK | ✓ prod | ✓ prod/pilot | Planned | Partial (workboard MVP) | Doc |
| FINANCE | ✓ prod | Pilot | Planned | Minimal | Doc |
| HO_SO | ✓ prod | ✓ prod | Planned | Minimal | Doc |
| FILE (cross) | HO_SO_FILE, attachments | Upload views | Planned | Planned | Doc |
| NOTIFICATION | HOME_ALERT tables | Alerts | Planned | Partial | Doc |
| SEARCH | — | Per-table | Planned | Planned | Doc |
| REPORT | Append-only repo | — | Read via GAS | Report viewer exists | Keep |

---

## 6. Shared dependencies (không map thành plugin riêng)

| Shared | Vai trò |
|--------|---------|
| `USER_DIRECTORY` | Identity, role display, assignment ref |
| `ENUM_DICTIONARY` | Locked enums |
| `MASTER_CODE` | Dynamic business codes |
| `ADMIN_AUDIT_LOG` | Admin mutations |
| Timeline / audit tables | Append-only history |

---

## 7. Module chưa làm ở phase RF_01

| Item | Lý do |
|------|-------|
| Cloudflare Worker code | Out of scope — doc only |
| Plugin runtime loader | Mốc 4 |
| OCR / Invoice / Zalo / CRM / AI plugins | Mốc 4 |
| NocoDB observation layer | Mốc 3 |
| Unified search engine | Mốc 1–2 projection đơn giản trước |
| Role enum migration trên Sheet | Cần phase riêng có migration plan |
