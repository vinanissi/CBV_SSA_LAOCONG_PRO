# RUNBOOK — LAOCONG PRO

Operator-focused procedures for daily operations, recovery, and troubleshooting.

**Reference:** CBV_LAOCONG_PRO_REFERENCE.md | **Deploy:** DEPLOY_CHECKLIST_LAOCONG_PRO.md

---

## 1. Daily Operations

- **HoSo/Task/Finance:** Use AppSheet; all writes via GAS service layer (actions).
- **Enum/Master Code:** Use Admin Panel app; never inline-edit in Google Sheets.
- **Backup:** Export critical sheets manually or via Drive versioning before bulk changes.

---

## 2. Weekly Checks

- [ ] Review ADMIN_AUDIT_LOG for unexpected admin edits.
- [ ] Run `auditEnumConsistency()` — verify enum sheet vs runtime.
- [ ] Run `verifyAppSheetReadiness()` — tables, keys, enum coverage.
- [ ] If triggers used: verify no duplicate triggers (see §9).

---

## 3. Startup Sequence (Fresh Deployment)

1. Create Google Sheets file, bind Apps Script.
2. `clasp push` (order in `.clasp.json`).
3. Configure `ADMIN_EMAILS` in 00_CORE_CONFIG.gs.
4. Run `initAll()`.
5. Run `installTriggers()` if using triggers.
6. Run `auditEnumConsistency()`.
7. Run `verifyAppSheetReadiness()`.
8. Configure AppSheet (tables, enum bindings, display mapping).
9. Create Admin Panel app (separate), share only with ADMIN_EMAILS.

---

## 4. Safe Rerun Sequence

- **initAll():** Idempotent. Safe to rerun. Adds missing sheets, extends headers if safe, seeds enum, fills DISPLAY_TEXT.
- **seedEnumDictionary():** Idempotent. Adds missing enum rows only.
- **ensureDisplayTextForEnumRows() / ensureDisplayTextForMasterCodeRows():** Idempotent. Fills empty DISPLAY_TEXT only.
- **installTriggers():** Safe. Use `ensureNoDuplicateTrigger` before install; removes old triggers for same handler.

---

## 5. Schema Mismatch

**Symptom:** initAll reports `INIT_MISMATCH`, mismatched sheets list.

**Steps:**
1. Do NOT overwrite headers blindly.
2. Run `selfAuditBootstrap()` — review `mismatchedSheets`.
3. For `EXTRA_COLUMNS`: decide whether to remove columns manually (risky) or accept.
4. For `HEADER_MISMATCH`: align sheet headers with 90_BOOTSTRAP_SCHEMA.gs `CBV_SCHEMA_MANIFEST` (or 06_DATABASE/schema_manifest.json).
5. If column order/name differs: fix sheet to match schema; rerun `initAll()`.

**⚠️ Never:** Clear business data to "fix" schema. Export first.

---

## 6. Enum Mismatch

**Symptom:** AppSheet dropdown shows wrong/missing values; `auditEnumConsistency()` fails.

**Steps:**
1. Run `auditEnumConsistency()` — note mismatches.
2. If ENUM_DICTIONARY missing rows: run `seedEnumDictionary()`.
3. If DISPLAY_TEXT empty: run `ensureDisplayTextForEnumRows()`.
4. If enum values drifted: do NOT hardcode in AppSheet. Add rows via Admin Panel `adminCreateEnumRow` or fix ENUM_DICTIONARY sheet to match 01_ENUM_SEED.gs `ENUM_SEED_SPEC`.
5. Run `clearEnumCache()` if code changed; rerun `auditEnumConsistency()`.

**⚠️ Never:** Store display labels as source of truth in business sheets.

---

## 7. Master Code Mismatch

**Symptom:** MASTER_CODE dropdown wrong; `getMasterCodes` returns unexpected values.

**Steps:**
1. Run `ensureDisplayTextForMasterCodeRows()` for empty DISPLAY_TEXT.
2. Check MASTER_CODE sheet: STATUS, IS_SYSTEM, ALLOW_EDIT.
3. Add/edit via Admin Panel only (`adminCreateMasterCodeRow`, `adminUpdateMasterCodeRow`).
4. Run `clearMasterCodeCache()` after sheet changes.

**⚠️ Never:** Inline-edit MASTER_CODE in Sheets during production.

---

## 8. Display Mapping Issues

**Symptom:** Labels show codes instead of display text.

**Steps:**
1. Run `ensureDisplayTextForEnumRows()` and `ensureDisplayTextForMasterCodeRows()`.
2. Run `clearDisplayMappingCache()`.
3. Verify AppSheet config: 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md, APPSHEET_KEY_LABEL_MAP.md.
4. Ensure AppSheet references display columns or uses GAS for label resolution.

---

## 9. AppSheet Dropdown Wrong

**Symptom:** Dropdown shows wrong options; "Allow other values" enabled.

**Steps:**
1. Disable "Allow other values" for enum-bound columns.
2. Ensure list source = ENUM_DICTIONARY filtered by ENUM_GROUP, or MASTER_CODE filtered by MASTER_GROUP.
3. Check 04_APPSHEET/APPSHEET_ENUM_BINDING.md, APPSHEET_MASTER_CODE_BINDING.md.
4. Do NOT add enum values in AppSheet; add via GAS/Admin Panel.

---

## 10. Duplicate Trigger

**Symptom:** `dailyHealthCheck` or other trigger runs multiple times.

**Steps:**
1. In Apps Script: Edit → Current project's triggers.
2. Remove duplicate entries for same function.
3. Run `reinstallTriggers()` (in 90_BOOTSTRAP_INSTALL.gs) — uses `ensureNoDuplicateTrigger` before install.
4. Verify single trigger per handler.

---

## 11. Clasp Push Order Broken

**Symptom:** Reference errors after `clasp push`; functions undefined.

**Steps:**
1. Check `.clasp.json` `filePushOrder` matches 05_GAS_RUNTIME/CLASP_PUSH_ORDER.md.
2. Dependencies must load before dependents (CONFIG → ENUM → MASTER_CODE → SHARED → MODULES → DISPLAY → BOOTSTRAP).
3. Run `clasp push` — order is applied from filePushOrder.
4. If new file added: add to filePushOrder in correct position per DEPENDENCY_MAP.md.

---

## 12. Admin Panel Exposes Too Much

**Symptom:** Non-admin users see admin views; sensitive data exposed.

**Steps:**
1. Use separate Admin Panel app; share only with ADMIN_EMAILS.
2. Verify ADMIN_EMAILS in 00_CORE_CONFIG.gs.
3. Ensure ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG views have Valid_If restricting to admin.
4. See 04_APPSHEET/APPSHEET_ADMIN_SECURITY.md.
5. No inline add/edit for enum/master code — GAS actions only.

---

## 13. Audit Before Real Usage

- [ ] `initAll()` completed with no mismatches.
- [ ] `auditEnumConsistency()` passed.
- [ ] `verifyAppSheetReadiness()` passed.
- [ ] `auditSystem()` passed (optional; full system check).
- [ ] Test create: HoSo, Task, Finance transaction.
- [ ] Admin Panel: test enum create, master code create (if used).

---

## 14. Known Recovery Functions

| Function | Use |
|----------|-----|
| seedEnumDictionary() | Re-seed enum if sheet corrupted |
| ensureDisplayTextForEnumRows() | Fill empty DISPLAY_TEXT in ENUM_DICTIONARY |
| ensureDisplayTextForMasterCodeRows() | Fill empty DISPLAY_TEXT in MASTER_CODE |
| clearDisplayMappingCache() | After manual sheet edits |
| clearEnumCache() | After enum sheet changes |
| clearMasterCodeCache() | After MASTER_CODE sheet changes |
| reinstallTriggers() | Remove duplicates, reinstall triggers |

---

## 15. What NOT to Do in Production

- **Never** clear business sheets (HO_SO_*, TASK_*, FINANCE_*) casually.
- **Never** hardcode enum drift into AppSheet (e.g. allow free text for enum columns).
- **Never** bypass GAS validation for convenience (e.g. direct sheet writes from AppSheet).
- **Never** store display labels as source of truth in business tables.
- **Never** rename core sheets (ENUM_DICTIONARY, MASTER_CODE, etc.) casually.
- **Never** inline-edit ENUM_DICTIONARY or MASTER_CODE — use Admin Panel / GAS only.
- **Never** add users to ADMIN_EMAILS without governance approval.
