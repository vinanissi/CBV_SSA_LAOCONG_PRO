# Task System Deployment Checklist

**Purpose:** Safe rollout order, must-fix before AppSheet deploy, practical steps.

---

## Must-Fix Before AppSheet Deploy

- [ ] **Run selfAuditTaskSystemFull()** — 0 CRITICAL, 0 HIGH
- [ ] **USER_DIRECTORY** — At least 1 ACTIVE user for OWNER_ID
- [ ] **DON_VI** — Sheet exists, has data; ACTIVE_DON_VI not empty
- [ ] **MASTER_CODE** — TASK_TYPE group has rows (ensureSeedTaskType)
- [ ] **ENUM_DICTIONARY** — TASK_STATUS, TASK_PRIORITY have values; TASK_PRIORITY includes CAO, TRUNG_BINH, THAP
- [ ] **TASK_MAIN** — Columns: STATUS, OWNER_ID, DON_VI_ID, TASK_TYPE_ID (or HTX_ID/TASK_TYPE for legacy)
- [ ] **Refs** — No invalid USER refs; DON_VI_ID/TASK_TYPE_ID refs valid when used
- [ ] **repairTaskSystemSafely({ dryRun: true })** — Review; run without dryRun if safe

---

## Safe Rollout Order

### Phase 1: Schema & Data (GAS only)

1. **Backup** — Export Spreadsheet, GAS project
2. **Push GAS** — 96_TASK_SYSTEM_AUDIT_REPAIR.gs, 95_TASK_SYSTEM_BOOTSTRAP.gs, 21_MASTER_DATA_HELPER.gs, 20_TASK_*
3. **Run audit** — `selfAuditTaskSystemFull()`; address CRITICAL and HIGH
4. **Run bootstrap** — `taskSystemProBootstrapAll()` (ensureDonViSheet, ensureSeedDonVi, ensureSeedTaskType, ensureTaskMainSchemaPro)
5. **Run repair** — `repairTaskSystemSafely({ dryRun: true })`; then `repairTaskSystemSafely({})` to append columns
6. **Seed ENUM** — Load seed_enum_dictionary_task_pro.tsv if TASK_PRIORITY lacks CAO/TRUNG_BINH/THAP
7. **Re-audit** — `selfAuditTaskSystemFull()`; confirm 0 CRITICAL, 0 HIGH

### Phase 2: AppSheet

8. **Add DON_VI** — New table; slice ACTIVE_DON_VI
9. **Add ACTIVE_TASK_TYPE** — Slice of MASTER_CODE
10. **TASK_MAIN refs** — DON_VI_ID → ACTIVE_DON_VI; TASK_TYPE_ID → ACTIVE_TASK_TYPE; OWNER_ID → ACTIVE_USERS
11. **Actions** — Wire BẮT ĐẦU, HOÀN THÀNH, HỦY to GAS webhook
12. **Form** — Hide STATUS; order fields per TASK_MAIN_PRO_SPEC
13. **Test** — Create task, run actions

### Phase 3: Migration (optional)

14. **HTX→DON_VI** — Map HTX rows to DON_VI; populate DON_VI_ID
15. **PRIORITY** — Migrate LOW→THAP, MEDIUM→TRUNG_BINH, HIGH→CAO if needed
16. **Deprecate** — Hide HTX_ID in forms; keep column

---

## Practical Deployment Steps

### Step 1: Audit

```
Menu: CBV_SSA → Task System Audit
Or: Run selfAuditTaskSystemFull() in script editor
```

Review output. Fix CRITICAL first.

### Step 2: Bootstrap

```
Menu: CBV_SSA → Task PRO Bootstrap
Or: taskSystemProBootstrapAll()
```

### Step 3: Repair (dry run)

```
Menu: CBV_SSA → Task System Repair (dry run)
Or: repairTaskSystemSafely({ dryRun: true })
```

If appended list is acceptable, run without dryRun:

```
repairTaskSystemSafely({})
```

### Step 4: Enum seed

Import `06_DATABASE/SEED/seed_enum_dictionary_task_pro.tsv` to ENUM_DICTIONARY if TASK_PRIORITY is missing PRO values.

### Step 5: Re-audit

```
selfAuditTaskSystemFull()
```

Confirm summary: "OK: 0 critical, 0 high".

---

## Rollback

- Do NOT delete DON_VI_ID, TASK_TYPE_ID, DON_VI sheet
- AppSheet: revert to HTX_ID/TASK_TYPE if needed
- GAS createTask accepts HTX_ID for backward compat
