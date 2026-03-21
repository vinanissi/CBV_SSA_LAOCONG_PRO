# Task Migration Plan Audit

**Date:** 2025-03-21  
**Scope:** 09_AUDIT/TASK_MIGRATION_PLAN.md, 05_GAS_RUNTIME/task_migration_helper.gs

---

## 1. Preserve Existing Task Data Safely

| Check | Result |
|-------|--------|
| Old sheet modified/deleted? | No — read-only |
| TASK_MAIN overwritten? | No — append only |
| Duplicate run creates dupes? | Yes — not idempotent |

**Verdict: PASS**

- Migration creates new rows only; no updates or deletes on old sheet.
- No writes to source sheet. `taskAppendMain` appends to TASK_MAIN.
- **Gap:** Running migration twice will duplicate tasks. Plan should state "run once" or "ensure TASK_MAIN empty before first run."

---

## 2. Normalize Attachments and Logs Correctly

| Check | Result |
|-------|--------|
| DRAFT/SOP/REFERENCE → TASK_ATTACHMENT | ✓ Correct types, URL extraction |
| KẾT QUẢ URL → TASK_ATTACHMENT RESULT | ✓ When whole value is URL |
| KẾT QUẢ text → RESULT_SUMMARY | ✓ |
| KẾT QUẢ mixed (text + URL) | ⚠ Only creates attachment when whole string is URL; misses URLs in text |
| Conversation → TASK_UPDATE_LOG NOTE | ✓ Single blob as NOTE |
| Separate TRAO ĐỔI/CÂU HỎI/PHẢN HỒI columns | ⚠ One CONVERSATION key; only one column captured |

**Verdict: PASS** (with minor gaps)

- Plan allows "treat as one NOTE" for conversation.
- RESULT mixed content: extract URLs like DRAFT/SOP/REFERENCE for consistency.

---

## 3. Avoid Guessing Ambiguous Users

| Check | Result |
|-------|--------|
| Uses resolveValueToUserDirectoryId | ✓ |
| Unresolved → FLAG, not guess | ✓ |
| runTaskMigration aborts when flaggedRows > 0 | ✓ |
| userOverrides for manual mapping | ✓ |
| Never writes raw email/name to OWNER_ID when unresolved | ✓ (abort blocks execution) |

**Verdict: PASS**

- Flagged rows block execution. No ambiguous values written.

---

## 4. Protect Against Destructive Overwrite

| Check | Result |
|-------|--------|
| buildTaskMigrationReport writes? | No |
| analyzeTaskMigrationSource writes? | No |
| runTaskMigration updates/deletes? | No — append only |
| Old sheet mutated? | No |

**Verdict: PASS**

---

## 5. Dry-Run First

| Check | Result |
|-------|--------|
| buildTaskMigrationReport supports dryRun | ✓ (no writes regardless) |
| runTaskMigration default dryRun | ✓ true (must set false to run) |
| Report review before execution | ✓ Documented |

**Verdict: PASS**

---

## 6. Aligned with New Task Model

| Check | Result |
|-------|--------|
| TASK_MAIN columns match schema | ✓ |
| TASK_ATTACHMENT columns | ✓ |
| TASK_UPDATE_LOG UPDATE_TYPE, CONTENT | ✓ |
| TASK_CHECKLIST | N/A (none created; plan allows) |
| Required refs (HTX_ID, OWNER_ID) | ✓ Validated; flagged when missing |

**Verdict: PASS**

---

## Exact Migration Issues Found

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | `ownerVal` used before assignment — `!ownerVal` check on line 265 runs before `ownerVal = _getCell(...)` on 266. Causes wrong unresolvedUserRefs count. | **CRITICAL** | task_migration_helper.gs:264-266 |
| 2 | RESULT column: when value contains embedded URL in text (e.g. "Done. See https://..."), no attachment created. DRAFT/SOP/REFERENCE use `_extractUrls`; RESULT only uses `_isUrl` for whole string. | Minor | task_migration_helper.gs:315 |
| 3 | Plan doc: `report.rows.filter(r => r.flagged)` — rows have `action`, not `flagged`. Should be `r.action === 'FLAG'`. | Minor | TASK_MIGRATION_PLAN.md:125 |
| 4 | Dry-run example missing `defaultHtxId` — report will show missingHtx for all rows if not provided. | Minor | TASK_MIGRATION_PLAN.md:110-115 |

---

## Fixes Applied

| # | Fix | Status |
|---|-----|--------|
| 1 | Move `ownerVal`/`reporterVal` assignment before any check; remove stale `!ownerVal` early increment. | ✓ Applied |
| 2 | Use `_extractUrls(resultVal)` for RESULT when mixed text+URL; create attachment per URL. | ✓ Applied |
| 3 | Update plan: `report.rows.filter(r => r.action === 'FLAG')`. | ✓ Applied |
| 4 | Add `defaultHtxId` to dry-run example in plan. | ✓ Applied |

---

## Final Verdict

**TASK MIGRATION SAFE** (after critical fix #1 applied)

- Critical bug would corrupt report counts and potentially allow migration with incorrect flagged-state.
- After fix: all six categories PASS.
- Recommended: apply fixes 2–4 for completeness.
