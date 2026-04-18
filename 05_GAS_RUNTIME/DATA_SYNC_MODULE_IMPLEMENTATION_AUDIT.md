# DATA SYNC — Implementation audit vs `DATA_SYNC_MODULE_DESIGN.md` v1.3

**Date:** 2026-04-17  
**Code:** `46_DATA_SYNC_PLAN_SHEET.js` (plan JSON **sheet** `DATA_SYNC_CONTROL`, A2 plan + F2 continuation), `47_DATA_SYNC_CHUNK.js`, `48_DATA_SYNC_TRANSFORM.js`, `49_DATA_SYNC_ENGINE.js`, `45_DATA_SYNC_BUILDER.js` (`dataSyncFillHeaderRowsFromFormLinks_`), `90_BOOTSTRAP_MENU.js` / `90_BOOTSTRAP_MENU_WRAPPERS.js` (submenu **Data sync**), `00_CORE_CONFIG.js`, `00_CORE_UTILS.js`, `03_SHARED_LOGGER.js`

**v1.3 notes:** Menu **Fill header rows 7/9** từ B6/B8+D6/D8; **Run apply** truyền `continuation` từ F2; **Run apply — one job** truyền `jobId`.

### Plan lưu trên sheet

| Item | Vị trí |
|------|--------|
| Sheet | `CBV_CONFIG.SHEETS.DATA_SYNC_CONTROL` → `DATA_SYNC_CONTROL` |
| Plan JSON | `A2` |
| Continuation (chunk resume) | `F2` tự ghi sau **Build report**; xóa bằng menu *Clear continuation* |
| Dashboard tóm tắt | `D1:E7` |

## §10 Checklist

| Item | Pass/Fail | Evidence |
|------|-----------|----------|
| `maxErrorRows`, `onDuplicateSourceKey`, `keyNormalization` in job schema + validate | **Pass** | `_dataSyncValidateJobStructure`, `validateSyncPlan` |
| `buildDataSyncReport` không có `dryRun`; không ghi sheet | **Pass** | Signature chỉ `opts`; read-only |
| `continuation === null` khi done; snapshot `sourceRowCount` khi resume | **Pass** | Token §7; stale → `continuationStale`; `null` khi hết chunk/job |
| `CBV_CONFIG.SYSTEM_ACTOR_ID` + `cbvSystemActor`; không rải `'SYSTEM'` trong module mới | **Pass** | `00_CORE_CONFIG`, `00_CORE_UTILS`; `runDataSync` + `logAdminAudit` |
| `enumMapRef` + mã `ENUM_*` | **Pass** | `48_DATA_SYNC_TRANSFORM.js` `dataSyncResolveEnum` |
| `logAdminAudit` payload + khi ghi | **Pass** | `runDataSync` sau apply; không gọi khi chỉ report |
| `mode` chỉ `append_only` \| `upsert` | **Pass** | Validate + nhánh INSERT/UPDATE |
| Chunking + continuation; validate sheet tại `validateSyncPlan` | **Pass** | `validateSyncPlan` mở ss/sheet; chunk `maxRowsPerChunk` |
| `errorRowCount` vs `applySkippedErrorCount` | **Pass** | `summary.errorRowCount`; `runDataSync.summary.applySkippedErrorCount` |
| `date_iso` / `date_serial` + note | **Pass** | Comment đầu `48_DATA_SYNC_TRANSFORM.js` |

## §8 Risk register

| ID | Mitigation trong code |
|----|------------------------|
| R-1 | `validateSyncPlan` + `SUGGESTED_HEADER` (không auto-map) |
| R-2 | `onDuplicateSourceKey`, duplicate schedule |
| R-3 | `onMissingTargetColumn === 'error'` |
| R-4 | Không lock — *op doc / maintenance* |
| R-GAS-1 | `sourceRowCount` trong token; stale abort |
| R-GAS-2 | Transform trả typed values; *targetColumnType* — **partial** (chưa có field optional per column) |
| R-GAS-3 | Levenshtein ≤2 + unique best → warning trong validate |

## Gaps / follow-up

1. **Partial chunk + upsert:** `targetKeyToRow` chụp một lần đầu job; chunk sau không thấy INSERT của chunk trước nếu chưa `runDataSync`. Chỉ an toàn khi **apply sau khi `continuation === null`** (đã enforce trong `runDataSync`).
2. **`targetColumnType` / preview coercion** (R-GAS-2 đầy đủ): chưa có cột-level; có thể bổ sung transform + `setValues` theo `targetFormat`.
3. **Menu / wrapper:** submenu **Data sync** gọi `buildDataSyncReport` / `runDataSync` qua wrapper; apply dùng `getDataSyncReportOptsFromSheet_()` (plan + F2).
4. **`planHash`:** optional trong spec — chưa implement.
5. **`clasp`:** `appsscript.json` không liệt kê file; tất cả `.js` trong project được nạp — thứ tự global OK với prefix số.

---

*Generated for implementation review.*
