# Operator Deploy and Run Order

Exact steps only. See CBV_LAOCONG_PRO_REFERENCE.md for context.

---

## 1. First-time deploy

1. Create Google Sheets, bind Apps Script.
2. From repo root: `clasp push` (uses `.clasp.json` `filePushOrder`).
3. Edit `05_GAS_RUNTIME/00_CORE_CONFIG.gs`: set `ADMIN_EMAILS`.
4. In Apps Script: run `initAll()`.
5. In Apps Script: run `installTriggers()` (if using triggers).
6. In Apps Script: run `auditEnumConsistency()`.
7. In Apps Script: run `verifyAppSheetReadiness()`.
8. Configure AppSheet per `04_APPSHEET/APPSHEET_ENUM_BINDING.md`, `APPSHEET_DISPLAY_MAPPING.md`.
9. Test: create one HoSo, Task, Finance record.

---

## 2. Safe rerun

| Step | Function | File |
|------|----------|------|
| 1 | `initAll()` | 90_BOOTSTRAP_INIT.gs |
| 2 | `seedEnumDictionary()` | 01_ENUM_SEED.gs |
| 3 | `ensureDisplayTextForEnumRows()` | 40_DISPLAY_MAPPING_SERVICE.gs |
| 4 | `ensureDisplayTextForMasterCodeRows()` | 40_DISPLAY_MAPPING_SERVICE.gs |
| 5 | `reinstallTriggers()` | 90_BOOTSTRAP_INSTALL.gs |
| 6 | `clearEnumCache()` | 01_ENUM_REPOSITORY.gs |
| 7 | `clearMasterCodeCache()` | 02_MASTER_CODE_SERVICE.gs |
| 8 | `clearDisplayMappingCache()` | 40_DISPLAY_MAPPING_SERVICE.gs |

Idempotent. Use steps 2–4 for enum/display issues; 5 for trigger duplicates; 6–8 after manual sheet edits.

---

## 3. Audit-only run

1. `selfAuditBootstrap()` — 90_BOOTSTRAP_AUDIT.gs  
2. `auditEnumConsistency()` — 01_ENUM_AUDIT.gs  
3. `verifyAppSheetReadiness()` — 50_APPSHEET_VERIFY.gs  
4. `auditSystem()` — 90_BOOTSTRAP_AUDIT.gs (optional, full check)

Run 1–3 weekly. Run 4 before go-live or after schema changes.
