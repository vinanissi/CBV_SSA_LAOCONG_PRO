# Current Architecture — CBV Operational Runtime (Baseline)

**Phase:** PHASE_RF_01_MODULAR_OPERATIONAL_WORKSPACE_BASELINE  
**Branch:** `phase/from-v2.4.1-TASK-FIN-runtime-freeze`  
**Repo baseline:** LAOCONG_PRO_V2.4.1  
**Standard:** CBV Operational Ecosystem Standard V1

---

## 1. Tổng quan

CBV hiện tại là hệ vận hành nhỏ gọn cho HTX / đội điều phối hồ sơ, task và tài chính. Kiến trúc **runtime-first**: Google Sheet là nguồn dữ liệu tin cậy; Google Apps Script (GAS) là runtime nghiệp vụ; AppSheet và WebApp là hai lớp giao diện vận hành.

```
┌─────────────────────────────────────────────────────────────┐
│                    OPERATOR SURFACES                         │
│  AppSheet (mobile/quick CRUD)  │  WebApp (workspace FE)      │
└───────────────┬─────────────────┴──────────────┬──────────────┘
                │                                │
                ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Apps Script (05_GAS_RUNTIME/)            │
│  Task · HO_SO · Finance · Audit · WebApp renderer · Test   │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│           Google Sheets (Operational Database)               │
│  TASK_MAIN · HO_SO_* · FINANCE_* · USER_DIRECTORY · ENUM …  │
└─────────────────────────────────────────────────────────────┘
```

Tham chiếu kiến trúc đã chốt: `docs/architecture/SHEETS_GAS_OPERATIONAL_DATABASE_RUNTIME.md`, `docs/architecture/WEBAPP_LED_OPERATIONAL_WORKSPACE.md`.

---

## 2. Vai trò từng lớp

### 2.1 Google Sheet — Operational Database

| Vai trò | Chi tiết |
|---------|----------|
| **Nguồn dữ liệu chính** | Bảng nghiệp vụ: `TASK_MAIN`, `HO_SO_MASTER`, `HO_SO_FILE`, `HO_SO_RELATION`, bảng FINANCE, `USER_DIRECTORY`, `ENUM_DICTIONARY`, `MASTER_CODE`, audit tables |
| **Schema contract** | Manifest trong `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js`; audit schema trong `90_BOOTSTRAP_AUDIT_SCHEMA.js` |
| **Nguyên tắc ghi** | Append-only ưu tiên; không destructive migration trong runtime-freeze branch |
| **Visibility (TASK)** | `SHARED_WITH`, `IS_PRIVATE` trên `TASK_MAIN` (prod baseline v2.2.4+) — xem `45_SHARED_WITH_SERVICE.js` |

Sheet **không** bị thay thế trong refactor này.

### 2.2 AppSheet — Operational Mobile Runtime

| Vai trò | Chi tiết |
|---------|----------|
| **Mobile / quick ops** | CRUD nhanh, slice theo vai trò, form ref, offline-friendly |
| **Security** | Row-level filter qua `USEREMAIL()`, `USERSETTINGS("Role")` — xem `docs/appsheet/APPSHEET_SECURITY_FILTER_MATRIX.md` |
| **Phân vai với WebApp** | AppSheet = lightweight operator shell; WebApp = workspace nâng cao — xem `docs/ui-contract/APPSHEET_WEBAPP_ROLE_SPLIT.md` |
| **Binding** | Ref map, slice map, security filters trong `04_APPSHEET/` |

AppSheet **đang dùng thật** và **không bỏ**.

### 2.3 Apps Script — Sheet Automation Runtime

| Vai trò | Chi tiết |
|---------|----------|
| **Business services** | `20_TASK_SERVICE.js`, `10_HOSO_SERVICE.js`, finance services, assignment, SLA, HOME_ALERT |
| **WebApp API + renderer** | `91_*`–`96_*`, `94_WEBAPP_WORKSPACE_RENDERER.js`, staff workboard (`998Y_*`) |
| **Bootstrap / schema** | `90_BOOTSTRAP_*`, menu, test console |
| **Audit & governance** | `ADMIN_AUDIT_LOG`, `45_SHARED_WITH_SERVICE.js`, role helpers trong `USER_ROLE_PERMISSION_SPEC.md` |
| **Test standard** | `CBV_TCS_V1` — contracts và runner trong `00_SYSTEM_BRAIN/000_TEST_CONSOLE/` |

GAS tiếp tục là runtime chính; **không rewrite sang backend mới** ở phase này.

### 2.4 WebApp (GAS-served) — Operational Workboard (đang hình thành)

| Vai trò | Chi tiết |
|---------|----------|
| **Workspace chính (hướng mới)** | Home, workboard, timeline, kanban, SLA, health, reports |
| **Route registry** | `92_WEBAPP_WORKSPACE_ROUTES.js`, dispatcher `96_*` / `999_*` |
| **Trạng thái** | Milestone 06 staff workboard MVP đã có code local; pilot/UAT đang tiến hành |
| **FE pattern** | HTML template + GAS render; read-first, manual-first |

**Chưa có** Cloudflare Worker hay FE SPA độc lập trong repo hiện tại — đó là hướng target, không phải hiện trạng.

---

## 3. Module nghiệp vụ hiện tại

| Module | Sheet chính | GAS service | AppSheet | WebApp |
|--------|-------------|-------------|----------|--------|
| **TASK** | `TASK_MAIN`, attachments | `20_TASK_SERVICE.js`, `45_SHARED_WITH_SERVICE.js` | Slices TASK_MY_*, forms | Workboard, timeline, kanban |
| **FINANCE** | Finance tables | Finance service map | Forms/slices (pilot) | Summary/read views (hạn chế) |
| **HO_SO** | `HO_SO_MASTER`, `HO_SO_FILE`, `HO_SO_RELATION` | `10_HOSO_SERVICE.js` | Ref views, file upload | Chưa đầy đủ workboard |
| **Shared** | `USER_DIRECTORY`, `ENUM_DICTIONARY` | User validation, enum admin | Account/role binding | Admin reference viewer |

Chi tiết liên kết module: `03_SHARED/MODULE_MAP_MASTER.md`, `02_MODULES/*/SHEET_DICTIONARY.md`.

---

## 4. Điểm mạnh hiện tại

1. **Production-safe baseline** — schema TASK_MAIN có SHARED_WITH/IS_PRIVATE; audit append-only.
2. **Dual-channel ops** — AppSheet cho mobile; WebApp cho visualization và test console.
3. **Runtime-first** — FE không tự giữ state nghiệp vụ; đọc qua GAS contracts.
4. **Test harness** — CBV_TCS_V1 với milestone test consoles và Drive bundle export.
5. **Documentation depth** — AppSheet binding, UI contract, webapp route freeze, governance standards.
6. **Incremental delivery** — milestone 01–07 đã chứng minh pattern deploy nhỏ, verify, handoff.

---

## 5. Điểm yếu / rủi ro hiện tại

| # | Vấn đề | Mô tả |
|---|--------|-------|
| 1 | **Role model hẹp** | Hiện tại ADMIN / OPERATOR / VIEWER; chưa có MANAGER, FINANCE, HO_SO, VIEW_ONLY riêng |
| 2 | **Permission phân tán** | AppSheet filter, GAS assert, WebApp UI ẩn action — chưa có lớp API gateway thống nhất |
| 3 | **Search chưa thống nhất** | Tìm kiếm rải rác theo module; chưa có operational search cross-module |
| 4 | **FE gọi GAS trực tiếp** | WebApp bind GAS doGet; chưa có Worker bridge — khó scale auth/projection |
| 5 | **Schema drift risk** | Sheet manifest, AppSheet ref, UI contract có thể lệch nếu sửa thủ công |
| 6 | **Cloudflare chưa có** | Target architecture cần Worker; hiện chưa implement |
| 7 | **FINANCE / HO_SO WebApp** | WebApp mạnh ở TASK; FINANCE và HO_SO còn mỏng trên workboard |

---

## 6. Tài sản đang chạy thật — GIỮ NGUYÊN

| Tài sản | Lý do giữ |
|---------|-----------|
| Google Sheet schema production | Dữ liệu vận hành thật; không đổi schema ở phase RF_01 |
| AppSheet app pilot/production | Nhân sự đang dùng hằng ngày |
| GAS deployed (`clasp push`) | Trigger, workflow, bootstrap đang bind Sheet |
| TASK visibility (SHARED_WITH, IS_PRIVATE) | Prod baseline v2.2.4+ |
| Append-only reports/handoffs | Memory-first; không ghi đè artifact cũ |
| CBV_TCS_V1 test consoles | Gate chất lượng cho mọi milestone |
| WebApp routes đã freeze | `docs/webapp/WEBAPP_ROUTE_FREEZE_MATRIX.md` |

---

## 7. Ranh giới phase RF_01

Phase này **chỉ tài liệu**. Không thay runtime, không đổi schema, không thêm Worker code. Mục tiêu: mô tả hiện trạng chính xác để refactor incremental an toàn.
