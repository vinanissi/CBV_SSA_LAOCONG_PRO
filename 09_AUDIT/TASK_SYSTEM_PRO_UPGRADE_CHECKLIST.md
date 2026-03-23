# Task System PRO Upgrade Checklist

**Purpose:** Safe rollout of DON_VI, TASK_TYPE_ID, DON_VI_ID, workflow actions per FINAL ARCHITECTURE.

**Audit & Repair:** See [TASK_SYSTEM_AUDIT_REPAIR_SPEC.md](TASK_SYSTEM_AUDIT_REPAIR_SPEC.md), [TASK_SYSTEM_DEPLOYMENT_CHECKLIST.md](TASK_SYSTEM_DEPLOYMENT_CHECKLIST.md)

---

## Must-Fix Before Deploy

- [ ] **DON_VI sheet** — Run `ensureDonViSheet()` and `ensureSeedDonVi()`.
- [ ] **MASTER_CODE TASK_TYPE** — Run `ensureSeedTaskType()`.
- [ ] **ENUM_DICTIONARY** — Ensure TASK_PRIORITY has CAO, TRUNG_BINH, THAP. Run `seed_enum_dictionary_task_pro.tsv` if needed.
- [ ] **TASK_MAIN columns** — Run `ensureTaskMainSchemaPro()` to add DON_VI_ID, TASK_TYPE_ID.
- [ ] **AppSheet data sources** — Add DON_VI table; add slices ACTIVE_DON_VI, ACTIVE_TASK_TYPE.
- [ ] **AppSheet refs** — TASK_MAIN.DON_VI_ID → ACTIVE_DON_VI; TASK_MAIN.TASK_TYPE_ID → ACTIVE_TASK_TYPE.
- [ ] **AppSheet actions** — Wire BẮT ĐẦU, HOÀN THÀNH, HỦY, MỞ LẠI to GAS (taskStartAction, taskCompleteAction, taskCancelAction, taskReopenAction).
- [ ] **PRIORITY values** — Migrate LOW→THAP, MEDIUM→TRUNG_BINH, HIGH→CAO, URGENT→CAO (or add URGENT to enum).

---

## Safe Rollout Order

1. **Backup** — Export Spreadsheet and GAS project.
2. **GAS deploy** — Push 95_TASK_SYSTEM_BOOTSTRAP.gs, 21_MASTER_DATA_HELPER.gs, updated 20_TASK_*.
3. **Run bootstrap** — `ensureDonViSheet()`, `ensureSeedDonVi()`, `ensureSeedTaskType()`, `ensureTaskMainSchemaPro()`.
4. **Seed ENUM** — Load `seed_enum_dictionary_task_pro.tsv` if TASK_PRIORITY lacks CAO/TRUNG_BINH/THAP.
5. **AppSheet** — Add DON_VI, ACTIVE_DON_VI, ACTIVE_TASK_TYPE. Add DON_VI_ID, TASK_TYPE_ID to TASK_MAIN form (optional at first).
6. **HTX→DON_VI mapping** — If HTX exists in HO_SO_MASTER, create matching DON_VI rows. Populate DON_VI_ID from HTX_ID where mapping exists (run migration helper).
7. **Test** — Create task with DON_VI_ID; run BẮT ĐẦU, HOÀN THÀNH, MỞ LẠI.
8. **Deprecate** — Once DON_VI_ID is populated, hide HTX_ID in forms. Keep column for legacy data.

---

## Migration Notes

### Backward Compatibility

- **HTX_ID** — Kept. createTask accepts DON_VI_ID or HTX_ID.
- **TASK_TYPE** — Kept. TASK_TYPE_ID preferred; TASK_TYPE (text) still valid.
- **PRIORITY** — Support both old (LOW,MEDIUM,HIGH,URGENT) and new (CAO,TRUNG_BINH,THAP). Add new enum values or migrate.
- **STATUS** — ASSIGNED, WAITING, ARCHIVED remain supported. PRO flow: NEW→IN_PROGRESS→DONE/CANCELLED.

### Data Migration (Optional)

1. Map each HTX (HO_SO_MASTER, HO_SO_TYPE=HTX) to a DON_VI row (DON_VI_TYPE=HTX).
2. For each TASK_MAIN with HTX_ID and no DON_VI_ID, set DON_VI_ID = mapped DON_VI.ID.
3. For TASK_TYPE_ID: if TASK_TYPE="GENERAL" and no TASK_TYPE_ID, set TASK_TYPE_ID = MASTER_CODE ID where CODE=GENERAL.

---

## GAS Functions Reference

| Function | Purpose |
|----------|---------|
| selfAuditTaskSystemFull() | Full audit: schema, refs, enum, status, priority |
| selfAuditTaskSystem() | Delegates to Full when available |
| repairTaskSystemSafely(options) | ensureDonViSheet + append missing columns; options.dryRun |
| repairTaskSystemSafelyFull(options) | Append missing columns for all task tables |
| ensureDonViSheet() | Create DON_VI sheet, append missing columns |
| ensureSeedDonVi() | Seed default DON_VI rows |
| ensureSeedTaskType() | Seed MASTER_CODE TASK_TYPE rows |
| ensureTaskMainSchemaPro() | Append DON_VI_ID, TASK_TYPE_ID to TASK_MAIN |
| taskStartAction(taskId) | BẮT ĐẦU |
| taskCompleteAction(taskId, note) | HOÀN THÀNH |
| taskCancelAction(taskId, note) | HỦY |
| taskReopenAction(taskId) | MỞ LẠI |
| validateTaskPayload(data, isCreate) | Validate payload |
| getActiveDonVi() | ACTIVE_DON_VI rows |
| getActiveTaskType() | ACTIVE_TASK_TYPE rows |

---

## Rollback

- Do NOT delete DON_VI_ID, TASK_TYPE_ID columns.
- Do NOT remove DON_VI sheet.
- Revert AppSheet to use HTX_ID/TASK_TYPE if needed.
- GAS createTask continues to accept HTX_ID.
