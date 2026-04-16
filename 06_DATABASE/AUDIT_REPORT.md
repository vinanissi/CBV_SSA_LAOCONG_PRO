# DB AUDIT REPORT — CBV_SSA_LAOCONG_PRO

**Generated:** 2026-04-16  
**Scope:** Database layer — `schema_manifest.json`, `02_MODULES/HO_SO/DATA_MODEL.md`, GAS runtime (`05_GAS_RUNTIME/*.js`), AppSheet/CONFIG docs, reference READMEs.  
**Method:** Read-only inventory; no repository files were modified except this report.

**Sources read (representative):**

| Source | Status |
|--------|--------|
| `06_DATABASE/schema_manifest.json` | Read |
| `02_MODULES/HO_SO/DATA_MODEL.md` | Read |
| `02_SEED/seed_master_code.tsv` | Read (MASTER_CODE seed) |
| `06_DATABASE/schema_column_notes.json` | Read |
| `05_GAS_RUNTIME/00_CORE_CONFIG.js` | Read (`CBV_CONFIG.SHEETS`) |
| `05_GAS_RUNTIME/90_BOOTSTRAP_SCHEMA.js` | Read (`CBV_SCHEMA_MANIFEST` excerpt) |
| `05_GAS_RUNTIME/20_TASK_SERVICE.js`, `10_HOSO_SERVICE.js`, `30_FINANCE_SERVICE.js`, `60_HOSO_API_GATEWAY.js` | Sampled |
| `README.md`, `CBV_LAOCONG_PRO_REFERENCE.md` | Read (partial) |
| `04_APPSHEET/*` (APPSHEET / CONFIG named docs) | Glob: **133** paths matching `*APPSHEET*`; full text of each file not individually loaded — treat as **documented inventory**, not line-by-line proof |
| `scripts/*.js` | **File not found:** no `.js` under `scripts/` (only `.ps1`, `.md`, `.json` present) |
| `**/*.gs` | **File not found** in repo (GAS uses `.js` + `fileExtension: "js"` in `.clasp.json`) |

**GAS inventory:** `05_GAS_RUNTIME` contains **84** `*.js` files; pattern-based count of `function name(` declarations ≈ **614** (PowerShell `Select-String`). Section 5 does **not** list every function line-by-line; it summarizes write paths and risks.

---

### 1. Danh sách bảng (Table inventory)

Nguồn chính: `06_DATABASE/schema_manifest.json` (các key có giá trị là mảng tên cột). Không tính key meta `_COLUMN_NOTES`.

| Tên bảng | Nguồn tìm thấy | Số cột | Có PK? | Có IS_DELETED? | Ghi chú |
|-----------|----------------|--------|--------|----------------|---------|
| USER_DIRECTORY | schema_manifest | 17 | ID | Có | Audit đủ CREATED/UPDATED |
| ADMIN_AUDIT_LOG | schema_manifest | 10 | ID | Không | Chỉ CREATED_AT; không UPDATED_* |
| MASTER_CODE | schema_manifest | 15 | ID | Có | |
| DON_VI | schema_manifest | 19 | ID | Có | |
| TASK_MAIN | schema_manifest | 22 | ID | Có | **CONFLICT:** thiếu `SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION` so với `90_BOOTSTRAP_SCHEMA.js` và rule TASK_MAIN PRO (xem mục 2) |
| TASK_CHECKLIST | schema_manifest | 14 | ID | Có | |
| TASK_UPDATE_LOG | schema_manifest | 10 | ID | Có | Có ACTION (manifest) |
| TASK_ATTACHMENT | schema_manifest | 12 | ID | Có | **CONFLICT:** GAS `CBV_SCHEMA_MANIFEST.TASK_ATTACHMENT` có thêm SOURCE_MODE, UPLOAD_FILE, FILE_EXT, LINK_DOMAIN, SORT_ORDER, STATUS — không khớp manifest |
| FINANCE_TRANSACTION | schema_manifest | 22 | ID | Có | **CONFLICT:** GAS có `IS_STARRED`, `IS_PINNED` trên FINANCE_TRANSACTION; manifest không có |
| HO_SO_MASTER | schema_manifest | 36 | ID | Có | Khớp hướng DATA_MODEL |
| HO_SO_FILE | schema_manifest | 15 | ID | Không | Immutable file row per DATA_MODEL; không UPDATED_* |
| HO_SO_RELATION | schema_manifest | 15 | ID | Có | |
| HO_SO_UPDATE_LOG | schema_manifest | 15 | ID | Có | |
| HO_SO_DETAIL_PHUONG_TIEN | schema_manifest | 13 | ID | Có | |
| ENUM_DICTIONARY | CBV_CONFIG.SHEETS only | — | — | — | **Không có** trong `schema_manifest.json`; vẫn là runtime sheet |
| FINANCE_LOG | CBV_CONFIG + `90_BOOTSTRAP_SCHEMA.js` | 8 (GAS) | ID | Không | **Không có** trong `schema_manifest.json` |
| FINANCE_ATTACHMENT | CBV_CONFIG + `90_BOOTSTRAP_SCHEMA.js` | — | — | — | **Không có** trong `schema_manifest.json` |
| DOC_REQUIREMENT | `90_BOOTSTRAP_SCHEMA.js` + CBV_CONFIG | — | — | — | **Không có** trong `schema_manifest.json` |
| SYSTEM_HEALTH_LOG | CBV_CONFIG + headers trong `90_BOOTSTRAP_SCHEMA.js` | — | RUN_ID? | — | Meta/health; không trong manifest |

---

### 2. Kiểm tra schema integrity

Đối với mỗi bảng trong `schema_manifest.json`:

#### USER_DIRECTORY
- [x] PK: `ID` — text/ID convention (không enforce UUID trong manifest).
- [x] IS_DELETED.
- [x] CREATED_AT / UPDATED_AT (cả hai).
- FK: `MANAGER_USER_ID` không có trong bảng này — N/A.
- **OK** (theo manifest).

#### ADMIN_AUDIT_LOG
- [x] PK `ID`.
- [ ] IS_DELETED — không có (log append-only — chấp nhận được).
- [ ] UPDATED_AT — không có.
- FK: `ACTOR_ID` → USER_DIRECTORY (suy luận tên).
- **OK** với giả định bảng log không soft-delete.

#### MASTER_CODE
- [x] PK, IS_DELETED, audit columns.
- **OK**.

#### DON_VI
- [x] PK, IS_DELETED, audit.
- FK: `PARENT_ID` → DON_VI; `MANAGER_USER_ID` → USER_DIRECTORY.
- **OK** (theo tên cột).

#### TASK_MAIN
- [x] PK, IS_DELETED.
- [ ] **CONFLICT:** `schema_manifest.json` **không** chứa `SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION` nhưng `90_BOOTSTRAP_SCHEMA.js` có — **thiếu đồng bộ tài liệu machine-readable / nguy cơ CSV export sai header**.
- [ ] `createTask` trong `20_TASK_SERVICE.js` (đã đọc) **không** gán `SHARED_WITH` / `IS_PRIVATE` / `PENDING_ACTION` vào record — có thể để trống cột hoặc lệch với rule PRO.
- **Vấn đề:** CONFLICT manifest ↔ bootstrap; drift chức năng TASK PRO.

#### TASK_CHECKLIST, TASK_UPDATE_LOG
- [x] PK, IS_DELETED (checklist); log có IS_DELETED.
- **OK** tại mức manifest.

#### TASK_ATTACHMENT
- [ ] **CONFLICT:** manifest 11 cột vs GAS schema mở rộng (nhiều cột file/link). Nguy cơ import CSV / generator lệch production sheet.

#### FINANCE_TRANSACTION
- [x] PK, IS_DELETED, audit.
- [ ] **CONFLICT:** GAS thêm `IS_STARRED`, `IS_PINNED`; manifest không có.

#### HO_SO_MASTER
- [x] PK, IS_DELETED, audit.
- FK phức tạp: `HTX_ID` conditional (DATA_MODEL) — không thể suy từ manifest đơn thuần.
- **OK** nếu chỉ xét tồn tại cột; rule nghiệp vụ nằm ở DATA_MODEL.

#### HO_SO_FILE
- [x] PK; không IS_DELETED (DATA_MODEL: dùng STATUS).
- [ ] Không có UPDATED_AT — **by design** (DATA_MODEL: immutable).
- [x] `LINKED_RELATION_ID` optional — document trong DATA_MODEL §3.1.
- **OK** theo DATA_MODEL; không mâu thuẫn manifest.

#### HO_SO_RELATION
- [x] PK, IS_DELETED, audit đủ.
- **OK**.

#### HO_SO_UPDATE_LOG
- [x] PK, IS_DELETED, audit.
- **OK**.

#### HO_SO_DETAIL_PHUONG_TIEN
- [x] PK, IS_DELETED, audit.
- **OK**.

**Cột NULL không document:** Google Sheets không có NOT NULL schema; repo mô tả optional/rule trong DATA_MODEL / GAS — không liệt kê hết tại đây (rủi ro **Info**: người mới chỉ nhìn manifest sẽ không thấy rule `HTX_ID`).

---

### 3. Kiểm tra FK consistency

Cột `*_ID` và biến thể (trừ `DRIVE_FILE_ID` = không phải FK bảng). Suy luận bảng đích từ quy ước tên + tài liệu.

| Cột | Bảng chứa | Bảng đích suy luận | Có trong schema_manifest? | Trạng thái |
|-----|-----------|-------------------|----------------------------|------------|
| HO_SO_TYPE_ID | HO_SO_MASTER | MASTER_CODE | Có | OK |
| DON_VI_ID | HO_SO_MASTER, TASK_MAIN, FINANCE_TRANSACTION | DON_VI | Có | OK |
| OWNER_ID | HO_SO_MASTER, TASK_MAIN | USER_DIRECTORY | Có | OK |
| HTX_ID | HO_SO_MASTER, HO_SO_DETAIL_PHUONG_TIEN | HO_SO_MASTER (self) | Có | OK (self-ref) |
| MANAGER_USER_ID | HO_SO_MASTER, DON_VI | USER_DIRECTORY | Có | OK |
| RELATED_ENTITY_ID | HO_SO_MASTER, TASK_MAIN, FINANCE_TRANSACTION | **AMBIGUOUS** (polymorphic) | Có | AMBIGUOUS |
| TASK_TYPE_ID | TASK_MAIN | MASTER_CODE (TASK_TYPE) | Có | OK |
| REPORTER_ID | TASK_MAIN | USER_DIRECTORY | Có | OK |
| TASK_ID | TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT | TASK_MAIN | Có | OK |
| DONE_BY | TASK_CHECKLIST | USER_DIRECTORY | Có | OK |
| ACTOR_ID | TASK_UPDATE_LOG, HO_SO_UPDATE_LOG, FINANCE (CONFIRMED_BY) | USER_DIRECTORY | Có | OK / CONFIRMED_BY OK |
| FIN_ID | FINANCE_LOG (GAS only) | FINANCE_TRANSACTION | **UNDOCUMENTED** trong manifest | MISSING_TARGET (manifest) |
| HO_SO_ID | HO_SO_FILE, HO_SO_UPDATE_LOG, HO_SO_DETAIL_PHUONG_TIEN | HO_SO_MASTER | Có | OK |
| LINKED_RELATION_ID | HO_SO_FILE | HO_SO_RELATION | Có | OK |
| FROM_HO_SO_ID / TO_HO_SO_ID | HO_SO_RELATION | HO_SO_MASTER | Có | OK |
| RELATED_RECORD_ID | HO_SO_RELATION | **AMBIGUOUS** (RELATED_TABLE) | Có | AMBIGUOUS |
| VEHICLE_TYPE_ID | HO_SO_DETAIL_PHUONG_TIEN | MASTER_CODE | Có | OK |
| PARENT_ID | DON_VI | DON_VI | Có | OK |
| ENTITY_ID | ADMIN_AUDIT_LOG | **AMBIGUOUS** | Có | AMBIGUOUS |

---

### 4. Kiểm tra MASTER_CODE coverage

Cột có pattern enum / ref MASTER_CODE (từ manifest + DATA_MODEL + `_COLUMN_NOTES`). Seed tham chiếu: `02_SEED/seed_master_code.tsv` (các `MASTER_GROUP` ví dụ: ENTITY_TYPE, TASK_TYPE, HO_SO_TYPE, FINANCE_CATEGORY, CHANNEL, PAYMENT_METHOD, DOCUMENT_SOURCE).

| Cột | Bả | MASTER_GROUP tương ứng (hoặc ENUM_DICTIONARY) | Có trong MASTER_CODE seed? |
|-----|-----|-----------------------------------------------|----------------------------|
| HO_SO_TYPE_ID | HO_SO_MASTER | HO_SO_TYPE | Có (ví dụ HTX, XE, …) |
| RELATED_ENTITY_TYPE | HO_SO_MASTER, TASK_MAIN, FINANCE_TRANSACTION | ENTITY_TYPE | Có (HO_SO, TASK, DON_VI) |
| TASK_TYPE_ID | TASK_MAIN | TASK_TYPE | Có |
| VEHICLE_TYPE_ID | HO_SO_DETAIL_PHUONG_TIEN | (MASTER_CODE generic; group có thể VEHICLE_TYPE — **không thấy trong seed đoạn đã đọc**) | **Không chắc / cần mở rộng seed** |
| DON_VI_TYPE | DON_VI | DON_VI_TYPE | **Không** trong đoạn seed đã đọc — có thể sheet khác / ENUM |
| STATUS (nhiều bảng) | — | HO_SO_STATUS, TASK_STATUS, … | Thường qua **ENUM_DICTIONARY**, không phải tất cả qua MASTER_CODE |
| TRANS_TYPE, CATEGORY, PAYMENT_METHOD | FINANCE_TRANSACTION | FINANCE_TYPE / FIN_CATEGORY / PAYMENT_METHOD | Một phần trong seed (FINANCE_CATEGORY, PAYMENT_METHOD); **TRANS_TYPE** cần khớp ENUM layer |
| FILE_GROUP | HO_SO_FILE | FILE_GROUP | ENUM_DICTIONARY / seed hỗn hợp per docs |

**Kết luận:** ENTITY_TYPE và TASK_TYPE có seed rõ; nhiều enum vẫn dựa **ENUM_DICTIONARY** — không phải cột nào cũng map 1-1 MASTER_CODE seed.

---

### 5. Kiểm tra GAS layer

**Quy ước báo cáo:** ~614 hàm trong 84 file — bảng dưới đây là **các nhóm write / side-effect chính**, không phải toàn bộ 614 hàm.

**Validation:** `ensureRequired`, `assertValidEnumValue`, `cbvAssert`, `assertActiveUserId`, `assertValidRelatedEntityType`, v.v.  
**HO_SO_UPDATE_LOG:** chỉ luồng HO_SO gọi `hosoAppendLogEntry` / tương đương — task dùng `TASK_UPDATE_LOG`.

| Hàm (đại diện) | File | Bảng tác động | Có validation trước write? | Có log vào HO_SO_UPDATE_LOG? |
|----------------|------|---------------|----------------------------|--------------------------------|
| `_appendRecord` | `03_SHARED_REPOSITORY.js` | Bất kỳ (generic) | Không (hàm thấp) | Không |
| `_updateRow` | `03_SHARED_REPOSITORY.js` | Bất kỳ | Không | Không |
| `createTask` | `20_TASK_SERVICE.js` | TASK_MAIN, TASK_UPDATE_LOG | Có (required, enum, ref checks) | **Không** — dùng TASK_UPDATE_LOG |
| `updateTask` / `setTaskStatus` / … | `20_TASK_SERVICE.js` | TASK_MAIN, TASK_UPDATE_LOG | Có | **Không** |
| `createHoSo` / `updateHoso` | `10_HOSO_SERVICE.js` | HO_SO_MASTER, HO_SO_UPDATE_LOG | Có | **Có** (khi có log) |
| `addHosoFile` / `attachHoSoFile` | `10_HOSO_SERVICE.js` | HO_SO_FILE, HO_SO_UPDATE_LOG | Có (enum FILE_GROUP, …) | **Có** |
| `addHosoRelation` | `10_HOSO_SERVICE.js` | HO_SO_RELATION, HO_SO_UPDATE_LOG | Có | **Có** |
| `createTransaction` / `updateDraftTransaction` | `30_FINANCE_SERVICE.js` | FINANCE_TRANSACTION, (FINANCE_LOG) | Có enum | **Không** |
| `_api_*` | `60_HOSO_API_GATEWAY.js` | Ủy quyền service | try/catch nhiều nơi; validation qua service | Phụ thuộc action |

**Hàm write thiếu validation / audit (tiêu biểu):**

- Primitives `_appendRecord` / `_updateRow`: **không** validation — by design; rủi ro nếu gọi trực tiếp.
- `createTask`: record thiếu field bootstrap (`SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION`) — **Warning** (cột có thể trống nhưng lệch chuẩn PRO).

**Error handling:** Gateway `_api_*` thường `try/catch`; không phải mọi hàm service đều bọc try/catch (lỗi nổi lên caller).

---

### 6. Phát hiện rủi ro (Risk findings)

| ID | Mức | Mô tả ngắn | Bảng / file | Gợi ý sửa (1 dòng) |
|----|-----|------------|-------------|---------------------|
| RISK-001 | 🔴 Critical | `schema_manifest.json` lệch `90_BOOTSTRAP_SCHEMA.js` (TASK_MAIN cột PRO, TASK_ATTACHMENT, FINANCE_TRANSACTION, HO_SO_FILE thứ tự/cột). | `06_DATABASE/schema_manifest.json`, `90_BOOTSTRAP_SCHEMA.js` | Regenerate manifest + CSV từ một nguồn hoặc đồng bộ hai file tự động trong CI. |
| RISK-002 | 🔴 Critical | `schema_manifest.json` thiếu toàn bộ sheet: ENUM_DICTIONARY, FINANCE_LOG, FINANCE_ATTACHMENT, DOC_REQUIREMENT — nhưng `CBV_CONFIG` và GAS vẫn dùng. | `00_CORE_CONFIG.js`, manifest | Thêm vào manifest hoặc ghi rõ “non-schema tables” trong một manifest phụ. |
| RISK-003 | 🟡 Warning | `createTask` không populate các cột TASK PRO trong schema GAS (`SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION`). | `20_TASK_SERVICE.js`, TASK_MAIN | Set default rõ ràng hoặc đọc từ payload sau khi manifest thống nhất. |
| RISK-004 | 🟡 Warning | FK polymorphic (`RELATED_ENTITY_ID`, `RELATED_RECORD_ID`, `ENTITY_ID`) không kiểm tra tồn tại bản ghi đích tại DB layer. | Nhiều | Giữ validation ở GAS (`assertValidRelatedEntityType`, v.v.) và document. |
| RISK-005 | 🟢 Info | DATA_MODEL chỉ chi tiết HO_SO; TASK/FINANCE không có cùng file — dễ hiểu nhầm manifest là đủ. | `02_MODULES/HO_SO/DATA_MODEL.md` | Thêm DATA_MODEL hoặc link TASK/FINANCE canonical. |
| RISK-006 | 🟢 Info | 133+ file AppSheet — khó audit thủ công; có thể lệch với schema bất cứ lúc nào. | `04_APPSHEET/*` | Periodic `verifyAppSheetReadiness()` / checklist trong README. |

---

### 7. Summary scorecard

| Hạng mục | Tổng | Đạt | Không đạt | Tỉ lệ |
|----------|------|-----|-----------|-------|
| Bảng có đủ audit fields (CREATED/UPDATED + IS_DELETED nơi cần) | 14 bảng trong manifest | ~11 | ~3 (ADMIN_AUDIT_LOG, HO_SO_FILE by design; + bảng ngoài manifest không đánh giá) | ~79% * |
| FK có document đầy đủ | ~18 cột *_ID chính | ~12 | ~6 (polymorphic / ngoài manifest) | ~67% * |
| Enum dùng MASTER_CODE | Ước tính cột enum/ref | Một phần | Nhiều cột vẫn ENUM_DICTIONARY | ~50% * |
| GAS write có validation | Write API chính | Phần lớn service | Primitives + drift createTask | ~70% * |
| GAS write có error handling | Gateway + service | Gateway tốt hơn | Không đồng nhất | ~65% * |

\*Tỉ lệ mang tính **ước lượng audit** (không phải test tự động).

**Đánh giá tổng thể:** 🟡 — **Schema tài liệu (`schema_manifest`) và runtime GAS (`CBV_SCHEMA_MANIFEST`, `CBV_CONFIG`) chưa thống nhất một nguồn; cần hợp nhất trước khi coi DB layer “production-proof”.**

---

### Phụ lục: CONFLICT đã xác nhận

1. **TASK_MAIN:** `schema_manifest.json` vs `90_BOOTSTRAP_SCHEMA.js` (thiếu `SHARED_WITH`, `IS_PRIVATE`, `PENDING_ACTION` trong manifest).  
2. **TASK_ATTACHMENT / FINANCE_TRANSACTION / HO_SO_FILE:** độ dài và thứ tự cột khác nhau giữa manifest và GAS bootstrap.  
3. **Sheets có trong GAS nhưng không trong manifest:** ENUM_DICTIONARY, FINANCE_LOG, FINANCE_ATTACHMENT, DOC_REQUIREMENT, SYSTEM_HEALTH_LOG.

---

*End of report.*
