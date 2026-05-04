# CBV_CORE_RUNTIME_LIB

Thư viện Apps Script (`CBV_CORE_RUNTIME_LIB`) là **core runtime dùng chung** cho **MAIN_CONTROL** và các module (HO_SO, TASK, FINANCE, …).

## Public API (qua identifier thư viện, ví dụ `CBVCoreRuntime`)

- `CBVCoreRuntime.version()`
- `CBVCoreRuntime.dispatch(command)`
- `CBVCoreRuntime.emitEvent(event)`
- `CBVCoreRuntime.runEventWorker()`
- `CBVCoreRuntime.healthCheck()`
- `CBVCoreRuntime.registerModule(moduleDef)`
- `CBVCoreRuntime.logAudit(audit)`
- `CBVCoreRuntime.now()`, `CBVCoreRuntime.user()`, `CBVCoreRuntime.makeId(prefix)`
- Helpers sheet/JSON: `safeStringify`, `safeParseJson`, `isoNow`, `globalThis`, `isNonEmptyString`, `newCommandId`, `newEventId`, `getSpreadsheet`, `sheetOutputWidth`, `ensureSheetWithHeaders`, `ensureSheetWithHeadersOnSpreadsheet`, `ensureCoreSheet`, `appendRowByHeaders`, `readHeaderMap`, `updateRowByHeaders`, `findFirstRowInColumn`, `healthWrite`, `normalizeError`

- `CBVCoreRuntime.setCoreDbId(dbId)`, `CBVCoreRuntime.getCoreDbId()` — Script property `CBV_CORE_DB_ID`; `cbvCoreV2GetSpreadsheet_()` mở spreadsheet đó (fallback `getActiveSpreadsheet()`).

**Lưu ý thư viện GAS:** `PropertiesService` trong code library là của **project thư viện**, không phải project module. Với HO_SO + bridge, hãy set `CBV_CORE_DB_ID` trên project HO_SO; bridge gọi `cbvCoreV2OpenCoreSpreadsheet_` phía host trước. Nếu gọi `dispatch`/`bootstrap` **chỉ** trong library mà không qua host resolver, cần set cùng key trên project thư viện (hoặc deploy variant có ID sẵn).
- Module con chỉ gọi qua thư viện hoặc **bridge** (`005_CBV_CORE_RUNTIME_BRIDGE.js` / adapter tương đương) để giữ tên hàm `CBV_CoreV2_*` ổn định.

## Triển khai

1. `appsscript.json` nằm trong `src/` (theo `rootDir` của clasp, cùng kiểu `main-control`).
2. Sao chép `.clasp.json.example` → `.clasp.json`, điền `scriptId` sau `clasp create`.
3. `clasp push` từ thư mục project này (đã có `filePushOrder`).

## Gắn vào project khác

Trong Apps Script: **Libraries → Add a library** — dán Script ID, identifier **`CBVCoreRuntime`**, chọn phiên bản ổn định.
