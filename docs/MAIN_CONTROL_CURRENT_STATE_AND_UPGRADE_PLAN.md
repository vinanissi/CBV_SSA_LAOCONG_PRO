# MAIN_CONTROL Current State & Upgrade Plan

> Repo: `D:\Workspace\projects\CBV_SSA_LAOCONG_PRO`  
> Scan scope (per request): `apps-script/main-control`, `apps-script/core-runtime-lib`, các docs liên quan, `appsscript.json`, `.clasp.json` + keyword scan (MAIN_CONTROL/MC_/registry/config/event/command/audit/health/webapp/idempotency…).

## 1. Executive Summary

**Hiện trạng**: `apps-script/main-control` đang đóng vai trò “Core runtime + Level6 hardening + CONFIG module manager + WebApp gateway + một phần HOSO setup”. Một số capability Control Plane đã có nền tảng tốt (Core sheets, registry, event bus/worker, command router + idempotency, health), nhưng contract WebApp và cơ chế Connection Package còn ở mức “tối thiểu để HO_SO chạy”, chưa đủ để làm Authority chuẩn cho nhiều module độc lập (HO_SO, TASK, FINANCE, INVOICE_MEMBER).

**Điểm mạnh nổi bật**:
- **Core V2 sheets + headers chuẩn hóa** có sẵn: `CBV_MODULE_REGISTRY`, `CBV_EVENT_QUEUE`, `CBV_EVENT_LOG`, `CBV_COMMAND_LOG`, `CBV_AUDIT_LOG`, `CBV_IDEMPOTENCY`, `CBV_SYSTEM_HEALTH`, `CBV_CONFIG_REGISTRY` (bootstrap idempotent).
- **Idempotency cho command dispatch** đã tồn tại ở tầng `CBV_CoreV2_dispatch` (ghi `CBV_IDEMPOTENCY` và log `DUPLICATE` vào `CBV_COMMAND_LOG`).
- **Event queue worker** có retry + dead-letter, có hook policy Level6 (`CBV_L6_getRetryPolicy`, `CBV_L6_computeNextRunAt`, `CBV_L6_shouldDeadLetter`) và có dispatch tới consumers (`CBV_L6_dispatchEventToConsumers`) nếu có.
- **WebApp gateway MAIN_CONTROL** đã có **token gate** (`CBV_MAIN_WEBAPP_TOKEN`) và response shape thống nhất (`MC_stdResponse_`).

**Điểm yếu/rủi ro chính (Control Plane readiness)**:
- **MAIN_CONTROL WebApp “access ANYONE_ANONYMOUS”** (Apps Script webapp), an toàn phụ thuộc hoàn toàn vào token trong payload/query-string. Nếu token lộ → toàn hệ thống bị chi phối (issue package, register module, ingest event).
- **Connection Package hiện tại thiếu trường quan trọng** (envCode/status/moduleWebAppUrl/mainControlWebAppUrl ổn định/versioning/issuedAt/expiresAt semantics chuẩn), **không lưu package** vào sheet (audit/rotation/traceability yếu), **có fallback ScriptProperties** cho `moduleDbId`.
- **Module Registry schema bị “patch-on-the-fly”**: `MC_upsertModuleRegistry_` tự append cột `MODULE_DB_ID` khi thiếu (khác chuẩn header trong `CBV_CORE_V2.HEADERS.MODULE_REGISTRY`), tạo rủi ro schema drift.
- **Ingest event** chưa theo event envelope chuẩn (thiếu eventId/correlationId/idempotencyKey/sourceEventId…), chưa có idempotency cho event ingest.
- **WebApp chưa có DISPATCH_COMMAND** (router/command plane chưa “public contract” cho module remote).
- **CONFIG module** đang nằm trong main-control và có menu/handler riêng, khiến MAIN_CONTROL “lệch” khỏi định hướng “không xử lý nghiệp vụ chi tiết”.
- **INVOICE_MEMBER module folder không tồn tại trong repo** (theo scan), nên chưa có baseline để MAIN_CONTROL làm authority cho module này.

**Kết luận kiến trúc**: MAIN_CONTROL đã có “kernel” Control Plane (Core V2 + L6), nhưng cần **chuẩn hóa schema/contract/authority** theo roadmap add-only để trở thành Control Plane chuẩn, đồng thời giảm coupling với CONFIG/HOSO setup.

## 2. Current Files Inventory

### 2.1. Module locations (repo)

| Module | Path | Ghi chú |
|---|---|---|
| MAIN_CONTROL | `apps-script/main-control/src/` | Core V2 + Level6 + CONFIG module + MAIN_CONTROL WebApp + menus |
| CORE_RUNTIME_LIB | `apps-script/core-runtime-lib/src/` | Thư viện core runtime chia sẻ; có trùng nhiều file với main-control |
| HO_SO | `apps-script/hoso/src/` | Có `200_HOSO_V2_WEBAPP.js` gọi MAIN_CONTROL để lấy connection package + ingest event |
| TASK (dự kiến) | `apps-script/task/src/` | Có `appsscript.json`; chưa scan sâu ở báo cáo này (focus MAIN_CONTROL) |
| FINANCE (dự kiến) | `apps-script/finance/src/` | Có `appsscript.json`; chưa scan sâu ở báo cáo này (focus MAIN_CONTROL) |
| INVOICE_MEMBER | *(không thấy)* | Scan `apps-script/**/*invoice*` không có kết quả; cần xác minh/migrate vào repo |

### 2.2. MAIN_CONTROL entrypoints & order

- **Apps Script manifest**: `apps-script/main-control/src/appsscript.json`
  - `webapp.executeAs`: `USER_DEPLOYING`
  - `webapp.access`: `ANYONE_ANONYMOUS`
- **clasp file order**: `apps-script/main-control/.clasp.json.example`
  - Có `filePushOrder` đầy đủ, trong đó WebApp chính là `200_MAIN_CONTROL_WEBAPP.js` + menu `201_MAIN_CONTROL_WEBAPP_MENU.js`.

### 2.3. MAIN_CONTROL file inventory theo nhóm chức năng (đủ “điểm chạm” Control Plane)

> Lưu ý: MAIN_CONTROL có ~112 file JS. Dưới đây là inventory theo từng nhóm, nêu rõ nhiệm vụ và public surface quan trọng.  
> Nguồn thứ tự load: `apps-script/main-control/.clasp.json.example` (ưu tiên coi đó là “canonical order” khi đánh giá dependency).

#### A) Core V2 kernel (Control Plane runtime)

| File | Nhiệm vụ | Public functions (điểm gọi chính) | Helpers/Private đáng chú ý |
|---|---|---|---|
| `03_CBV_CORE_DB_RESOLVER.js` | Resolve Core DB (spreadsheet) qua ScriptProperties | `CBV_CoreV2_setCoreDbId`, `CBV_CoreV2_getCoreDbId` | `cbvCoreV2GetCoreDbId_`, `cbvCoreV2OpenCoreSpreadsheet_` (fallback active spreadsheet) |
| `04_CBV_CORE_DB_SETUP.js` | Create Core DB spreadsheet + set `CBV_CORE_DB_ID` | `CBV_CoreV2_createCoreDb` | — |
| `00_CBV_CORE_V2_CONSTANTS.js` | Names/headers/statuses seed module registry | — | `CBV_CORE_V2.SHEETS`, `CBV_CORE_V2.HEADERS`, `MODULE_SEED_ROWS`, status enums |
| `10_CBV_CORE_V2_BOOTSTRAP.js` | Ensure Core sheets + seed registry | `CBV_CoreV2_bootstrap` | — |
| `70_CBV_CORE_V2_REGISTRY.js` | Module registry read/seed/register | `CBV_CoreV2_registerModule` | `cbvCoreV2RegistryGetModule_`, `cbvCoreV2RegistrySeed_` |
| `21_CBV_CORE_V2_COMMAND_LOG.js` | Append/update `CBV_COMMAND_LOG` | (public wrappers nếu có trong file; dùng bởi router) | — |
| `22_CBV_CORE_V2_IDEMPOTENCY.js` | Idempotency store `CBV_IDEMPOTENCY` | (được router gọi) | `cbvCoreV2IdempotencyFindSuccess_`, `cbvCoreV2IdempotencyUpsert_` |
| `20_CBV_CORE_V2_COMMAND_ROUTER.js` | Dispatch command tới module handler + permission + log + idempotency | `CBV_CoreV2_dispatch` | `cbvCoreV2NormalizeCommand_`, `cbvCoreV2ValidateCommand_`, legacy map `cbvHosoMapLegacyCommandType_` |
| `30_CBV_CORE_V2_EVENT_BUS.js` | Emit event → log + queue | `CBV_CoreV2_emitEvent` | `cbvCoreV2NormalizeEvent_`, `cbvCoreV2ValidateEvent_`, `cbvCoreV2EmitEventInternal_` |
| `31_CBV_CORE_V2_EVENT_WORKER.js` | Worker consume `CBV_EVENT_QUEUE` | `CBV_CoreV2_runEventWorker` | `cbvCoreV2ResolveEventHandler_`, `cbvCoreV2EventWorkerProcessOne_` |
| `40_CBV_CORE_V2_AUDIT.js` | Append `CBV_AUDIT_LOG` | (public wrappers nếu có) | — |
| `50_CBV_CORE_V2_PERMISSION.js` | Permission guard (core) | (được router gọi) | `cbvCoreV2PermissionGuard_` |
| `60_CBV_CORE_V2_HEALTH.js` | Health check core sheets + write `CBV_SYSTEM_HEALTH` | `CBV_CoreV2_healthCheck` | `cbvCoreV2HealthWrite_` |

#### B) MAIN_CONTROL WebApp (Gateway tối thiểu)

| File | Nhiệm vụ | Public entrypoints | Ghi chú rủi ro |
|---|---|---|---|
| `200_MAIN_CONTROL_WEBAPP.js` | doGet/doPost serve JSON, token gate, issue connection package, register module, ingest event | `doGet`, `doPost` | WebApp `ANYONE_ANONYMOUS`; token là “single factor”; package không được store/audit đầy đủ; ingest event chưa theo envelope chuẩn |
| `201_MAIN_CONTROL_WEBAPP_MENU.js` | UI menu để set token + test + view/reset registry | `buildMainControlWebAppMenu_` + `MC_WebApp_menu*` | menu có thao tác reset registry HO_SO_V2 |

#### C) CONFIG module (đang “nằm trong” MAIN_CONTROL)

| File | Nhiệm vụ | Public/Handlers | Notes |
|---|---|---|---|
| `160_CBV_CONFIG_MODULE_CONSTANTS.js` | Khai báo bảng CONFIG DB + headers | — | CONFIG DB sống ở spreadsheet `CBV_CONFIG_DB_ID` (không phải Core DB) |
| `150_CBV_CONFIG_RESOLVER.js` | Read config props/env + open CONFIG DB | (various) | ScriptProperties: `CBV_CONFIG_DB_ID`, `CBV_CONFIG_ENV` |
| `161_CBV_CONFIG_MODULE_BOOTSTRAP.js` | Ensure sheets + seed defaults + register CONFIG module vào Core registry + register consumer | `CBV_ConfigModule_bootstrap` | Có hook Level6 event consumer registration (`CONFIG_CHANGED_HANDLER`) |
| `162_CBV_CONFIG_MODULE_HANDLER.js` | Command handler cho CONFIG: set value, register module/sheet, enums, rules, feature flags | `ConfigCommandHandler_handle` | Permission gate cho write commands via `CBV_L6_checkPermission` (nếu có) |
| `163_CBV_CONFIG_ENUM.js` | CRUD trên `CONFIG_ENUM` + audit change | (functions Config_* trong file) | Có return object chuẩn `{ok, entityType, entityId…}` nhưng không phải `MC_stdResponse_` |
| `164_CBV_CONFIG_RULE.js` | CRUD trên `CONFIG_RULE` + audit change | — | — |
| `165_CBV_CONFIG_AUDIT.js` | ACCESS_LOG/CHANGE_LOG writer | — | — |
| `166_CBV_CONFIG_HEALTH.js` | Health check CONFIG DB (sheets + headers + semantic) | — | — |
| `167_CBV_CONFIG_MENU.js` | UI menu CONFIG (dispatch qua `CBV_CoreV2_dispatch`) | `buildConfigMenu_` + `Config_menu*` | MAIN_CONTROL hiện vẫn mang UI/ops của CONFIG |
| `169_CBV_CONFIG_VALIDATOR.js` | Validate payload (ví dụ moduleCode required) | — | — |
| `170_CBV_CONFIG_CONSUMER.js` | Consumer cho `CONFIG_CHANGED` | — | Depends Level6 consumer infra |
| `196..201_CBV_CONFIG_V22_IMPORT_*.js` | Import toolchain V1 → V2_2 | menus + apply/verify | Thuộc “ops tooling” hơn là Control Plane |
| `180..182_HOSO_CONFIG_*.js` | Adapter/health/migration test cho HOSO dùng config tracked | `HOSO_Config_*` | Là coupling HOSO vào MAIN_CONTROL |

#### D) Level 6 hardening / governance (nhiều file)

Các file nhóm `130..140_CBV_LEVEL6_*.js` cung cấp schema registry, migration, error code/log, permission advanced, retry policy, event consumer, backup/rollback, dev governance, hardening tests/menu. Đây là nền tảng tốt cho Control Plane, nhưng cần “đóng gói” lại để MAIN_CONTROL trở thành **control-only** thay vì vừa control vừa business ops.

### 2.4. Core Runtime Lib dependency

`apps-script/core-runtime-lib` chứa nhiều file trùng tên với MAIN_CONTROL Core V2 (`00_CBV_CORE_V2_CONSTANTS.js`, `10_BOOTSTRAP`, `20_ROUTER`, `30_EVENT_BUS`, `31_EVENT_WORKER`, `40_AUDIT`, `60_HEALTH`, `70_REGISTRY`, `22_IDEMPOTENCY`…).

Rủi ro kiến trúc:
- **Duplicate sources** (core logic tồn tại ở cả MAIN_CONTROL project và library) có thể gây drift version.
- **PropertiesService trong library** thuộc project library, không phải project host (đã cảnh báo trong `apps-script/core-runtime-lib/README.md`). Nếu module dùng library trực tiếp mà không có host bridge → dễ đọc sai `CBV_CORE_DB_ID`.

## 3. Current Database / Sheet Schema

### 3.1. Tổng quan “DB surfaces”

MAIN_CONTROL hiện chạm tới 2 “DB” khác nhau:

1) **Core DB** (spreadsheet id từ `CBV_CORE_DB_ID`) – nơi chứa control-plane runtime tables (core sheets).  
2) **CONFIG DB** (spreadsheet id từ `CBV_CONFIG_DB_ID`) – nơi chứa source-of-truth cấu hình (`CONFIG_*`).

Ngoài ra, MAIN_CONTROL WebApp còn “resolve moduleDbId” theo:
- `CBV_MODULE_REGISTRY` (core DB) hoặc
- ScriptProperties `CBV_<MODULE>_DB_ID` (fallback) – ví dụ `CBV_HO_SO_V2_DB_ID`, `CBV_HOSO_V2_DB_ID`.

### 3.2. Bảng báo cáo sheet MAIN_CONTROL sử dụng (Core DB)

Nguồn header chính: `apps-script/main-control/src/00_CBV_CORE_V2_CONSTANTS.js` (`CBV_CORE_V2.HEADERS`).

| Sheet name | Vai trò | Header (từ constants) | Tạo bởi | Đọc bởi | Ghi bởi | Runtime data? | Config SoT? | Rủi ro |
|---|---|---|---|---|---|---|---|---|
| `CBV_MODULE_REGISTRY` | Module Registry | `MODULE_CODE, MODULE_NAME, STATUS, VERSION, ENTRY_HANDLER, OWNER, IS_LEVEL6, CREATED_AT, UPDATED_AT` | `CBV_CoreV2_bootstrap`, `cbvCoreV2EnsureCoreSheet_` | `cbvCoreV2RegistryGetModule_`, `MC_lookupModuleDbIdFromRegistry_` | `CBV_CoreV2_registerModule`, `cbvCoreV2RegistrySeed_`, `MC_upsertModuleRegistry_` | Mixed | Một phần (module metadata) | **Schema drift**: `MC_upsertModuleRegistry_` tự add `MODULE_DB_ID` không nằm trong HEADERS → không được bootstrap quản lý |
| `CBV_COMMAND_LOG` | Command log | `COMMAND_ID, COMMAND_TYPE, MODULE_CODE, SOURCE, REQUEST_BY, PAYLOAD_JSON, IDEMPOTENCY_KEY, STATUS, RESULT_JSON, ERROR_CODE, ERROR_MESSAGE, CREATED_AT, STARTED_AT, FINISHED_AT` | `CBV_CoreV2_bootstrap` | (router/ops) | `CBV_CoreV2_dispatch` (append + update), `MC_auditWebAppTry_` | Yes | No | PII/log growth; audit currently piggybacks here |
| `CBV_IDEMPOTENCY` | Idempotency store | `IDEMPOTENCY_KEY, COMMAND_TYPE, MODULE_CODE, STATUS, COMMAND_ID, RESULT_JSON, CREATED_AT, EXPIRED_AT` | `CBV_CoreV2_bootstrap` | `cbvCoreV2IdempotencyFindSuccess_` | `cbvCoreV2IdempotencyUpsert_` | Yes | No | Chưa thấy cleanup/TTL enforce; `EXPIRED_AT` có nhưng không dùng |
| `CBV_EVENT_LOG` | Event log append-only | `EVENT_ID, EVENT_TYPE, MODULE_CODE, ENTITY_TYPE, ENTITY_ID, SOURCE_COMMAND_ID, PAYLOAD_JSON, CREATED_AT, CREATED_BY` | `CBV_CoreV2_bootstrap` | ops | `CBV_CoreV2_emitEvent`, `MC_appendEventLogRowTry_` | Yes | No | Envelope mỏng; thiếu correlation/idempotency |
| `CBV_EVENT_QUEUE` | Event queue | `EVENT_ID, EVENT_TYPE, MODULE_CODE, ENTITY_TYPE, ENTITY_ID, SOURCE_COMMAND_ID, PAYLOAD_JSON, STATUS, RETRY_COUNT, NEXT_RUN_AT, ERROR_CODE, CREATED_AT, PROCESSED_AT` | `CBV_CoreV2_bootstrap` | worker | `CBV_CoreV2_emitEvent`, `CBV_CoreV2_runEventWorker` | Yes | No | Worker không idempotent theo sourceEventId; risk duplicate processing |
| `CBV_AUDIT_LOG` | Audit log “field-level” | `AUDIT_ID, MODULE_CODE, ENTITY_TYPE, ENTITY_ID, ACTION, FIELD_NAME, OLD_VALUE, NEW_VALUE, ACTOR_EMAIL, SOURCE, COMMAND_ID, CREATED_AT` | `CBV_CoreV2_bootstrap` | ops | `40_CBV_CORE_V2_AUDIT.js` | Yes | No | MAIN_CONTROL WebApp audit đang ghi vào COMMAND_LOG, không thống nhất AUDIT_LOG |
| `CBV_SYSTEM_HEALTH` | Health center log | `CHECK_ID, MODULE_CODE, CHECK_NAME, SEVERITY, STATUS, MESSAGE, LAST_CHECK_AT, PAYLOAD_JSON` | `CBV_CoreV2_bootstrap` | ops | `CBV_CoreV2_healthCheck` (append) | Yes | No | Append-only growth |
| `CBV_CONFIG_REGISTRY` | Config registry (core side) | `CONFIG_KEY, MODULE_CODE, CONFIG_TYPE, CONFIG_JSON, IS_ACTIVE, UPDATED_AT` | `CBV_CoreV2_bootstrap` | (chưa thấy dùng rõ trong MAIN_CONTROL WebApp) | (chưa thấy writer trong phần đã đọc) | Mixed | Potential SoT (nếu dùng) | Hiện chưa có contract rõ; risk “dead table” |

### 3.3. Bảng báo cáo sheet MAIN_CONTROL sử dụng (CONFIG DB)

Nguồn header: `apps-script/main-control/src/160_CBV_CONFIG_MODULE_CONSTANTS.js`.

| Sheet name | Vai trò | Header (từ constants) | Tạo bởi | Đọc bởi | Ghi bởi | Runtime data? | Config SoT? | Rủi ro |
|---|---|---|---|---|---|---|---|---|
| `CONFIG_ENV` | Config key/value theo env | `ENV_CODE, CONFIG_KEY, CONFIG_VALUE, IS_ACTIVE, UPDATED_AT` | `CBV_ConfigModule_bootstrap` (ensure) | config resolver/handler | `Config_setValue_` | No | **Yes** | Key drift; thiếu schema migration contract versioning |
| `CONFIG_MODULE` | Module config registry | `MODULE_CODE, DISPLAY_NAME, ACTIVE_VERSION, DB_CONFIG_KEY, STATUS` | bootstrap ensure/seed | handler | `Config_registerModule_` | No | **Yes** | Duplicates với `CBV_MODULE_REGISTRY` (core) nếu không tách trách nhiệm rõ |
| `CONFIG_SHEET_REGISTRY` | Map logical table → sheet name | `MODULE_CODE, TABLE_CODE, SHEET_NAME, STATUS` | bootstrap ensure | resolver/health/tests | `Config_registerSheet_` | No | **Yes** | Nếu thiếu row MASTER → fallback nguy hiểm (được nhắc trong hardening tests) |
| `CONFIG_ENUM` | Enum dictionary | `ENUM_ID, ENUM_GROUP, ENUM_KEY, ENUM_VALUE, STATUS, CREATED_AT, UPDATED_AT` | bootstrap ensure/seed | enum API | add/update enum | No | Yes | Data quality / duplicates |
| `CONFIG_RULE` | Rules | `RULE_ID, MODULE_CODE, RULE_KEY, RULE_TYPE, RULE_JSON, STATUS, CREATED_AT, UPDATED_AT` | bootstrap ensure/seed | rule engine | add rule | No | Yes | Rule JSON validation/compat |
| `CONFIG_FEATURE_FLAG` | Feature flags | `FLAG_KEY, FLAG_VALUE, STATUS, UPDATED_AT, UPDATED_BY` | ensure | consumers | set flag | No | Yes | Không có env scoping; risk global toggle |
| `CONFIG_ACCESS_LOG` | audit access | `LOG_ID, ACTOR_EMAIL, ACTION, RESOURCE_TYPE, RESOURCE_KEY, PAYLOAD_JSON, COMMAND_ID, CREATED_AT` | ensure | ops | `Config_logAccess_` (từ handler) | Yes | No | Growth |
| `CONFIG_CHANGE_LOG` | audit changes | `CHANGE_ID, ACTOR_EMAIL, CHANGE_TYPE, RESOURCE_TYPE, RESOURCE_KEY, OLD_VALUE, NEW_VALUE, COMMAND_ID, PAYLOAD_JSON, CREATED_AT` | ensure | ops | `Config_logChange_` | Yes | No | Growth |

### 3.4. Script Properties MAIN_CONTROL đang dùng (đã thấy trong code scan)

| Key | Vai trò | Được đọc ở | Được ghi ở | Rủi ro |
|---|---|---|---|---|
| `CBV_CORE_DB_ID` | Core DB spreadsheet id | `03_CBV_CORE_DB_RESOLVER.js`, `MC_getConnectionPackage_` | `CBV_CoreV2_createCoreDb`, `CBV_CoreV2_setCoreDbId` | Nếu unset → fallback active spreadsheet (nguy hiểm khi chạy từ sheet khác) |
| `CBV_CONFIG_DB_ID` | CONFIG DB spreadsheet id | `MC_getConnectionPackage_`, config module | `151_CBV_HOSO_V2_2_SETUP.js` (setup), manual | Nếu unset → CONFIG module không hoạt động |
| `CBV_CONFIG_ENV` | env code cho config resolver | `150_CBV_CONFIG_RESOLVER.js` | (có menu/setter?) | Default/fallback có thể lệch môi trường |
| `CBV_MAIN_WEBAPP_TOKEN` | Token auth cho MAIN_CONTROL WebApp | `200_MAIN_CONTROL_WEBAPP.js`, HO_SO WebApp calls | `MC_WebApp_menuSetToken` | Single secret; nếu lộ → full compromise |
| `CBV_MAIN_CONTROL_WEBAPP_URL` | MAIN_CONTROL WebApp URL override | `MC_getMainWebAppUrl_`, HO_SO uses `CBV_MAIN_CONTROL_WEBAPP_URL` | HO_SO menu set, manual | Fallback `ScriptApp.getService().getUrl()` có thể rỗng/khác env |
| `CBV_<MODULE>_DB_ID` variants | Fallback moduleDbId (khi registry thiếu) | `MC_lookupModuleDbIdFromScriptProps_` | manual | Drift, khó audit; tạo “side-channel” bypass registry |

## 4. Current WebApp Contract

Nguồn: `apps-script/main-control/src/200_MAIN_CONTROL_WEBAPP.js`.

### 4.1. Response format

**Đã có** chuẩn response riêng: `MC_stdResponse_(ok, code, message, data, error)` → shape:
- `ok: boolean`
- `code: string`
- `message: string`
- `data: object`
- `error: object | null` (thường `{code,message,stack}`)

### 4.2. Auth / validation / logging hiện tại

- **Auth**: token compare với ScriptProperties `CBV_MAIN_WEBAPP_TOKEN` (`MC_assertWebAppToken_`).  
- **Audit/log**: `MC_auditWebAppTry_` cố gắng ghi vào `CBV_COMMAND_LOG`; fallback ghi `CBV_EVENT_LOG` nếu COMMAND_LOG fail.
- **Validate action**: unknown action trả `UNKNOWN_ACTION`.
- **Validate moduleCode**: hiện chỉ normalize `moduleCode` upper-case; map `HO_SO`/`HOSO` → `HO_SO_V2`. Không có allowlist module codes.
- **Idempotency**: **chưa** có idempotency key cho WebApp actions; chỉ command dispatch (core router) có idempotency.
- **Error logging**: có try/catch top-level `doGet`/`doPost` trả `WEBAPP_ERROR` kèm stack.

### 4.3. Action matrix (bảng bắt buộc)

| Action | Method | Mục đích | Input | Output | Hàm xử lý | Độ ổn định | Rủi ro | Cần sửa gì |
|---|---|---|---|---|---|---:|---|---|
| `ping` | GET | Liveness ping | query: `token`, `action=ping` | `MC_stdResponse_` | `MC_WebApp_doGet_` | Cao | WebApp public | OK |
| `health` | GET | Health payload (props + core spreadsheet ok) | query: `token`, `action=health` | `MC_healthPayload_` | `MC_WebApp_doGet_` | Trung | Chỉ check “has props” + “open core ok”, chưa check sheets/headers | Nâng `health` dùng `CBV_CoreV2_healthCheck` + module health summary |
| `getconnectionpackage` | GET | Issue connection package | query: `token`, `action=getconnectionpackage`, `module/moduleCode` | `CONNECTION_PACKAGE_ISSUED` | `MC_getConnectionPackage_` | Trung | Package thiếu trường; fallback ScriptProps; TTL semantics chưa rõ | Chuẩn hóa envelope/package, store+rotate, validate moduleCode |
| `GET_CONNECTION_PACKAGE` | POST | Same as above | JSON `{action, token, moduleCode}` | same | `MC_WebApp_doPost_` | Trung | như trên | như trên |
| `HEALTH_CHECK` | POST | same as GET health | `{action:'HEALTH_CHECK', token}` | health payload | `MC_WebApp_doPost_` | Trung | chưa deep health | align với `health` |
| `REGISTER_MODULE` | POST | Upsert module registry row + set moduleDbId | `{action, token, moduleCode, moduleDbId}` | `MODULE_REGISTERED` | `MC_upsertModuleRegistry_` | Thấp-Trung | Schema drift (MODULE_DB_ID col), thiếu allowlist/ownership/permission | Đưa register vào core registry chuẩn + audit + permission + idempotency |
| `INGEST_EVENT` | POST | Ingest event từ module vào Core event bus (log+queue) | `{action, token, eventType, moduleCode, entityType, entityId, sourceCommandId?, payload?, createdBy?}` | `EVENT_INGESTED`/error | `MC_ingestEvent_` → `CBV_CoreV2_emitEvent` | Trung | Envelope mỏng; không idempotency; correlation absent | Chuẩn hóa event envelope + idempotency + audit |

**Thiếu so với mục tiêu**:
- `DISPATCH_COMMAND` (POST) chưa có.
- `REGISTER_MODULE` hiện ghi trực tiếp vào registry theo kiểu riêng, chưa dùng `CBV_CoreV2_registerModule`/contract chuẩn.

## 5. Current Connection Package Mechanism

Nguồn: `MC_getConnectionPackage_` trong `200_MAIN_CONTROL_WEBAPP.js` và HO_SO client `apps-script/hoso/src/200_HOSO_V2_WEBAPP.js`.

### 5.1. MAIN_CONTROL đã “cấp package” chưa?

**Có.** `MC_getConnectionPackage_(moduleCode)` trả `MC_stdResponse_(true,'CONNECTION_PACKAGE_ISSUED',...)` gồm:

- `data.moduleCode`
- `data.issuedAt`
- `data.expiresAt` (now + 24h)
- `data.package`:
  - `coreDbId` (ScriptProperties `CBV_CORE_DB_ID` hoặc `cbvCoreV2GetCoreDbId_` nếu có)
  - `configDbId` (ScriptProperties `CBV_CONFIG_DB_ID`)
  - `moduleDbId` (lookup registry; fallback ScriptProperties `CBV_<MODULE>_DB_ID`)
  - `moduleCode`
  - `mainControlWebAppUrl` (ScriptProperties `CBV_MAIN_CONTROL_WEBAPP_URL` hoặc `ScriptApp.getService().getUrl()`)
  - `version: '1.0.0'`

**Chưa có**: `moduleWebAppUrl`, `envCode`, `status`, `issuedAt/expiresAt` nằm trong `package` object, `coreDbId/configDbId` provenance, signature, storage.

### 5.2. Package hiện được store ở đâu?

- MAIN_CONTROL: **không thấy** lưu package JSON vào sheet hay ScriptProperties. (Issue-on-demand)
- HO_SO module: **có cache** vào ScriptProperties:
  - `CBV_HOSO_CONNECTION_PACKAGE_JSON`
  - `CBV_HOSO_CONNECTION_PACKAGE_UPDATED_AT`

### 5.3. Module HO_SO đang lấy package thế nào?

HO_SO gọi MAIN_CONTROL WebApp:
- `POST action=GET_CONNECTION_PACKAGE` (kèm `CBV_MAIN_WEBAPP_TOKEN`)
- HO_SO còn **self-register** trước khi fetch: `POST action=REGISTER_MODULE` với `moduleDbId` là bound spreadsheet id.
- HO_SO có auto-refresh theo TTL 6h (`HOSO_PACKAGE_STALE_MS_`) và retry fetch 1 lần nếu `moduleDbId` rỗng.

### 5.4. Đánh giá gap vs “Connection Package Authority” mục tiêu

**Hiện có**: issue + expiresAt + main url + moduleDbId discovery.  
**Thiếu**: authority semantics (status/rotation/revocation), auditing, versioning, env scoping, moduleWebAppUrl, config/core/module DB relationships, tamper protection (signature), storage for traceability.

### 5.5. Đề xuất chuẩn package mới (theo yêu cầu)

Đề xuất giữ JSON shape theo bạn đưa, cộng thêm “extras” (optional) để nâng cấp dần, add-only:

```json
{
  "moduleCode": "TASK",
  "moduleName": "Task Module",
  "envCode": "PROD",
  "moduleDbId": "",
  "moduleWebAppUrl": "",
  "mainControlWebAppUrl": "",
  "configDbId": "",
  "coreDbId": "",
  "version": "1.0.0",
  "issuedAt": "",
  "expiresAt": "",
  "status": "ACTIVE"
}
```

Gợi ý add-only (phase D):
- `packageId`, `issuer`, `signature` (HMAC) để chống sửa gói.
- `scopes` (READ_CONFIG, EMIT_EVENT, DISPATCH_COMMAND…).
- `registryRowRef` để truy xuất trace.

## 6. Current Event / Command Flow

### 6.1. Event queue/log ở đâu?

- Core DB sheets:
  - `CBV_EVENT_LOG` (append in `CBV_CoreV2_emitEvent`)
  - `CBV_EVENT_QUEUE` (append in `CBV_CoreV2_emitEvent`)
- Worker: `CBV_CoreV2_runEventWorker` (scan queue PENDING/FAILED) + retry/dead-letter.

### 6.2. Event format hiện tại
Event “chuẩn hiện tại” của Core V2 (khi gọi `CBV_CoreV2_emitEvent`) là object (normalized) với các field:
- `eventType` (required)
- `moduleCode` (required)
- `entityType` (required)
- `entityId` (required)
- `sourceCommandId` (optional)
- `payload` (object)
- `createdBy` (default `cbvUser()`)

Khi persist:
- `CBV_EVENT_LOG` lưu `EVENT_ID` (generated), `EVENT_TYPE`, `MODULE_CODE`, `ENTITY_TYPE`, `ENTITY_ID`, `SOURCE_COMMAND_ID`, `PAYLOAD_JSON`, `CREATED_AT`, `CREATED_BY`.
- `CBV_EVENT_QUEUE` lưu tương tự + `STATUS`, `RETRY_COUNT`, `NEXT_RUN_AT`, `ERROR_CODE`, `PROCESSED_AT`.

So với “event envelope” mục tiêu (bạn yêu cầu), hiện tại **thiếu**: `eventId` (input), `sourceEventId`, `correlationId`, `idempotencyKey`, `createdAt`/`createdBy` chuẩn hóa theo envelope, `payload` typed.

### 6.3. Module nào đang emit event về MAIN_CONTROL?

**Đã thấy rõ**: `HO_SO` WebApp (`apps-script/hoso/src/200_HOSO_V2_WEBAPP.js`) gọi MAIN_CONTROL WebApp action `INGEST_EVENT` với body:
- `eventType`, `moduleCode: 'HO_SO_V2'`, `entityType`, `entityId`, `sourceCommandId`, `payload`, `createdBy`.

Ngoài ra, trong MAIN_CONTROL nội bộ, CONFIG module emit `CONFIG_CHANGED` bằng `CBV_CoreV2_emitEvent`.

### 6.4. MAIN_CONTROL có ingest event chưa? Có worker xử lý event chưa?

- **Ingest event (WebApp)**: Có `MC_ingestEvent_` → gọi `CBV_CoreV2_emitEvent` (ghi log+queue).
- **Worker**: Có `CBV_CoreV2_runEventWorker` với retry/dead-letter.

**Điểm thiếu**:
- Ingest event chưa có idempotency theo `SOURCE_EVENT_ID`/`IDEMPOTENCY_KEY`.
- Worker không có “exactly once”; chưa có correlation/tracing.

### 6.5. Command router hiện trạng + idempotency

**Command plane core** đã có:
- `CBV_CoreV2_dispatch(command)`:
  - Validate fields (`commandType`, `moduleCode`, `source`, `requestBy`)
  - Auto-generate `idempotencyKey` nếu thiếu
  - Check `CBV_IDEMPOTENCY` (SUCCESS) và trả lại `RESULT_JSON` nếu duplicate
  - Append/update `CBV_COMMAND_LOG` lifecycle (RECEIVED → PROCESSING → SUCCESS/FAILED/DUPLICATE)
  - Permission guard `cbvCoreV2PermissionGuard_` (core) + module handler lookup từ `CBV_MODULE_REGISTRY.ENTRY_HANDLER`
  - Nếu ok → upsert idempotency SUCCESS

**Nhưng** MAIN_CONTROL WebApp chưa expose action `DISPATCH_COMMAND` nên các module độc lập chưa thể gọi command router một cách chuẩn từ xa.

### 6.6. Đề xuất chuẩn Event/Command envelopes (theo yêu cầu)

Event envelope mục tiêu:

```json
{
  "eventId": "",
  "eventType": "",
  "moduleCode": "",
  "entityType": "",
  "entityId": "",
  "sourceEventId": "",
  "correlationId": "",
  "idempotencyKey": "",
  "payload": {},
  "createdAt": "",
  "createdBy": ""
}
```

Command envelope mục tiêu:

```json
{
  "commandId": "",
  "command": "",
  "targetModule": "",
  "sourceModule": "MAIN_CONTROL",
  "idempotencyKey": "",
  "correlationId": "",
  "payload": {},
  "createdAt": "",
  "createdBy": ""
}
```

Mapping đề xuất (add-only) để tương thích với core hiện tại:
- `command` → map sang `commandType` (core)
- `targetModule` → map sang `moduleCode` (core)
- `sourceModule` → map sang `source` (core) và `requestBy` (actor email) tách riêng
- Event envelope ingest sẽ map sang `CBV_CoreV2_emitEvent` nhưng lưu thêm các field mới trong `PAYLOAD_JSON` nếu chưa mở rộng schema.

## 7. Gap Analysis vs Target Control Plane

Mục tiêu Control Plane (bạn định nghĩa): Module Registry, Connection Package Authority, Config Center, Event Gateway, Command Router, Audit Center, Health Center.

> Thang “mức độ hoàn thiện” dựa trên: có sheet/schema, có API/contract, có auth/idempotency/audit, có test/health, có backward compatibility.

| Capability | Đã có chưa | Hoàn thiện (0-100) | File/hàm liên quan | Thiếu gì | Rủi ro nếu tách TASK/FINANCE ngay | Việc cần làm trước |
|---|---:|---:|---|---|---|---|
| **1) Module Registry** | Có | 55% | `70_CBV_CORE_V2_REGISTRY.js`, `00_CBV_CORE_V2_CONSTANTS.js`, `200_MAIN_CONTROL_WEBAPP.js` (`MC_upsertModuleRegistry_`) | Chuẩn schema (thêm `MODULE_DB_ID`/`MODULE_WEBAPP_URL`/`ENV_CODE`…), permission/ownership, API register chuẩn, avoid schema drift | TASK/FINANCE không resolve đúng handler/db/url; registry bị “patch” lệch | Chuẩn hóa registry schema + API `REGISTER_MODULE` dùng core register + audit + idempotency |
| **2) Connection Package Authority** | Có (min) | 35% | `MC_getConnectionPackage_`, HO_SO `HOSO_refreshConnectionPackage_` | package schema chuẩn, store+rotate+revoke, validate moduleCode/env, signature, moduleWebAppUrl | Module có thể chạy với DB_ID sai (fallback ScriptProps), khó trace; token leak = compromise | Thêm `CBV_CONNECTION_PACKAGE` store + rotate + validate |
| **3) Config Center** | Có (nhưng “dính business ops”) | 60% | `160..170_CBV_CONFIG_*` | Tách rõ core config registry vs CONFIG DB; chuẩn contract “read-only config API” cho module; harden auth | TASK/FINANCE không có config authority; config & control plane lẫn nhau | Định nghĩa “Config API surface” và policy; giảm coupling menu/tooling trong main-control |
| **4) Event Gateway** | Có (min) | 55% | `30_EVENT_BUS`, `31_EVENT_WORKER`, `200_MAIN_CONTROL_WEBAPP.js` ingest | Envelope chuẩn, idempotency, correlation, module allowlist, audit/event DLQ observability | Event duplicate/poison; khó trace; module emit sai format làm queue lỗi | Chuẩn hóa ingest contract + idempotency sheet/key + DLQ ops |
| **5) Command Router** | Có (core) | 70% | `20_CBV_CORE_V2_COMMAND_ROUTER.js` | WebApp exposure `DISPATCH_COMMAND`, auth/scopes, correlationId propagation, handler contract versioning | Module split không gọi được command router từ xa; thiếu stable remote API | Add `DISPATCH_COMMAND` action (add-only) + token scope + idempotency key requirement |
| **6) Audit Center** | Có (một phần) | 45% | `40_CBV_CORE_V2_AUDIT.js`, CONFIG access/change logs, WebApp audit → COMMAND_LOG | Chuẩn hóa audit event vs audit log; unify MC audit vào `CBV_AUDIT_LOG`; correlation to command/event | Nếu split: khó điều tra incident; audit phân mảnh (COMMAND_LOG vs AUDIT_LOG vs CONFIG_CHANGE_LOG) | Chuẩn hóa audit writer + “audit policy” + minimal required fields |
| **7) Health Center** | Có (core) | 65% | `60_CBV_CORE_V2_HEALTH.js`, `MC_healthPayload_` | WebApp health deep checks, per-module health registry, health snapshot + SLO | Split: module live nhưng control-plane degraded không phát hiện sớm | Nâng `health` endpoint + `CBV_SYSTEM_HEALTH` taxonomy + dashboards |

## 8. Risks Before Splitting TASK and FINANCE

### 8.1. Rủi ro kỹ thuật (ưu tiên cao)

- **R1 — Token compromise (single factor)**: WebApp `ANYONE_ANONYMOUS` + token trong request → nếu token lộ, attacker có thể `REGISTER_MODULE`, `INGEST_EVENT`, lấy package… ảnh hưởng toàn hệ.
- **R2 — Registry schema drift**: `MC_upsertModuleRegistry_` tự append `MODULE_DB_ID` ngoài chuẩn headers → bootstrap/health không kiểm soát, dẫn tới module resolution không ổn định.
- **R3 — ModuleDbId fallback ScriptProperties**: cho phép bypass registry (side-channel), tạo cấu hình “ẩn”, khó audit/rollback.
- **R4 — No idempotency for ingest event**: ingest event có thể được gọi lặp (retry network) → queue duplicate → worker xử lý lặp.
- **R5 — No DISPATCH_COMMAND WebApp**: split module sẽ thiếu “remote command plane” chuẩn; dễ phát sinh ad-hoc UrlFetch endpoints khác nhau.
- **R6 — Core DB resolver fallback active spreadsheet**: nếu `CBV_CORE_DB_ID` unset/nhầm, core sẽ open active spreadsheet → nguy cơ ghi nhầm dữ liệu vào sheet đang mở.
- **R7 — INVOICE_MEMBER chưa tồn tại trong repo**: thiếu baseline; mọi thiết kế authority cho module này hiện là giả định.

### 8.2. Rủi ro vận hành

- **R8 — Log growth**: COMMAND_LOG/EVENT_LOG/EVENT_QUEUE/SYSTEM_HEALTH/CONFIG_*_LOG append-only; chưa thấy retention/archival.
- **R9 — Duplicate core logic (main-control vs core-runtime-lib)**: drift version gây lỗi khó đoán khi module dùng library khác version.

## 9. Recommended Target Architecture

### 9.1. Nguyên tắc

- **MAIN_CONTROL không xử lý nghiệp vụ chi tiết**: chỉ điều phối (contract + auth + routing + audit + health).
- **Add-only / backward compatible**: action mới song song action cũ; schema mở rộng không phá các sheet hiện hữu.
- **Idempotent-by-default**: mọi WebApp POST cần `idempotencyKey` (hoặc server cấp).
- **Audit-first**: mọi request vào WebApp ghi audit log (command/audit/event) với correlationId.
- **Authority rõ ràng**: registry + package + config chỉ có một “source of truth” và có trace.

### 9.2. Control Plane logical components (mapping vào hiện trạng)

| Component | Trách nhiệm | Hiện trạng | Target update |
|---|---|---|---|
| Module Registry | metadata module + db/url + status + version + handler | `CBV_MODULE_REGISTRY` + seed + `MC_upsert...` | Chuẩn schema + register API + ownership + env |
| Connection Package Authority | issue/store/rotate/validate | `MC_getConnectionPackage_` (issue-only) | Thêm `CBV_CONNECTION_PACKAGE` + validate/sign |
| Config Center | config APIs/read model + config DB ownership | CONFIG module nằm trong main-control | Tách “config read API” (core) vs “config writer module” (ops) + policy |
| Event Gateway | ingest/validate/idempotency/queue/worker/DLQ | Core event bus + worker + ingest action | Chuẩn event envelope + idempotency + DLQ tooling + consumers |
| Command Router | dispatch/permission/idempotency/log | `CBV_CoreV2_dispatch` | Expose WebApp action + scopes + correlation |
| Audit Center | audit policy + unified table + trace | AUDIT_LOG + CONFIG logs + webapp audit to command_log | Chuẩn hóa `CBV_AUDIT_LOG` là trung tâm + map others |
| Health Center | health endpoints + snapshots + registry | Core health check + webapp payload | Health contract + per-module health registry |

## 10. Upgrade Roadmap

> Các phase dưới đây follow đúng yêu cầu: ưu tiên không phá hệ đang chạy, add-only, không rename hàm hiện có.

### Phase A — Audit & Stabilize (không đổi nghiệp vụ)

- Chuẩn hóa diagnostics:
  - `GET health` trả thêm deep check (`CBV_CoreV2_healthCheck`) + module registry summary + config DB availability.
  - Add “schema report” endpoint (read-only) cho Core/CONFIG.
- Quét hardcode/fallback:
  - Đánh dấu rõ các fallback nguy hiểm: active spreadsheet fallback, moduleDbId script props fallback.
- Chuẩn hóa response:
  - Giữ `MC_stdResponse_` làm contract chính cho MAIN_CONTROL WebApp.

### Phase B — Control Plane Schema

- Đảm bảo các sheet lõi (đã có trong bootstrap):
  - Confirm: `CBV_MODULE_REGISTRY`, `CBV_EVENT_QUEUE`, `CBV_EVENT_LOG`, `CBV_COMMAND_LOG`, `CBV_AUDIT_LOG`, `CBV_IDEMPOTENCY`, `CBV_SYSTEM_HEALTH`, `CBV_CONFIG_REGISTRY`.
- Bổ sung (add-only) sheet mới/chuẩn:
  - **`CBV_CONNECTION_PACKAGE`** (mới) để store package JSON + status + expiry + audit refs.
- Chuẩn hóa `CBV_MODULE_REGISTRY`:
  - Đưa `MODULE_DB_ID` vào schema chuẩn (không “append ngầm”), bổ sung `MODULE_WEBAPP_URL`, `ENV_CODE`, `UPDATED_BY`, …

### Phase C — WebApp Contract

Chuẩn hóa doGet/doPost và action set:
- GET:
  - `ping`
  - `health`
  - `getConnectionPackage` (alias hiện có)
- POST:
  - `ping` (optional)
  - `health`
  - `GET_CONNECTION_PACKAGE` (giữ)
  - `REGISTER_MODULE` (giữ, nhưng chuẩn hóa payload + idempotency)
  - `INGEST_EVENT` (giữ, chuẩn envelope)
  - **`DISPATCH_COMMAND`** (mới)
- Chuẩn `MC_stdResponse_` cho mọi output.

### Phase D — Connection Package Authority

- Issue package:
  - Generate package với schema mới (giữ tương thích output cũ trong `data.package`).
- Store package:
  - Lưu vào `CBV_CONNECTION_PACKAGE` (package JSON, issuedAt/expiresAt/status, moduleCode, envCode, packageId).
- Rotate/update:
  - Thêm action `ROTATE_CONNECTION_PACKAGE` (admin only) hoặc rotation policy.
- Validate:
  - Token scopes + signature verify (optional first).
- Test với HO_SO:
  - HO_SO vẫn gọi `GET_CONNECTION_PACKAGE`; MAIN_CONTROL trả thêm fields (add-only).

### Phase E — Event Gateway

- Ingest:
  - Validate envelope chuẩn.
  - **Idempotency** theo `idempotencyKey` hoặc `sourceEventId`.
  - Audit request + correlationId.
- Queue + log:
  - Giữ `CBV_EVENT_QUEUE/LOG`, bổ sung meta fields qua `PAYLOAD_JSON` trước, sau đó mới migrate schema nếu cần.
- Worker:
  - Process-one safe; DLQ tooling; retry policy rõ.

### Phase F — Ready for TASK/FINANCE split

- Checklist điều kiện đạt:
  - Main-control: registry + package + dispatch + ingest event + health + audit đều chuẩn, có allowlist module codes.
  - TASK/FINANCE: có module WebApp token riêng + main-control package flow + basic health.
- Migration plan:
  - Chuyển dần các call “set tay DB_ID” sang package.
- Rollback plan:
  - Quay lại monolith `05_GAS_RUNTIME` deploy (đã mô tả ở migration docs) nếu module split fail.

## 11. Proposed File Changes

> Theo yêu cầu: **chưa code ngay**. Danh sách dưới đây là “đề xuất tạo/sửa” để MAIN_CONTROL trở thành Control Plane chuẩn. Tên file theo convention bạn gợi ý (MC_ prefix) và ưu tiên add-only.

### 11.1. File đề xuất (tạo mới / sửa)

| File | Tạo/Sửa | Mục đích | Hàm public (dự kiến) | Hàm private (dự kiến) | Phụ thuộc | Thứ tự filePushOrder (đề xuất) |
|---|---|---|---|---|---|---|
| `apps-script/main-control/src/000_MC_CORE_UTILS.js` | Tạo | Utils riêng MC (json/now/uuid/response) để tách khỏi `200_MAIN_CONTROL_WEBAPP.js` | `MC_stdResponse_` (move/alias), `MC_now_`, `MC_uuid_` | `MC_json_`, helpers | core utils | very early |
| `apps-script/main-control/src/010_MC_SCHEMA.js` | Tạo | Khai báo schema control-plane (registry/package/idempotency keys) | `MC_Schema_report()` | `mcSchemaEnsure_` | core sheets | early |
| `apps-script/main-control/src/020_MC_BOOTSTRAP_CONTROL_PLANE.js` | Tạo | Bootstrap add-only cho các sheet mới như `CBV_CONNECTION_PACKAGE` | `MC_bootstrapControlPlane()` | — | core bootstrap | after core bootstrap |
| `apps-script/main-control/src/030_MC_MODULE_REGISTRY.js` | Tạo/Sửa | Chuẩn hóa module registry API (DB_ID/URL/env/status) | `MC_registerModule()`, `MC_getModule()` | normalize/validate | core registry | after core registry |
| `apps-script/main-control/src/040_MC_CONNECTION_PACKAGE.js` | Tạo | Authority issue/store/rotate/validate package | `MC_issueConnectionPackage()`, `MC_getConnectionPackage()` | sign/verify | module registry, props | mid |
| `apps-script/main-control/src/050_MC_EVENT_GATEWAY.js` | Tạo | Ingest event envelope chuẩn + idempotency + audit | `MC_ingestEvent()` | validate/enqueue | core event bus, idempotency | mid |
| `apps-script/main-control/src/060_MC_COMMAND_ROUTER.js` | Tạo | Expose dispatch command contract (wrap `CBV_CoreV2_dispatch`) | `MC_dispatchCommand()` | validate/normalize | core router | mid |
| `apps-script/main-control/src/070_MC_AUDIT.js` | Tạo | Unified audit writer for WebApp | `MC_auditRequest()` | redact/normalize | `CBV_AUDIT_LOG` | mid |
| `apps-script/main-control/src/080_MC_HEALTH.js` | Tạo | Health Center endpoint aggregator | `MC_health()` | run checks | core health/config health | mid |
| `apps-script/main-control/src/200_MAIN_CONTROL_WEBAPP.js` | Sửa (minimal) | Router WebApp: map action → các module MC_* | `doGet`, `doPost` | keep token gate | new MC_* files | late |
| `apps-script/main-control/src/900_MC_ADMIN_MENU.js` | Tạo | Admin menu cho registry/package/health | `buildMainControlAdminMenu_` | — | Spreadsheet UI | late |

### 11.2. Ghi chú tương thích

- `MC_getConnectionPackage_` hiện đang được HO_SO gọi gián tiếp qua action `GET_CONNECTION_PACKAGE`. Khi refactor, cần **giữ function/alias** hoặc giữ action cũ route vào implementation mới.
- `REGISTER_MODULE` hiện tác động vào `CBV_MODULE_REGISTRY` theo kiểu riêng (append `MODULE_DB_ID`). Khi chuẩn hóa, vẫn phải đọc được cột này để không mất dữ liệu.

## 12. Test Plan

### 12.1. Smoke tests (manual, không phá prod)

- **WebApp auth**:
  - call `GET ping` với token sai → `UNAUTHORIZED`
  - call `GET ping` với token đúng → `pong`
- **Health**:
  - `GET health` trả `hasCoreDbId/hasConfigDbId/coreSpreadsheetOk` + deep findings (sau Phase A)
- **Connection package**:
  - `POST GET_CONNECTION_PACKAGE` module `HO_SO_V2` trả `moduleDbId` đúng (registry) và có `expiresAt`
  - verify HO_SO refresh + cache vẫn hoạt động
- **Register module**:
  - `POST REGISTER_MODULE` upsert registry idempotent (sau Phase C/D)
- **Ingest event**:
  - `POST INGEST_EVENT` tạo 1 row `CBV_EVENT_LOG` + `CBV_EVENT_QUEUE`
  - run `CBV_CoreV2_runEventWorker` và xác minh status chuyển `DONE`/`FAILED`
- **Dispatch command** (sau Phase C):
  - `POST DISPATCH_COMMAND` với commandType `CONFIG_GET_VALUE` (read-only) và verify result + idempotency duplicate response.

### 12.2. Regression focus

- HO_SO WebApp actions: `HEALTH_CHECK`, `REFRESH_CONNECTION`, `HOSO_EVENT` vẫn gọi MAIN_CONTROL thành công.
- Không thay đổi schema existing sheets (chỉ add columns/sheets).

## 13. Rollback Plan

- **Rollback contract**: giữ action cũ (`GET_CONNECTION_PACKAGE`, `REGISTER_MODULE`, `INGEST_EVENT`) chạy song song ít nhất 1–2 sprint.
- **Rollback deploy**:
  - Nếu module split fail: deploy lại bằng monolith `05_GAS_RUNTIME` theo `.clasp.json` root (mô tả trong `docs/MIGRATION_PLAN_05_GAS_RUNTIME_TO_MODULES.md`).
- **Rollback data**:
  - Không xóa sheet/log; chỉ disable new actions bằng feature flag / rule (CONFIG_FEATURE_FLAG) nếu có.

## 14. Open Questions

1) **INVOICE_MEMBER**: module này hiện nằm ở đâu? (repo khác? tên thư mục khác?) Cần baseline code để thiết kế contract package/registry chính xác.  
2) **Owner/permission model**: ai được phép `REGISTER_MODULE`, `ROTATE_PACKAGE`, `DISPATCH_COMMAND` cross-module? (ADMIN only hay per-module owner?)  
3) **Env strategy**: có tách `PROD/UAT/DEV` theo script properties hay theo CONFIG_ENV table?  
4) **Data ownership**: moduleDbId của TASK/FINANCE sẽ là spreadsheet riêng hay share monolith DB?  
5) **Security**: có yêu cầu thêm “2nd factor” (HMAC signature + nonce) ngoài token không?  
6) **Retention**: policy archive/cleanup cho logs và queue?  

