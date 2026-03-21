# Task Migration Plan — BangCongViec to Normalized Model

**Purpose:** Safe migration from old single-sheet BangCongViec-style task table to normalized TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG.

**Related:** 06_DATABASE/TASK_SCHEMA.md, 05_GAS_RUNTIME/task_migration_helper.gs, 05_GAS_RUNTIME/user_migration_helper.gs, 09_AUDIT/USER_MIGRATION_PLAN.md

---

## 1. Old-to-New Column Mapping

### Direct → TASK_MAIN

| Old Column (Vietnamese) | New Column | Notes |
|-------------------------|------------|-------|
| TÊN CÔNG VIỆC | TITLE | Primary task name |
| Ngày tạo | CREATED_AT | Preserve |
| TÌNH TRẠNG CÔNG VIỆC | STATUS | Map to TASK_STATUS enum; flag unknown |
| Người thực hiện | OWNER_ID | **AMBIGUOUS** — may be email/name; use resolveValueToUserDirectoryId |
| NGƯỜI CHỊU TRÁCH NHIỆM | REPORTER_ID or OWNER_ID | **AMBIGUOUS** — "responsible" vs "doer"; map to REPORTER_ID if distinct |
| NGÀY NHẬN VIỆC | START_DATE | Date received |
| THỜI HẠN | DUE_DATE | Deadline |
| TIẾN ĐỘ | PROGRESS_PERCENT | 0–100; normalize |
| NGÀY HOÀN THÀNH | DONE_AT | Completion date |
| GHI CHÚ | DESCRIPTION | Main note/description |
| KPI | RELATED_ENTITY_ID or NOTE | **AMBIGUOUS** — may be KPI reference or free text |

### Attachment Columns → TASK_ATTACHMENT

| Old Column | New Table | ATTACHMENT_TYPE | Notes |
|------------|-----------|-----------------|-------|
| TÀI LIỆU NHÁP | TASK_ATTACHMENT | DRAFT | One URL/link per row; split if multiple |
| KẾT QUẢ | TASK_ATTACHMENT | RESULT | Or merge into RESULT_SUMMARY if text only |
| SOP | TASK_ATTACHMENT | SOP | SOP document/link |
| LINK THAM KHẢO | TASK_ATTACHMENT | REFERENCE | Reference link |

**Rule:** Each non-empty URL/link becomes one TASK_ATTACHMENT row. Text-only "KẾT QUẢ" → RESULT_SUMMARY in TASK_MAIN.

### Conversation → TASK_UPDATE_LOG

| Old Column | UPDATE_TYPE | Notes |
|------------|-------------|-------|
| TRAO ĐỔI | NOTE | General exchange |
| CÂU HỎI | QUESTION | Question |
| PHẢN HỒI | ANSWER | Reply/feedback |

**Rule:** If stored as single text block, split by delimiter (e.g. `---`, `\n\n`) or treat as one NOTE. **FLAG** if format unclear.

### Checklist

| Old Pattern | New Table | Notes |
|-------------|-----------|-------|
| (None typical) | TASK_CHECKLIST | BangCongViec often had no explicit checklist; KPI could become checklist item |

**Rule:** If KPI contains pipe/semicolon-separated items, optionally create TASK_CHECKLIST rows. **FLAG** as optional.

---

## 2. Migration Strategy

### Phase 0 — Pre-Migration

1. **Backup** old sheet (copy to `BANG_CONG_VIEC_BACKUP_YYYYMMDD`).
2. **Run** `analyzeTaskMigrationSource(options)` — report row count, column detection, value distribution.
3. **Resolve** user mapping: run `analyzeUserRefValues()` on OWNER/REPORTER columns; fix USER_DIRECTORY before task migration.
4. **Ensure** at least one ACTIVE_HTX exists; identify default HTX_ID for rows without HTX.

### Phase 1 — Analysis (Dry-Run)

1. **Run** `buildTaskMigrationReport({ dryRun: true, sourceSheet: "..." })`.
2. **Review**:
   - Rows missing HTX_ID
   - User refs unresolved (OWNER_ID, REPORTER_ID)
   - STATUS values needing enum mapping
   - Attachment/conversation split count
3. **Fix** ambiguous cases manually; add user mapping overrides if needed.

### Phase 2 — Execution

1. **Run** `runTaskMigration({ dryRun: false, sourceSheet: "...", defaultHtxId: "..." })`.
2. **Log** in ADMIN_AUDIT_LOG: entity TASK_MIGRATION, counts.
3. **Verify** row counts; spot-check new tables.
4. **Hide** or archive old sheet (do not delete).

### Phase 3 — Post-Migration

1. **Update** AppSheet to use new tables.
2. **Run** `runTaskTests()` to validate.
3. **Document** in 09_AUDIT/TASK_MIGRATION_COMPLETED.md.

---

## 3. Risky Fields and Ambiguity Notes

| Field | Risk | Action |
|-------|------|--------|
| Người thực hiện vs NGƯỜI CHỊU TRÁCH NHIỆM | Two people columns — which is OWNER, which REPORTER? | Map "thực hiện" (doer) → OWNER_ID; "chịu trách nhiệm" (responsible) → REPORTER_ID. If same person, use for both. **FLAG** if values differ and semantics unclear. |
| User values (email, name, MC_*) | May not resolve to USER_DIRECTORY | Use resolveValueToUserDirectoryId; **FLAG** unresolved; do not guess. |
| HTX_ID | Old sheet likely has no HTX | Require defaultHtxId for migration; **FLAG** rows; or add HTX column to old sheet and backfill manually first. |
| TÌNH TRẠNG CÔNG VIỆC | May use different status words | Map to TASK_STATUS enum; **FLAG** unknown values; use STATUS_MAPPING override. |
| KẾT QUẢ | May be URL or text | If URL → TASK_ATTACHMENT RESULT; if text → RESULT_SUMMARY. **FLAG** if both. |
| TRAO ĐỔI / CÂU HỎI / PHẢN HỒI | May be single field or separate; format unknown | If single blob, create one NOTE. **FLAG** for manual split if structure detected. |
| KPI | Unclear semantics | Default to NOTE or RELATED_ENTITY; **FLAG** for review. |

---

## 4. Dry-Run Recommendation

**Always run dry-run first:**

```javascript
var report = buildTaskMigrationReport({
  sourceSheet: 'BANG_CONG_VIEC',  // or actual old sheet name
  dryRun: true,
  defaultHtxId: 'HTX_...',        // required for accurate missingHtx count
  columnMap: {}                   // optional: override detected column names
});
Logger.log(JSON.stringify(report, null, 2));
```

**Review before execution:**

- `report.summary.totalRows`
- `report.summary.flaggedRows`
- `report.summary.unresolvedUserRefs`
- `report.rows.filter(r => r.action === 'FLAG')`
- `report.ambiguousUsers`

**Do NOT proceed** until flagged count is acceptable and ambiguous users are resolved.

---

## 5. Exact Execution Order

| Step | Action | Dry-Run |
|------|--------|---------|
| 0.1 | Backup old sheet | — |
| 0.2 | Run user migration if OWNER/REPORTER have mixed values | analyzeUserRefValues |
| 0.3 | Ensure ACTIVE_HTX exists; choose defaultHtxId | — |
| 1.1 | buildTaskMigrationReport({ dryRun: true }) | Yes |
| 1.2 | Review report; fix flagged; add overrides | — |
| 1.3 | buildTaskMigrationReport({ dryRun: true }) again | Yes |
| 2.1 | runTaskMigration({ dryRun: false, defaultHtxId: "HTX_..." }) | No |
| 2.2 | Log in ADMIN_AUDIT_LOG | — |
| 2.3 | Verify counts | — |
| 3.1 | Hide old sheet; switch AppSheet to new tables | — |
| 3.2 | runTaskTests() | — |

---

## 6. Column Name Variants

Old sheet may use different header names. Helper should accept aliases:

| Canonical Old | Aliases |
|---------------|---------|
| TÊN CÔNG VIỆC | Tên công việc, TEN_CONG_VIEC, Title |
| TÌNH TRẠNG CÔNG VIỆC | Tình trạng, STATUS, Tinh trang |
| Người thực hiện | Nguoi thuc hien, Owner, Assignee |
| NGƯỜI CHỊU TRÁCH NHIỆM | Reporter, Nguoi chiu trach nhiem |
| NGÀY NHẬN VIỆC | Start date, Ngay nhan viec |
| THỜI HẠN | Due date, Thoi han |
| TIẾN ĐỘ | Progress, Tien do |
| NGÀY HOÀN THÀNH | Done date, Ngay hoan thanh |
| GHI CHÚ | Note, Ghi chu |
| TÀI LIỆU NHÁP | Draft, Tai lieu nhap |
| KẾT QUẢ | Result, Ket qua |
| SOP | — |
| LINK THAM KHẢO | Reference, Link tham khao |

---

## 8. Helper API Reference

| Function | Purpose |
|----------|---------|
| `analyzeTaskMigrationSource(opts)` | Analyze old sheet: headers, column map, row count. No writes. |
| `buildTaskMigrationReport(opts)` | Build per-row mapping report. No writes. Use `dryRun: true` by default. |
| `runTaskMigration(opts)` | Execute migration. Requires `dryRun: false`, `defaultHtxId`. |

**User resolution:** Uses `resolveValueToUserDirectoryId` from `user_migration_helper.gs`. Pass `userOverrides` to force mapping, e.g. `{ "email@old.com": "UD_xxx", "Tên người": "UD_yyy" }`.

---

## 9. No Blind Overwrite

- Migration **creates** new rows in TASK_MAIN, TASK_CHECKLIST, TASK_ATTACHMENT, TASK_UPDATE_LOG.
- Migration does **not** modify or delete the old sheet.
- Unresolved user refs: store original value in NOTE or **FLAG**; do not replace with guess.
- Missing HTX_ID: require explicit defaultHtxId; do not infer.
