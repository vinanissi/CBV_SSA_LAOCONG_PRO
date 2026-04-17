# DATA SYNC MODULE (GAS) — Thiết kế đầy đủ

**Version:** 1.1  
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

---

## 3. API (contract)

### 3.1 `buildDataSyncReport(opts) → Report`

- **Không** có tham số `dryRun` trong signature — **report luôn read-only**, không ghi spreadsheet, không đổi state ngoài bộ nhớ.
- **Input (tối thiểu):** `planId` hoặc `plan` inline; optional `planOverride` (deep merge để test).
- **Output:**
  - `summary`: `{ insert, update, skip, unchanged, errorRowCount, warnings, ... }` — xem **§3.4** (không dùng cùng tên với counter apply).
  - `rows[]`: per-row `{ key, action, fieldsChanged[], errorCode?, ... }`
  - `canApply`: boolean
  - `planVersion`, `planHash` (optional)
  - **`continuation`**: xem mục 7 (chunk); khi job hoàn tất trong một lần gọi → **`null`**

### 3.2 `runDataSync(opts) → Result`

- **Chỉ ghi** khi `opts.dryRun === false` (cùng tinh thần `runUserMigration` / `runTaskMigration`).
- `summary` của result nên có **`applySkippedErrorCount`** (hoặc tên tương đương) — xem **§3.4**; không gộp nhầm với `errorRowCount` của report.
- Gọi sau khi đã có report hoặc nhúng bước report nội bộ — policy team: **fail nếu `canApply === false`** trừ khi flag `forceApplyErrors` (không khuyến nghị v1).

### 3.3 `validateSyncPlan(plan) → { ok, issues[], warnings[] }`

- Schema plan, job id unique, bắt buộc field (kể cả `onDuplicateSourceKey`, `maxErrorRows`).
- **Sheet/spreadsheet ref:** **chỉ** resolve và kiểm tra tồn tại/quyền truy cập **trong `validateSyncPlan`** (mở spreadsheet, có sheet, header tối thiểu nếu spec yêu cầu). **`buildDataSyncReport` không thay thế** bước này — nếu gọi report mà chưa validate, implementation có thể `throw` hoặc fail fast theo policy; không “defer silent” sang lần đầu report.
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
| `00_CORE_CONFIG.js` | `SHEETS`, thêm `SYSTEM_ACTOR_ID` |
| `01_ENUM_SYNC_SERVICE.js` | Enum governance (tinh thần single source) |

---

*End of design v1.1.*
