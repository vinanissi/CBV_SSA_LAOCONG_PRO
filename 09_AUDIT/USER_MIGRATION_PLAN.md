# User Migration Plan

**Purpose:** Safe migration from mixed people-selection sources to USER_DIRECTORY as canonical operational user source.

**Related:** 03_SHARED/USER_TASK_FINANCE_MAPPING.md, 04_APPSHEET/APPSHEET_USER_LAYER.md, 05_GAS_RUNTIME/user_migration_helper.gs

---

## 1. Current Risk Summary

| Risk | Description |
|------|-------------|
| Wrong dropdown source | AppSheet ACTIVE_USERS may point to MASTER_CODE or HO_SO_MASTER instead of USER_DIRECTORY |
| Accidental "New" creation | Allow Adds ON on user refs lets users create records in wrong table |
| Mixed storage | OWNER_ID, REPORTER_ID, DONE_BY, CONFIRMED_BY, ACTOR_ID may store email, MASTER_CODE.ID, names, or HO_SO IDs |
| Inconsistent identity | Same person represented differently across tables |

---

## 2. Fields Impacted

| Table | Field | Current Possible Values | Target |
|-------|-------|--------------------------|--------|
| TASK_MAIN | OWNER_ID | Email, MC_*, UD_*, name, HO_SO ID | USER_DIRECTORY.ID |
| TASK_MAIN | REPORTER_ID | Same | USER_DIRECTORY.ID |
| TASK_CHECKLIST | DONE_BY | Same | USER_DIRECTORY.ID |
| TASK_UPDATE_LOG | ACTOR_ID | Same; email fallback allowed | USER_DIRECTORY.ID or email |
| FINANCE_TRANSACTION | CONFIRMED_BY | Same | USER_DIRECTORY.ID |
| FINANCE_LOG | ACTOR_ID | Same | USER_DIRECTORY.ID or email |
| ADMIN_AUDIT_LOG | ACTOR_ID | Same | USER_DIRECTORY.ID or email |
| HO_SO_MASTER | OWNER_ID | Same | USER_DIRECTORY.ID |

---

## 3. Value Classification

| Pattern | Prefix/Format | Meaning | Action |
|---------|---------------|---------|--------|
| UD_* | UD_YYYYMMDD_xxxxx | Already USER_DIRECTORY.ID | Verify exists; keep if valid |
| MC_* | MC_YYYYMMDD_xxxxx | MASTER_CODE.ID (USER group) | Resolve via SHORT_NAME (email) → USER_DIRECTORY |
| HTX_*, XV_*, XE_*, TX_* | HO_SO-style ID | HO_SO_MASTER.ID (business entity) | **FLAG** — likely wrong; manual review |
| *@* | Contains @ | Email | Match by USER_DIRECTORY.EMAIL |
| Other | No prefix, no @ | Possibly FULL_NAME or typo | Match by normalized name; **FLAG if ambiguous** |
| Blank | Empty | No assignee | Leave blank |

---

## 4. Safe Match Rules (Priority Order)

1. **Exact UD_ ID**
   - Value starts with `UD_`
   - Lookup in USER_DIRECTORY by ID
   - If found and not deleted → **KEEP**
   - If not found → **FLAG** (orphaned ref)

2. **Email match**
   - Value contains `@`
   - Trim, lowercase, match USER_DIRECTORY.EMAIL
   - If exactly one match → **RESOLVE** to that USER_DIRECTORY.ID
   - If multiple matches → **FLAG** (duplicate email in USER_DIRECTORY)
   - If no match → **FLAG** (user not in USER_DIRECTORY)

3. **MASTER_CODE (MC_) resolve**
   - Value starts with `MC_`
   - Lookup MASTER_CODE row (ID), require MASTER_GROUP=USER
   - Get SHORT_NAME (email)
   - Apply email match rule above
   - If MASTER_CODE row not found or not USER → **FLAG**

4. **Normalized name match**
   - Value has no special prefix, no @
   - Normalize: trim, collapse whitespace, case-insensitive
   - Match against USER_DIRECTORY.FULL_NAME and USER_DIRECTORY.DISPLAY_NAME
   - If **exactly one** match → **RESOLVE**
   - If **zero** matches → **FLAG**
   - If **multiple** matches → **FLAG** (ambiguous; do not guess)

5. **HO_SO-style ID**
   - Value starts with HTX_, XV_, XE_, TX_
   - **FLAG** — do not resolve to USER_DIRECTORY; likely confused with business entity

6. **Unresolved**
   - **FLAG** for manual review
   - Do **not** overwrite; leave original value
   - Log in migration report

---

## 5. Ambiguous-Case Policy

| Case | Action | Rationale |
|------|--------|-----------|
| Multiple USER_DIRECTORY rows with same email | FLAG; do not migrate | Data integrity issue; fix USER_DIRECTORY first |
| Multiple users with same FULL_NAME | FLAG | Cannot safely guess which user |
| HO_SO ID in people field | FLAG | Wrong entity type; manual review |
| Orphaned UD_ ID | FLAG | User deleted; decide: clear or assign to placeholder |
| No match for email | FLAG | Add user to USER_DIRECTORY or leave for manual mapping |
| Empty value | No action | Keep blank |

---

## 6. Step-by-Step Migration Execution Order

### Phase 0 — Pre-Migration (Non-Destructive)

| Step | Action | Output |
|------|--------|--------|
| 0.1 | Ensure USER_DIRECTORY is populated with all operational users | USER_DIRECTORY has rows |
| 0.2 | Run `analyzeUserRefValues()` from user_migration_helper.gs | Report of current value distribution |
| 0.3 | Run `buildMigrationReport({ dryRun: true })` | Migration report with resolved/flagged counts |
| 0.4 | Review report; fix USER_DIRECTORY duplicates (email), add missing users | Ready for migration |
| 0.5 | Create backup of affected sheets or columns | Backup available |

### Phase 1 — AppSheet Config (No Data Change)

| Step | Action | Reference |
|------|--------|------------|
| 1.1 | Update ACTIVE_USERS slice: Source = USER_DIRECTORY | APPSHEET_SLICE_SPEC.md |
| 1.2 | Update APPSHEET_REF_MAP.csv, APPSHEET_FIELD_POLICY_MAP.json | USER_DIRECTORY formulas |
| 1.3 | Set Allow Adds = OFF on all user ref dropdowns | APPSHEET_USER_REF_RULES.md |
| 1.4 | Do **not** deploy AppSheet changes until data migration complete | — |

### Phase 2 — Data Migration (GAS Helper)

| Step | Action | Notes |
|------|--------|-------|
| 2.1 | Run `buildMigrationReport({ dryRun: true })` again | Confirm no new surprises |
| 2.2 | Resolve all FLAGGED items or accept leaving as-is | Manual review |
| 2.3 | Run migration: `runUserMigration({ dryRun: false })` or equivalent | Writes to sheets |
| 2.4 | Verify: re-run `analyzeUserRefValues()` | All values should be UD_* or email (ACTOR_ID only) |
| 2.5 | Log migration in ADMIN_AUDIT_LOG | Audit trail |

### Phase 3 — Post-Migration

| Step | Action |
|------|--------|
| 3.1 | Deploy AppSheet config changes |
| 3.2 | Update APPSHEET_SECURITY_FILTERS for ID-based row filters |
| 3.3 | Test: create task, assign, mark checklist done, confirm finance |
| 3.4 | Archive or remove MASTER_CODE USER rows if no longer needed |
| 3.5 | Update 09_AUDIT/USER_MAPPING_AUDIT.md | Mark migration complete |

---

## 7. Reversibility

| Measure | Description |
|---------|--------------|
| Backup | Export or copy affected columns before migration |
| Dry-run | Always run `dryRun: true` first |
| Logging | Migration script logs every change (table, row, column, old, new) |
| No blind overwrite | Unresolved values left unchanged |
| Sentinel | Avoid introducing synthetic placeholders; prefer FLAG + manual fix |

---

## 8. Dependencies

- 05_GAS_RUNTIME/user_migration_helper.gs
- 02_USER_SERVICE.gs (getUserByEmail, getUserById)
- CBV_CONFIG.SHEETS.*
- Spreadsheet access to USER_DIRECTORY, MASTER_CODE, TASK_MAIN, TASK_CHECKLIST, HO_SO_MASTER, FINANCE_TRANSACTION, TASK_UPDATE_LOG, FINANCE_LOG, ADMIN_AUDIT_LOG

---

## 9. References

- 03_SHARED/USER_SYSTEM_STANDARD.md
- 03_SHARED/USER_TASK_FINANCE_MAPPING.md
- 04_APPSHEET/APPSHEET_USER_LAYER.md
- 04_APPSHEET/APPSHEET_USER_MIGRATION_NOTES.md
- 09_AUDIT/USER_MAPPING_AUDIT.md
