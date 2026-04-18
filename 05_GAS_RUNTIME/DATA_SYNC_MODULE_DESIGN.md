# DATA SYNC MODULE (GAS) — Thiết kế đầy đủ

**Version:** 1.3  
**Trạng thái:** Spec chốt trước implementation (source of truth)  
**Phạm vi:** Đồng bộ dữ liệu giữa spreadsheet/sheet nguồn và đích (ví dụ bản DB đầy đủ ↔ bản FIN / mirror), có map cột, transform, cấu hình thay đổi được.

**Tham chiếu pattern có sẵn:** `03_USER_MIGRATION_HELPER.js`, `20_TASK_MIGRATION_HELPER.js`, `00_CORE_CONFIG.js`, `04_OPERATIONS/DEPLOYMENT_FLOW.md` (idempotent / non-destructive).

---

## 1. Mục tiêu và phạm vi

### 1.1 Goals

| ID | Mô tả |
|----|--------|
| G1 | Đồng bộ **một chiều** theo job (source → target); hướng không suy diễn. |
| G2 | **Column mapping** + **alias** header (cột cũ/mới/tên khác). |
| G3 | **Transform** có kiểm soát (registry cố định — không `eval`). |
| G4 | **Khóa nghiệp vụ** (composite key) + **key normalization** tường minh. |
| G5 | **Read-only report** tách biệt **write path**; ghi chỉ qua entry point có kiểm soát. |
| G6 | **Audit** tương thích `logAdminAudit`. |
| G7 | **Plan** (map, job) tách khỏi engine để đổi cấu trúc không sửa vòng lặp lõi. |

### 1.2 Non-goals (v1)

- Hai chiều tự động + conflict resolution.
- Thay thế luồng AppSheet → GAS → Sheets cho nghiệp vụ live.
- Sync file Excel ngoài Google (có thể là tool Python riêng trong `99_TOOLS`).
- **`replace_sheet`** không nằm trong engine v1 — nếu cần, **hàm riêng** với checklist + xác nhận + audit riêng.

---

## 2. Kiến trúc

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ SYNC PLAN (config)  │────▶│ SYNC ENGINE      │────▶│ Target spreadsheet  │
│ version, jobs, map  │     │ resolve, diff,   │     │ batch setValues     │
└─────────────────────┘     │ apply (chunked)  │     └─────────────────────┘
                            └────────┬─────────┘
                                     │
                            ┌────────▼─────────┐
                            │ Report + Audit  │
                            └──────────────────┘
```

- **Plan:** JSON/object có `version`, danh sách `jobs`; có thể mặc định trong code hoặc load từ sheet/Script Properties (policy triển khai).
- **Engine:** không hardcode tên cột nghiệp vụ; chỉ generic resolve header, key, transform, diff, apply.

### 2.1 Form `DATA_SYNC_BUILDER` — pipeline (sheet form → plan nghiệp vụ)

**Nguyên tắc (form mới):** Hàng **6** và **8** — `source spreadsheet` / `source sheet` / `target spreadsheet` / `target sheet` ở cột **B** và **D**; **B6/B8 giữ URL** (không ghi đè bằng id đã chuẩn hóa). **Một hàng header nguồn** ở **hàng 7**, **một hàng header đích** ở **hàng 9**, dán ngang từ **cột A**. Trước khi build plan, **D6/D8** và **id spreadsheet** (từ URL B6/B8) được **đồng bộ xuống dòng JOB** (B–E); cột B/D trên **JOB** là **spreadsheet id** sau normalize. Bảng **JOB** vẫn giữ đủ mode/key/policy; layout **cũ** (header ở hàng 6 & 8 cột B) được `dataSyncGetBuilderHeaderPasteConfig_` nhận diện.

**COLUMN_MAPS:** Hàng tiêu đề đủ **A–H** — `job_id`, `from`, `to`, `transform`, `enumMapRef`, `src_col#`, `tgt_col#`, `same_name` (chỉ số cột **1-based** trên sheet nguồn/đích; `same_name` = Yes/No). **K–M** (cùng hàng tiêu đề): `job_id`, `cols_src_only`, `cols_tgt_only` — danh sách tên cột **không** nằm trong cặp map (chỉ nguồn / chỉ đích). Plan JSON vẫn chỉ đọc **A–E** cho `columnMap`.

#### Luồng làm việc chính (prod)

Form mới: **A6** = “source spreadsheet …”. **Thứ tự dưới đây là thứ tự phụ thuộc kỹ thuật** (đủ để chạy pipeline); có thể điền **B6/B8 + D6/D8** trước rồi **đồng bộ meta → JOB** ngay — tương đương “có link + tên tab” trước khi map.

| # | Việc làm | Ghi chú / menu GAS (`90_BOOTSTRAP_MENU.js`) |
|---|----------|-----------------------------------------------|
| 1 | **B6** = link spreadsheet nguồn; **D6** = tên tab nguồn | **B8** = link spreadsheet đích; **D8** = tên tab đích. B6/B8 giữ URL; id chuẩn hóa nằm trên dòng **JOB** khi sync meta. |
| 2 | **JOB** — ít nhất một dòng (`job_id`, tên tab nguồn/đích, policy…) | Đồng bộ từ form (meta → dòng JOB đầu khi Generate / các bước builder gọi `dataSyncSyncMetaFormToFirstJobRow_`) hoặc **Import jobs (two paste columns) → job table**. *Cần trước bước auto map nếu đọc **hàng 1** từ sheet thật (theo tên tab trên JOB).* |
| 3 | **Hàng 7** / **hàng 9** — tên cột *(tuỳ chọn)* | **Dán tay** từ hàng 1 hai sheet, hoặc menu **Fill header rows 7/9 from B6·D6 & B8·D8** — `dataSyncFillHeaderRowsFromFormLinks_` (mở spreadsheet, đọc hàng 1 tab D6/D8). Nếu không dán 7/9 nhưng đã có JOB, **Auto column maps** vẫn có thể đọc **hàng 1** trực tiếp. |
| 4 | **Auto column maps** → **COLUMN_MAPS** | **Auto column maps (match headers)** (`dataSyncAutoFillColumnMapsFromHeaders_`). F–H + K–M; **keyColumns (G)** = `from` dòng map đầu (trừ key composite có `,`). |
| 5 | *(Tuỳ chọn)* **Dropdown from/to** | **Dropdown from/to (column map)** — `dataSyncApplyColumnMapDropdowns_`. |
| 6 | **Generate plan JSON → CONTROL A2** | **Generate plan JSON → CONTROL A2** (`buildPlanObjectFromBuilderSheet_` → `saveDataSyncPlanToSheet`). |
| 7 | **Kiểm tra** | **Validate plan (A2)** → **Build report (read-only)** (chunk resume **F2**). Không ghi đích. |
| 8 | **Run apply** | **Run apply (writes target…)** — truyền **plan + continuation (F2)** từ `getDataSyncReportOptsFromSheet_()`; `dryRun: false`. **Run apply — one job (prompt job_id)** — cùng continuation/plan, thêm `jobId` để chỉ chạy một job (`buildDataSyncReport` / `runDataSync` lọc `plan.jobs`). |

Pipeline gộp: **Data sync → Pipeline: import + maps + dropdowns** chạy import → maps → dropdowns khi đã chuẩn bị cột import + meta.

**Import jobs:** chỉ xóa/ghi trong **bảng JOB** (số dòng tối đa cố định trước khối COLUMN_MAPS — `dataSyncGetBuilderJobDataEndRow_`), không xóa vùng map. Sau import, cột **B/D** (spreadsheet id) lấy từ **B6/B8** (form mới) cho mọi dòng job.

**Can thiệp:** sửa tay **COLUMN_MAPS** (transform, enum, …); menu **Dropdown from/to** nếu cần. Dropdown **from/to** cho phép giá trị ngoài list (`allowInvalid`) để chỉnh thủ công.

**Impl (GAS):** `Sheet.getRange(row, column, numRows, numColumns)` — tham số 3–4 là **số hàng / số cột**, không phải “last row / last column”; tránh mẫu `(r,c,r,endCol)` cho một hàng (sẽ lệch số ô). Builder dùng `getRange(r,c,1,width)` cho một dải một hàng.

---

## 3. API (contract)

### 3.1 `buildDataSyncReport(opts) → Report`

- **Không** có tham số `dryRun` trong signature — **report luôn read-only**, không ghi spreadsheet, không đổi state ngoài bộ nhớ.
- **Input (tối thiểu):** `planId` hoặc `plan` inline; optional `planOverride` (deep merge để test); optional **`continuation`**, **`jobId`** (chỉ phân tích một job), **`maxRowsPerChunk`** — xem impl `49_DATA_SYNC_ENGINE.js`.
- **Output:**
  - `summary`: `{ insert, update, skip, unchanged, errorRowCount, warnings, ... }` — xem **§3.4** (không dùng cùng tên với counter apply).
  - `rows[]`: per-row `{ key, action, fieldsChanged[], errorCode?, ... }`
  - `canApply`: boolean
  - `planVersion`, `planHash` (optional)
  - **`continuation`**: xem mục 7 (chunk); khi job hoàn tất trong một lần gọi → **`null`**

### 3.2 `runDataSync(opts) → Result`

- **Chỉ ghi** khi `opts.dryRun === false` (cùng tinh thần `runUserMigration` / `runTaskMigration`).
- **Input:** giống `buildDataSyncReport`: `plan`, optional **`continuation`** (chunk resume — nên lấy từ **F2** qua `getDataSyncReportOptsFromSheet_()` khi gọi từ menu), optional **`jobId`** — nếu set, engine chỉ xử lý job có `id` khớp (multi-job plan vẫn hợp lệ).
- `summary` của result nên có **`applySkippedErrorCount`** (hoặc tên tương đương) — xem **§3.4**; không gộp nhầm với `errorRowCount` của report.
- Gọi sau khi đã có report hoặc nhúng bước report nội bộ — policy team: **fail nếu `canApply === false`** trừ khi flag `forceApplyErrors` (không khuyến nghị v1).

### 3.3 `validateSyncPlan(plan) → { ok, issues[], warnings[] }`

- Schema plan, job id unique, bắt buộc field (kể cả `onDuplicateSourceKey`, `maxErrorRows`).
- **Sheet/spreadsheet ref:** **chỉ** resolve và kiểm tra tồn tại/quyền truy cập **trong `validateSyncPlan`** (mở spreadsheet, có sheet, header tối thiểu nếu spec yêu cầu). **`buildDataSyncReport` không thay thế** bước này — nếu gọi report mà chưa validate, implementation có thể `throw` hoặc fail fast theo policy; không “defer silent” sang lần đầu report.
- **`spreadsheetId`:** `cbvNormalizeGoogleSpreadsheetId` trong `00_CORE_UTILS.js` — URL → id; dùng trong engine (`openById`) và builder (form B6/B8, cột JOB B/D + Generate).
- **Levenshtein “did you mean?”:** nếu `from`/`aliases` không khớp header, distance ≤ 2 và best match unique → **`warnings[]`** `SUGGESTED_HEADER` — **không** auto-map.

### 3.4 Metrics: report vs apply (hai counter khác phase)

Tránh dùng một tên cho hai ý nghĩa (ví dụ chỉ ghi `errorRows` ở cả report lẫn apply).

| Tên đề xuất | Object / phase | Ý nghĩa |
|-------------|----------------|--------|
| **`errorRowCount`** | `buildDataSyncReport` → `summary` | Số **dòng nguồn** bị đánh dấu lỗi trong **phân tích** (validation, transform, duplicate policy `error`, enum, …). |
| **`applySkippedErrorCount`** | `runDataSync` → `summary` (hoặc tên tương đương rõ nghĩa) | Số dòng **không ghi** xuống target vì thuộc tập lỗi từ báo cáo hoặc lỗi chỉ phát hiện khi ghi. |

**Ghi chú:** Khi apply ngay sau một full report ổn định, thường `applySkippedErrorCount === errorRowCount`; hai field vẫn **khác semantic** (read vs write). Nếu apply phát sinh thêm lỗi chỉ lúc ghi, `applySkippedErrorCount` có thể lớn hơn hoặc bổ sung mã `APPLY_*` — document trong impl.

---

## 4. Schema plan

### 4.1 Cấp plan

| Field | Mô tả |
|-------|--------|
| `version` | string (semver hoặc date) |
| `jobs` | mảng job |

### 4.2 Cấp job

| Field | Bắt buộc | Mô tả |
|-------|----------|--------|
| `id` | ✓ | Định danh job |
| `source`, `target` | ✓ | `{ spreadsheetId, sheetKey }` (qua `CBV_CONFIG.SHEETS`) hoặc `sheetName` |
| `keyColumns` | ✓ | Khóa ổn định |
| `columnMap` | ✓ | Xem 4.3 |
| `mode` | ✓ | `append_only` \| `upsert` |
| `onMissingTargetColumn` | ✓ | `skip` \| `error` |
| `onSourceKeyMissing` | ✓ | `skip` \| `error` |
| **`maxErrorRows`** | ✓ | Số nguyên ≥ 0 — xem 5 |
| **`onDuplicateSourceKey`** | ✓ | `error` \| `last_wins` — không default ẩn |
| `keyNormalization` | optional | default **`upper_trim`** — xem 4.4 |
| `enumMaps` | optional | map inline cho `enumMapRef` — xem 4.5 |

### 4.3 `columnMap` entry

| Field | Mô tả |
|-------|--------|
| `from` | Header nguồn hoặc canonical sau alias |
| `to` | Header đích |
| `aliases` | optional |
| `transform` | optional — registry: `trim`, `number`, `date_iso`, `date_serial`, `bool`, `upper`, `enum` + `enumMapRef` |
| `required` | optional |
| `targetFormat` | optional — ví dụ serial vs Date cho sheet |

**Alias:** ưu tiên exact `from` → `aliases` — **fuzzy default tắt** (chỉ gợi ý qua `validateSyncPlan`).

### 4.4 Key normalization

- **Default:** `upper_trim` — `String(value).trim().toUpperCase()` (ASCII; mở rộng Unicode versioned sau).
- Override: `none` \| `trim` \| `upper_trim`.

### 4.5 `enumMapRef` — namespace

String dạng **`namespace:name`**:

| Namespace | Ý nghĩa |
|-----------|--------|
| `inline:<jobId>.<mapName>` | Map trong plan: `job.enumMaps[mapName] = { "RAW": "CANONICAL", ... }` |
| `sheet:<SheetLogicalKey>` | Bảng map hai cột (tên cột cố định trong constants impl) |
| `master:<GROUP>` | Lookup `MASTER_CODE` theo nhóm (khi convention đã rõ) |

**Resolve order:** cố định trong code và **ghi trong README module** (ví dụ: `inline` → `sheet` → `master`).

**Lỗi không resolve:** mã ổn định **`ENUM_MAP_UNRESOLVED`** / **`ENUM_MAP_AMBIGUOUS`** trong report (không chỉ string tự do).

### 4.6 `date_iso` vs `date_serial`

- Phân biệt rõ trong transform và `targetFormat`: ISO string ↔ `Date` ↔ **serial số ngày** Sheets.
- Chi tiết timezone: **impl note** trong file transform (một owner khi viết `date_iso`) — xem mục 9.

---

## 5. Row-level errors và `canApply`

### 5.1 Định nghĩa error row

Row không pass validation: thiếu key, transform fail, required empty, target column missing khi policy = error, enum không resolve, v.v.

### 5.2 `maxErrorRows`

- **`maxErrorRows = 0`:** chỉ `canApply === true` khi **`summary.errorRowCount === 0`**.
- **`maxErrorRows > N`:** `canApply === false` nếu **`summary.errorRowCount > maxErrorRows`**.

### 5.3 Hành vi report vs apply

- **`buildDataSyncReport`:** quét **toàn bộ** rows (hoặc toàn bộ chunk trong một lần gọi), **ghi nhận mọi** row lỗi — **không** dừng sớm chỉ vì gặp lỗi (để audit đủ). Đếm trong `summary.errorRowCount` — xem **§3.4**.
- **`runDataSync`:** chỉ **ghi** row hợp lệ; row lỗi **skip**, đếm trong **`applySkippedErrorCount`** (không dùng chung tên với `errorRowCount` của report).
- **Không** “abort giữa chừng report” theo nghĩa mất dữ liệu phân tích — abort chỉ khi **fatal** (plan invalid, không mở được sheet, không resolve header cho key). *Lưu ý:* fatal sau **`validateSyncPlan`** vẫn có thể xảy ra nếu sheet bị xóa giữa validate và report — policy impl (fail fast).

### 5.4 `onDuplicateSourceKey`

- **`error`:** **Khuyến nghị (chốt spec):** giữ **một** dòng đầu tiên theo **thứ tự quét sheet nguồn** (từ trên xuống, cùng hướng với `DATA_SYNC_FIRST_DATA_ROW` → cuối) làm bản hợp lệ cho key đó; **mọi dòng sau cùng key** (duplicate sau dòng đầu tiên) = **error row**. Dev không cần đọc audit history để hiểu quy tắc này.
- **`last_wins`:** row **cuối cùng** theo cùng thứ tự quét sheet nguồn thắng; report có warning `DUPLICATE_SOURCE_KEY_RESOLVED` / `supersededByRow` khi cần.

---

## 6. Audit — `logAdminAudit`

| Khi | Ghi |
|-----|-----|
| Sau `runDataSync` hoàn tất (ghi xong, không throw) | Bắt buộc (success path) |
| `runDataSync` fail trước/sau ghi | Optional `DATA_SYNC_FAILED` — message rút gọn |
| Chỉ `buildDataSyncReport` | **Không** ghi audit (read-only) |

**Payload tối thiểu:** `action: 'DATA_SYNC'`, `planVersion`, `jobId`, `sourceSpreadsheetId`, `targetSpreadsheetId`, `summary` (inserted, updated, skipped, **errorRowCount** từ report nếu có, **applySkippedErrorCount** từ apply, warnings), `durationMs`, optional `planHash`. **Không** log full row PII.

### 6.1 Actor

- User context: `cbvUser()` khi có.
- Trigger / batch không user: **`CBV_CONFIG.SYSTEM_ACTOR_ID`** — **không** hardcode `'SYSTEM'` rải file.

**Implementation note:** Thêm **`SYSTEM_ACTOR_ID`** một lần trong `00_CORE_CONFIG.js` (hoặc helper `cbvSystemActor()`); document xem giá trị có cần tồn tại trong `USER_DIRECTORY` hay chỉ sentinel cho audit.

---

## 7. Chunk, continuation, consistency (R-GAS-1)

### 7.1 Vấn đề

Resume theo **row index** sai nếu sheet nguồn thay đổi giữa các lần chạ → ghi nhầm row **không ai biết**.

### 7.2 Token bắt buộc kèm snapshot

Khi trả `continuation` (chưa xong job):

| Field | Ý nghĩa |
|-------|--------|
| `sourceRowCount` | `getLastRow()` (hoặc quy ước data row count đã chốt) **tại lúc tạo token** |
| `sourceLastColumn` | optional — phát hiện thêm cột |
| `nextStartRow` | Xem mục 9 (I-1) |
| `jobId`, `planVersion` | |
| `sourceSpreadsheetId`, sheet id/name | |

**Resume:**

1. Đọc `sourceRowCountNow` (và column nếu check).
2. Nếu **≠** `token.sourceRowCount` (hoặc column không khớp) → **`continuationStale: true`**, **abort resume** — không dùng `nextStartRow` cũ; yêu cầu **chạy lại full** từ đầu.
3. Return: `{ aborted: true, reason: 'SOURCE_ROW_COUNT_CHANGED', token, snapshot, current }`.

### 7.3 `continuation === null` khi xong (I-2)

| Trạng thái | `continuation` |
|------------|----------------|
| Còn chunk sau | object đầy đủ + snapshot |
| Job hoàn tất | **`null`** |

Caller loop:

```text
cont = null
repeat
  result = runChunk(..., cont)   // hoặc build/apply tùy API chunk
  cont = result.continuation
until cont == null
```

**Không** chỉ dựa heuristic `nextStartRow > lastRow` nếu đã thống nhất `null` là “done”.

### 7.4 Hiệu năng

- Đọc `getValues()` theo chunk; batch `setValues`.
- Optional `maxRowsPerExecution` + continuation — kèm rule 7.2.

---

## 8. Risk register

| ID | Risk | Mitigation (spec) |
|----|------|-------------------|
| R-1 | Map sai cột | Preview bắt buộc; validate plan; Levenshtein chỉ warning; không fuzzy map mặc định. |
| R-2 | Duplicate key target | Policy explicit; báo cáo rõ. |
| R-3 | Schema target thiếu cột | `onMissingTargetColumn: error` cho job production. |
| R-4 | Race user sửa sheet | Maintenance window; optional lock (best-effort). |
| **R-GAS-1** | Timeout / partial | Chunking + **snapshot row count**; mismatch → abort resume (mục 7). |
| **R-GAS-2** | `setValues()` coercion | Chuẩn hóa type trước ghi; `targetColumnType` / preview trong report. |
| **R-GAS-3** | Header typo | `validateSyncPlan` + “did you mean?” warning (mục 3.3). |

---

## 9. Kick-off implementation (tránh lệch dev)

### I-1 — `nextStartRow` (một dòng constants)

**File đề xuất:** ví dụ `DATA_SYNC_CHUNK.js` hoặc đầu engine.

```javascript
/** First data row on sheet (1-based). Header row = 1. */
var DATA_SYNC_FIRST_DATA_ROW = 2;

/**
 * nextStartRow: 1-based sheet row index of the FIRST row of the NEXT chunk (inclusive).
 * Do not mix with 0-based array index from getValues() — convert only at boundaries.
 */
```

### I-3 — Timezone / `date_iso`

- Ghi **impl note** trong file transform: parse ISO → `Date` (UTC vs local); ghi sheet serial/timezone behavior — **một owner** khi implement.

---

## 10. Checklist trước merge code

- [ ] `maxErrorRows`, `onDuplicateSourceKey`, `keyNormalization` trong job schema + validate.
- [ ] `buildDataSyncReport` **không** có `dryRun`; không side-effect ghi.
- [ ] `continuation === null` khi done; snapshot row count khi resume.
- [ ] `CBV_CONFIG.SYSTEM_ACTOR_ID` + ref khắp nơi thay `'SYSTEM'`.
- [ ] `enumMapRef` namespace + mã lỗi `ENUM_*`.
- [ ] `logAdminAudit` payload + khi nào ghi — documented.
- [ ] `mode` chỉ `append_only` | `upsert`; không `replace_sheet` trong engine v1.
- [ ] Chunking + continuation documented; `setValues` type rules; **sheet/spreadsheet ref chỉ validate tại `validateSyncPlan`** (report không thay thế).
- [ ] `summary.errorRowCount` vs `applySkippedErrorCount` đúng §3.4.
- [ ] `date_iso` / `date_serial` + note timezone trong transform file.

---

## 11. Tài liệu liên quan trong repo

| File / khu vực | Liên quan |
|----------------|-----------|
| `03_USER_MIGRATION_HELPER.js` | `buildMigrationReport` / `runUserMigration`, dryRun |
| `20_TASK_MIGRATION_HELPER.js` | `columnMap`, `statusMapping`, alias |
| `00_CORE_CONFIG.js` | `SHEETS`, `SYSTEM_ACTOR_ID` |
| `45_DATA_SYNC_BUILDER.js` | Form `DATA_SYNC_BUILDER` — xem **§2.1**; `buildPlanObjectFromBuilderSheet_()` → `CONTROL!A2` |
| `46_DATA_SYNC_PLAN_SHEET.js` | Plan JSON trên sheet `DATA_SYNC_CONTROL` (`A2`), token chunk `F2`, menu |
| `47_DATA_SYNC_CHUNK.js` | Constants chunk / `nextStartRow` |
| `48_DATA_SYNC_TRANSFORM.js` | Transforms + Levenshtein + enum resolve |
| `49_DATA_SYNC_ENGINE.js` | `validateSyncPlan`, `buildDataSyncReport`, `runDataSync` |
| `DATA_SYNC_MODULE_IMPLEMENTATION_AUDIT.md` | Đối chiếu checklist sau impl |
| `01_ENUM_SYNC_SERVICE.js` | Enum governance (tinh thần single source) |

---

*End of design v1.3.*
