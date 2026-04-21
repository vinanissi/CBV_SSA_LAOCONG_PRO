# CBV Naming Conventions — chuẩn hoá dài hạn

> **Mục tiêu:** một quy ước duy nhất cho file, function, biến, hằng số, enum, event, sheet/column — tránh xung đột alias (`createHoSo` vs `createHoso`), prefix lộn xộn (`hosoRunAudit` vs `auditHoSoModule`), và file lẫn case (`10_HOSO_*.js` vs `98_schema_manager.js`).
>
> **Phạm vi áp dụng:**
>
> - **BẮT BUỘC** cho mọi code/mã định danh **mới**.
> - Code cũ: giữ nguyên, giữ alias làm **deprecation wrapper**, xoá theo lộ trình (xem §8).
>
> **Nguyên tắc vàng:** *mỗi concept có đúng một tên canonical; các tên khác chỉ là wrapper tạm thời, có ghi chú `@deprecated`.*

---

## 1. Từ vựng & viết tắt chuẩn (glossary)

| Viết tắt | Ý nghĩa | Cách viết trong mã |
|---|---|---|
| **HO_SO** | Hồ sơ (module) | UPPER_SNAKE khi là file/const; **`hoso`** khi là identifier camelCase (1 từ, không `HoSo`, không `Hoso`) |
| **TASK** | Công việc | UPPER_SNAKE file/const; **`task`** trong camelCase |
| **FINANCE** | Tài chính | UPPER_SNAKE file/const; **`finance`** trong camelCase |
| **DON_VI** | Đơn vị | UPPER_SNAKE file/const; **`donVi`** trong camelCase |
| **USER** | Người dùng | UPPER_SNAKE file/const; **`user`** trong camelCase |
| **ENUM** | Enum dictionary | UPPER_SNAKE file/const; **`enum`** trong camelCase (tránh keyword ES nếu thấy cần, dùng `enumRegistry`) |
| **CORE** | Core runtime (utils, event, rule) | UPPER_SNAKE file/const; **`core`** trong camelCase |
| **CBV** | CBV framework (cross-cutting: response, config, audit) | UPPER_SNAKE file/const; **`cbv`** trong camelCase |
| **MASTER_CODE** | Bảng master code | UPPER_SNAKE file/const; **`masterCode`** camelCase |
| **HTX** | Hợp tác xã (luôn xem như acronym 3 chữ) | Giữ **`HTX`** trong identifier; không biến thành `Htx` |

> **Quy tắc acronym:** acronym ≤3 ký tự **giữ UPPERCASE** trong camelCase → `HTX_ID`, `getHTXById`, `validateHTX`.
> Acronym ≥4 ký tự → treat như từ thường → `HttpClient`, không `HTTPClient`.

---

## 2. Tên file trong `05_GAS_RUNTIME/`

Pattern duy nhất: **`NN_MODULE_ROLE.js`**

- `NN` = 2 chữ số, layer thứ tự load (00 core → 90 bootstrap → 99 debug).
- `MODULE` = UPPER_SNAKE, lấy từ glossary §1 (`HOSO`, `TASK`, `FINANCE`, `USER`, `DON_VI`, `ENUM`, `CORE`, `CBV`, `BOOTSTRAP`, `APPSHEET`, `DEBUG`, `MIGRATION`).
- `ROLE` = UPPER_SNAKE, từ vựng cố định (§3).

**Cấm:** lowercase hoặc mixed case (`98_schema_manager.js` → phải rename thành `98_BOOTSTRAP_SCHEMA_MANAGER.js`).

Layer (`NN`) khuyến nghị:

| Layer | Ý nghĩa |
|---|---|
| `00_` | Core constants/config/utils |
| `01_` | Enum |
| `02_` | User, Master code |
| `03_` | Shared (repository, validation, logger, row reader, registry) |
| `04_` | Core event/rule engine |
| `10_` | HO_SO module |
| `11_` | Phuong tien module |
| `20_` | Task module |
| `30_` | Finance module |
| `40_` | Cross-cutting service (display mapping, star/pin) |
| `45-49_` | Data sync, shared-with |
| `50_` | AppSheet verify |
| `60_` | API gateways |
| `61_` | Unified router |
| `90_` | Bootstrap, schema, menu, audit |
| `95-97_` | Test infrastructure |
| `98_` | Bootstrap managers (schema/seed/deployment) |
| `99_` | Debug, sample data, manual migration |

## 3. `ROLE` chuẩn trong tên file

| ROLE | Chứa gì |
|---|---|
| `CONSTANTS` | hằng số, enum group names, allowed transitions |
| `CONFIG` | runtime config object, options defaults |
| `UTILS` | hàm tiện ích thuần (no I/O) |
| `VALIDATION` | assertions, throw errors (không ghi sheet) |
| `REPOSITORY` | truy cập `SpreadsheetApp` (CRUD thuần) |
| `SERVICE` | business logic (gọi repository + validation) |
| `WRAPPERS` | thin entrypoint (alias ngắn → `*Impl`) |
| `MENU` | hàm gắn vào UI menu |
| `API_GATEWAY` | HTTP / webhook endpoint |
| `TEST` | test đóng gói chạy nội bộ |
| `BOOTSTRAP` | ensureSheets, seed, init |
| `SEED` | dữ liệu mẫu / master |
| `MIGRATION` | chuyển đổi legacy → pro |
| `AUDIT` / `AUDIT_REPAIR` | báo cáo + sửa dữ liệu |

**Quy ước:** một file chỉ chứa **một** ROLE. Không trộn service + validation + repository.

## 4. Function naming

### 4.1. Pattern canonical

```
<modulePrefix><Verb><Noun>[Qualifier]
```

Ví dụ đúng:

- `hosoCreate`, `hosoUpdate`, `hosoChangeStatus` (service-level, noun ngầm là HO_SO_MASTER)
- `hosoFileAdd`, `hosoRelationAdd` (đối tượng con → `<modulePrefix><Child><Verb>`)
- `taskCreate`, `taskComplete`, `taskReopen`
- `financeCreate`, `financeConfirm`, `financeCancel`
- `donViFindById`, `userValidateForCreate`

> **Khuyên dùng: verb sau noun (camelCase), module làm prefix.** Lý do: gom theo module khi autocomplete, tránh va chạm với code core (`createX`, `updateX`) của framework khác.

### 4.2. Alias cho phép

Chỉ **3 trường hợp** được giữ alias:

1. **Deprecation wrapper** — xem §8.
2. **Menu binding** — AppScript menu cần tên ngắn, không prefix:
   - `menuAuditHoSo()` → `return hosoAudit();`
   - `menuSeedHoSoDemo()` → `return hosoSeedDemo();`
3. **AppSheet action / webhook** — cần đúng chữ ký client, không đổi.

### 4.3. Hậu tố đặc biệt

| Hậu tố | Ý nghĩa | Ví dụ |
|---|---|---|
| `*_` (underscore đuôi) | module-private (đừng gọi từ ngoài file/module) | `hosoFindTypeMasterIdByCode_`, `_api_getHoSoList_` |
| `*Impl` | hàm triển khai thực, wrapper công khai gọi vào | `runHosoTestsImpl` (wrapper: `hosoRunTests`) |
| `ensure*` | idempotent (chạy nhiều lần không hại) | `ensureSheetExists`, `ensureHosoSheets_` |
| `assert*` / `validate*` | throw nếu sai | `assertActiveTaskTypeId`, `validateTaskPayload` |
| `find*ById` / `findBy*` | tra cứu 1 bản ghi | `hosoRepoFindMasterById` |
| `list*` / `query*` | trả nhiều bản ghi | `hosoQueryByStatus` |
| `create/update/delete/patch/set/change` | state mutation | `hosoCreate`, `hosoSetStatus` |
| `audit*` | đọc, báo cáo findings | `hosoAuditSchema` |
| `repair*` | ghi sửa dữ liệu (phải có dry-run) | `repairHoSoMasterBlanks` |
| `seed*` | insert master/demo | `hosoSeedDemo_` |

### 4.4. Cấm

- **Không** trộn `HoSo` và `Hoso`. Chọn: **`hoso`** (một từ, lowercase trong camelCase, UPPER_SNAKE trong const: `HOSO_*`).
- Không đặt tên chung chung không prefix module nếu logic thuộc module: tránh `createTransaction`, dùng `financeTransactionCreate`.
- Không đặt hàm public khởi đầu bằng `_` (underscore).
- Không dùng số thô trong tên (`getHoSo2`, `migrateV3`) — dùng qualifier: `getHoSoLegacy`, `migrateToPro`.

## 5. Variables & constants

| Loại | Pattern | Ví dụ |
|---|---|---|
| Local var | `camelCase` | `typeId`, `htxRootId` |
| Function param | `camelCase` | `function hosoValidate(htxId)` |
| Module const (public) | `UPPER_SNAKE` với prefix module | `HOSO_MASTER_GROUP_TYPE`, `TASK_VALID_STATUS` |
| Module const (private) | leading `_` + UPPER_SNAKE | `_ROWS_CACHE_PREFIX` |
| Enum group name | UPPER_SNAKE (đồng nhất với `ENUM_DICTIONARY.ENUM_GROUP`) | `HO_SO_STATUS`, `TASK_PRIORITY` |
| Event type const | `CBV_CORE_EVENT_TYPE_<DOMAIN>_<ACTION>` | `CBV_CORE_EVENT_TYPE_HO_SO_CREATED` |

> **Quy ước về `HO_SO` vs `HOSO`:**
>
> - Dùng `HO_SO` khi tên trùng với **tên sheet/column** (schema-facing): `HO_SO_MASTER`, `HO_SO_TYPE_ID`, `HO_SO_STATUS`, `HO_SO_CODE`.
> - Dùng `HOSO` (liền) khi là **identifier code-only** (không đi vào schema): `HOSO_MASTER_GROUP_TYPE`, `HOSO_STATUS_TRANSITIONS`, `HOSO_ENUM_GROUPS`, function `hosoCreate`.
> - Lý do: giúp grep tách biệt "nghiệp vụ ↔ code", không đụng cột `HO_SO_*` khi đổi tên hàm.

## 6. Sheet & column naming (đã ổn — giữ nguyên)

- Tên sheet: UPPER_SNAKE, đầy đủ, không viết tắt: `HO_SO_MASTER`, `HO_SO_DETAIL_PHUONG_TIEN`, `TASK_MAIN`.
- Tên cột: UPPER_SNAKE, các khoá ngoại kết thúc `_ID`, flag bool tiền tố `IS_` hoặc `ALLOW_`.
- Cột audit chuẩn: `CREATED_AT`, `CREATED_BY`, `UPDATED_AT`, `UPDATED_BY`, `IS_DELETED`.

## 7. Response / cbvResponse

Hàm public **phải** trả `cbvResponse(ok, code, message, data, errors)`.

- `code`: UPPER_SNAKE verb + domain: `HOSO_CREATED`, `TASK_UPDATED`, `FINANCE_CONFIRMED`, `ENUM_SEED`.
- `message`: tiếng Việt, người dùng đọc được.
- `data`: object/array; nếu trả 1 record, đặt key là record (không wrap `{ record: ... }`).

## 8. Lộ trình migrate aliases tồn đọng

### 8.1. Danh sách canonical sau chuẩn hoá

| Canonical | Alias hiện có (sẽ deprecated) |
|---|---|
| `hosoCreate` | `createHoSo`, `createHoso` |
| `hosoUpdate` | `updateHoso` |
| `hosoSetStatus` | `changeHosoStatus`, `setHoSoStatus` |
| `hosoSoftDelete` | `softDeleteHoso` |
| `hosoFileAdd` | `addHosoFile`, `attachHoSoFile` |
| `hosoRelationAdd` | `addHosoRelation`, `createHoSoRelation` |
| `hosoRunTests` | `runHosoTests`, `runHoSoTests` |
| `hosoAudit` | `hosoRunAudit`, `auditHoSoModule` |
| `hosoSeedDemo` | `seedHoSoDemo`, `seedHoSoDemoImpl`, `seedHosoDemoData_` (nội bộ) |
| `hosoTestRelations` | `testHoSoRelations` |
| `hosoFullDeploy` | `runHosoFullDeployment`, `hosoRunFullDeploymentMenu` |

### 8.2. Pha migration

**Phase A — Chuẩn hoá không phá vỡ (ngay):**

1. Tạo hàm canonical mới trong file gốc (service/bootstrap/wrapper).
2. Biến alias cũ thành wrapper: `function createHoSo(data) { return hosoCreate(data); }` kèm JSDoc `@deprecated use hosoCreate`.
3. Cập nhật `05_GAS_RUNTIME/FUNCTION_WRAPPER_MAP.md` để ghi lại canonical ↔ alias.

**Phase B — Chuyển callers (dần):**

1. Khi **sửa** bất kỳ file GAS nào, đổi caller sang canonical trong phạm vi file đó.
2. AppSheet webhook / menu **giữ tên alias** cho đến khi có migration AppSheet đồng bộ.
3. Không tạo alias mới.

**Phase C — Xoá alias (sau 2 release liên tiếp không có caller nội bộ):**

1. Grep `rg '\balias_name\b'` toàn workspace → 0 callers trong `05_GAS_RUNTIME/`.
2. Xoá alias, cập nhật `FUNCTION_WRAPPER_MAP.md` (di chuyển sang `REMOVED`).
3. Bumper version tag: `v2.x.0` (minor cho phase B, major cho phase C).

### 8.3. File cần rename (phase A → B)

| Hiện tại | Đổi thành |
|---|---|
| `98_schema_manager.js` | `98_BOOTSTRAP_SCHEMA_MANAGER.js` |
| `98_seed_manager.js` | `98_BOOTSTRAP_SEED_MANAGER.js` |
| `98_deployment_bootstrap.js` | `98_BOOTSTRAP_DEPLOYMENT.js` |
| `98_audit_logger.js` | `98_BOOTSTRAP_AUDIT_LOGGER.js` |
| `98_validation_engine.js` | `98_BOOTSTRAP_VALIDATION_ENGINE.js` |

> **Khi rename:** dùng `clasp` commit cùng lần; không split rename + code change chung commit.

### 8.4. Quy tắc cho repository đặt sai chỗ

- `donViFindById` đang nằm trong `20_TASK_REPOSITORY.js` — **di chuyển** về `03_SHARED_REPOSITORY.js` hoặc tạo `21_DON_VI_REPOSITORY.js` trong phase A.

## 9. Checklist review code mới

Khi review PR/commit, kiểm tra từng mục:

- [ ] File mới theo pattern `NN_MODULE_ROLE.js` với `MODULE`, `ROLE` đúng glossary (§1, §3).
- [ ] Function mới có module prefix (`hoso*`, `task*`, `finance*`, …) hoặc là `cbv*` / `core*` nếu cross-cutting.
- [ ] Không trộn `HoSo` và `Hoso` trong cùng identifier.
- [ ] Hàm public không bắt đầu bằng `_`; hàm private có `_` hậu tố hoặc đầu.
- [ ] Const `UPPER_SNAKE` có prefix module.
- [ ] Response dùng `cbvResponse` + `code` UPPER_SNAKE.
- [ ] Thêm alias? chỉ khi (a) deprecation wrapper, (b) menu binding, (c) AppSheet contract — và phải JSDoc `@deprecated` nếu là (a).
- [ ] Cập nhật `FUNCTION_WRAPPER_MAP.md` nếu có alias.

## 10. Tham chiếu nhanh

- Kiến trúc gốc: `00_OVERVIEW/CBV_FINAL_ARCHITECTURE.md`
- Event-driven: `00_OVERVIEW/CBV_EVENT_DRIVEN_ARCHITECTURE.md`, `EVENT_DRIVEN_MIGRATION_PLAN.md`
- Wrapper registry: `05_GAS_RUNTIME/FUNCTION_WRAPPER_MAP.md`, `04_OPERATIONS/FUNCTION_WRAPPER_MAP.md`
- Schema manifest: `06_DATABASE/schema_manifest.json`
- HO_SO data model: `02_MODULES/HO_SO/DATA_MODEL.md`

---

## Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-04-20 | Tạo tài liệu; chốt pattern `NN_MODULE_ROLE.js`, module prefix camelCase (`hoso*`/`task*`/…), phân biệt `HO_SO` (schema) vs `HOSO` (code identifier), lộ trình migrate alias 3 phase. |
