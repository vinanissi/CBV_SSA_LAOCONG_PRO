# USER System Deployment Order

**Execute in order.** Do not skip steps. Verify each phase before proceeding.

---

## Phase 0 — Pre-Deployment

| Step | Action | Verify |
|------|--------|--------|
| 0.1 | Ensure USER_DIRECTORY sheet exists and has users | Sheet has rows with ID, EMAIL, STATUS=ACTIVE |
| 0.2 | Run `analyzeUserRefValues()` | Review value distribution (email, MC_, UD_, etc.) |
| 0.3 | Run `buildMigrationReport({ dryRun: true })` | Resolved + flagged counts; fix flagged before migration |
| 0.4 | Backup affected columns | Export TASK_MAIN, TASK_CHECKLIST, HO_SO_MASTER, FINANCE_TRANSACTION (OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY) |

---

## Phase 1 — Data Migration (GAS)

| Step | Action | Function |
|------|--------|----------|
| 1.1 | Run `buildMigrationReport({ dryRun: true })` again | Confirm no new flagged |
| 1.2 | Run `runUserMigration({ dryRun: false })` | **Writes to sheets** |
| 1.3 | Verify: `analyzeUserRefValues()` | All values UD_* or email (ACTOR_ID only) |
| 1.4 | Check ADMIN_AUDIT_LOG | Entry for USER_MIGRATION action |

---

## Phase 2 — AppSheet Config

### Slices to create/update

| Slice | Source | Filter |
|-------|--------|--------|
| ACTIVE_USERS | USER_DIRECTORY | `AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE)` |

### Ref fields to rebind

| Table | Column | Ref Target | Value | Display | Allow Adds |
|-------|--------|------------|-------|---------|------------|
| TASK_MAIN | OWNER_ID | ACTIVE_USERS | ID | FULL_NAME | **OFF** |
| TASK_MAIN | REPORTER_ID | ACTIVE_USERS | ID | FULL_NAME | **OFF** |
| HO_SO_MASTER | OWNER_ID | ACTIVE_USERS | ID | FULL_NAME | **OFF** |
| TASK_CHECKLIST | DONE_BY | ACTIVE_USERS | ID | FULL_NAME | **OFF** |
| FINANCE_TRANSACTION | CONFIRMED_BY | ACTIVE_USERS | ID | FULL_NAME | **OFF** |

### Valid_If (for OWNER_ID, REPORTER_ID, HO_SO_MASTER.OWNER_ID)

```
IN([OWNER_ID], SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", [IS_DELETED]=FALSE)))
```

### REPORTER_ID initial value

```
FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))
```

### Security filters (OPERATOR)

**TASK_MAIN:**
```
OR(
  [OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))),
  [REPORTER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL()))))
)
```

**HO_SO_MASTER:**
```
OR(ISBLANK([OWNER_ID]), [OWNER_ID] = FIRST(SELECT(USER_DIRECTORY[ID], AND([STATUS]="ACTIVE", LOWER([EMAIL])=LOWER(USEREMAIL())))))
```

---

## Phase 3 — Post-Deployment

| Step | Action |
|------|--------|
| 3.1 | Test: Create task, set OWNER_ID from dropdown |
| 3.2 | Test: REPORTER_ID defaults to current user |
| 3.3 | Test: Mark checklist done → DONE_BY set |
| 3.4 | Test: Confirm finance → CONFIRMED_BY set |
| 3.5 | Verify: No "New" on user dropdowns |

---

## Exact GAS Functions to Run

| Function | When | Purpose |
|----------|------|---------|
| `analyzeUserRefValues()` | Phase 0, 1.3 | Analyze current values |
| `buildMigrationReport({ dryRun: true })` | Phase 0, 1.1 | Dry-run report |
| `runUserMigration({ dryRun: false })` | Phase 1.2 | Execute migration |
| `clearUserCache()` | After USER_DIRECTORY edits | Refresh cache |

---

## Config Files Updated (Reference)

- 04_APPSHEET/APPSHEET_SLICE_SPEC.md
- 04_APPSHEET/APPSHEET_SLICE_MAP.md
- 04_APPSHEET/APPSHEET_REF_MAP.csv
- 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.csv
- 04_APPSHEET/APPSHEET_FIELD_POLICY_MAP.json
- 04_APPSHEET/TASK_VALIDATION_RULES.csv
- 04_APPSHEET/APPSHEET_SECURITY_FILTERS.md
