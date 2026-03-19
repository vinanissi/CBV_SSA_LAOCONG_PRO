# CBV LAOCONG PRO — Consolidated Reference

Behavior, schema, GAS/AppSheet mapping, enum/master-code layers, and admin governance preserved. This doc consolidates structure, deployment order, callable functions, and operations.

---

## Functions to Run (in order)

1. **initAll()** — sheets, headers, enum seed, display fill
2. **Configure ADMIN_EMAILS** in 00_CORE_CONFIG.gs (before admin panel use)
3. **installTriggers()** — if using triggers
4. **auditEnumConsistency()** — verify enum layer
5. **verifyAppSheetReadiness()** — tables, keys, enum coverage

---

## 1. Stable Structure

```
05_GAS_RUNTIME/
├── 00_CORE_CONFIG.gs         # CBV_CONFIG, SHEETS
├── 00_CORE_CONSTANTS.gs      # CBV_ENUM fallback (when sheet empty)
├── 00_CORE_UTILS.gs          # cbvNow, cbvUser, cbvAssert, isAdminUser, assertAdminAuthority
├── 01_ENUM_REPOSITORY.gs     # ENUM_DICTIONARY sheet loader
├── 01_ENUM_SERVICE.gs        # getEnumValues, assertValidEnumValue
├── 01_ENUM_SEED.gs           # seedEnumDictionary()
├── 01_ENUM_AUDIT.gs          # auditEnumConsistency()
├── 02_MASTER_CODE_SERVICE.gs # getMasterCodes, assertValidMasterCode
├── 03_SHARED_REPOSITORY.gs   # _sheet, _rows, _findById, _appendRecord, _updateRow
├── 03_SHARED_VALIDATION.gs   # ensureRequired, ensureEnum, ensureTransition
├── 03_SHARED_LOGGER.gs       # logAdminAudit, logAction
├── 01_ENUM_ADMIN_SERVICE.gs  # adminCreateEnumRow, adminUpdateEnumRow, adminSetEnumActive
├── 02_MASTER_CODE_ADMIN_SERVICE.gs # adminCreateMasterCodeRow, adminUpdateMasterCodeRow, adminSetMasterCodeStatus
├── 03_ADMIN_AUDIT_SERVICE.gs # logAdminAction (alias)
├── 10_HOSO_SERVICE.gs
├── 20_TASK_SERVICE.gs
├── 30_FINANCE_SERVICE.gs
├── 40_DISPLAY_MAPPING_SERVICE.gs # getEnumDisplay, getMasterCodeDisplay, ensureDisplayText*
├── 50_APPSHEET_VERIFY.gs
├── 90_BOOTSTRAP_SCHEMA.gs    # CBV_SCHEMA_MANIFEST, getRequiredSheetNames
├── 90_BOOTSTRAP_INIT.gs      # initAll(), initCoreSheets()
├── 90_BOOTSTRAP_AUDIT.gs     # selfAuditBootstrap(), auditSystem()
├── 90_BOOTSTRAP_MENU.gs
├── 90_BOOTSTRAP_TRIGGER.gs
├── 90_BOOTSTRAP_INSTALL.gs
└── 99_DEBUG_*.gs             # test_hoso, test_task, test_finance, test_runner, sample_data

03_SHARED/
├── ENUM_DICTIONARY_STANDARD.md
├── ENUM_DICTIONARY.md
├── MASTER_CODE_STANDARD.md
└── SHEET_DICTIONARY_MASTER.md

04_APPSHEET/
├── APPSHEET_ENUM_BINDING.md
├── APPSHEET_MASTER_CODE_BINDING.md
├── APPSHEET_DISPLAY_MAPPING.md
├── ADMIN_PANEL_DATA_MODEL.md
├── APPSHEET_ADMIN_PANEL.md
└── APPSHEET_ADMIN_SECURITY.md

06_DATABASE/
├── schema_manifest.json
├── MASTER_CODE_SCHEMA.md
├── ENUM_DICTIONARY_SCHEMA.md
└── _generated_schema/*.csv

09_AUDIT/
├── ENUM_SYNC_AUDIT.md
├── MAPPING_AUDIT.md
├── DISPLAY_MAPPING_AUDIT.md
└── ADMIN_GOVERNANCE_AUDIT.md
```

---

## 2. Runtime Sources

| Sheet | Role | Stored Value | Display |
|-------|------|--------------|---------|
| ENUM_DICTIONARY | Locked workflow enums | ENUM_VALUE | DISPLAY_TEXT |
| MASTER_CODE | Dynamic business codes | CODE | DISPLAY_TEXT or NAME |

---

## 3. GAS Functions (Run Order)

### Bootstrap (run once)
| Function | Purpose |
|----------|---------|
| initAll() | Creates sheets, seeds ENUM_DICTIONARY, fills DISPLAY_TEXT |

### Enum Layer
| Function | Purpose |
|----------|---------|
| seedEnumDictionary() | Idempotent seed ENUM_DICTIONARY |
| ensureDisplayTextForEnumRows() | Fill empty DISPLAY_TEXT (called by initAll) |
| getEnumValues(enumGroup) | Active ENUM_VALUE list |
| getActiveEnumValues(enumGroup) | Same |
| isValidEnumValue(enumGroup, value) | Check validity |
| assertValidEnumValue(enumGroup, value, fieldName) | Throw if invalid |
| getEnumDisplay(enumGroup, enumValue) | Display string for UI |

### Master Code Layer
| Function | Purpose |
|----------|---------|
| ensureDisplayTextForMasterCodeRows() | Fill empty DISPLAY_TEXT (called by initAll) |
| getMasterCodes(masterGroup) | Active CODE list |
| getActiveMasterCodes(masterGroup) | Same |
| getMasterCodeValues(masterGroup) | Same |
| isValidMasterCode(masterGroup, code) | Check validity |
| assertValidMasterCode(masterGroup, code, fieldName) | Throw if invalid |
| getMasterCodeDisplay(masterGroup, code) | Display string for UI |

### Admin Panel (ADMIN only; requires ADMIN_EMAILS)
| Function | Purpose |
|----------|---------|
| adminCreateEnumRow(data) | Create enum row; audits |
| adminUpdateEnumRow(id, patch) | Update DISPLAY_TEXT, SORT_ORDER, NOTE |
| adminSetEnumActive(id, isActive) | Activate/inactivate enum |
| adminCreateMasterCodeRow(data) | Create master code row; audits |
| adminUpdateMasterCodeRow(id, patch) | Update NAME, DISPLAY_TEXT, etc. (!IS_SYSTEM, ALLOW_EDIT) |
| adminSetMasterCodeStatus(id, status) | Set STATUS; !IS_SYSTEM, ALLOW_EDIT |
| logAdminAudit(...) | Append to ADMIN_AUDIT_LOG (internal) |
| logAdminAction(...) | Alias for logAdminAudit |

### Audit
| Function | Purpose |
|----------|---------|
| auditEnumConsistency() | Check enum sheet vs repo |
| verifyAppSheetReadiness() | Tables, keys, enum coverage (calls selfAuditBootstrap) |
| selfAuditBootstrap() | Sheets, headers only |
| auditSystem() | Full system audit |

### Triggers
| Function | Purpose |
|----------|---------|
| installTriggers() | Install triggers (run after initAll) |

---

## 4. Deployment Order

**Push order:** Deterministic `filePushOrder` in `.clasp.json`. See `05_GAS_RUNTIME/CLASP_PUSH_ORDER.md`.

```
1. clasp push                    # Deploy GAS (30 files; order in .clasp.json)
2. Configure ADMIN_EMAILS        # In 00_CORE_CONFIG.gs: add admin email(s)
3. initAll()                     # Sheets + headers + enum seed + display fill
4. installTriggers()             # If using triggers
5. auditEnumConsistency()        # Verify enum layer
6. verifyAppSheetReadiness()     # Verify tables for AppSheet
7. Configure AppSheet:
   - Add ENUM_DICTIONARY, MASTER_CODE, ADMIN_AUDIT_LOG tables
   - Apply Valid_If from 04_APPSHEET/APPSHEET_ENUM_BINDING.md
   - Apply display config from 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md
8. Admin Panel (if used): separate app, GAS actions only — see 04_APPSHEET/APPSHEET_ADMIN_PANEL.md
```

---

## 5. Doc References

| Topic | File |
|-------|------|
| Enum standard | 03_SHARED/ENUM_DICTIONARY_STANDARD.md |
| Master code standard | 03_SHARED/MASTER_CODE_STANDARD.md |
| Enum binding (AppSheet) | 04_APPSHEET/APPSHEET_ENUM_BINDING.md |
| Master code binding | 04_APPSHEET/APPSHEET_MASTER_CODE_BINDING.md |
| Display mapping | 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md |
| GAS bootstrap | 05_GAS_RUNTIME/GAS_BOOTSTRAP_SPEC_LAOCONG_PRO.md |
| Clasp push order | 05_GAS_RUNTIME/CLASP_PUSH_ORDER.md |
| Admin governance | 00_META/CBV_ADMIN_GOVERNANCE_STANDARD.md |
| Admin panel | 04_APPSHEET/APPSHEET_ADMIN_PANEL.md |
| Admin security | 04_APPSHEET/APPSHEET_ADMIN_SECURITY.md |
| Dependency map | 05_GAS_RUNTIME/DEPENDENCY_MAP.md |
| Dependency audit | 09_AUDIT/DEPENDENCY_AUDIT.md |
| Mapping audit | 09_AUDIT/MAPPING_AUDIT.md |
| Display audit | 09_AUDIT/DISPLAY_MAPPING_AUDIT.md |

---

## 6. Optional / Recovery
| Function | Use |
|----------|-----|
| seedEnumDictionary() | Re-seed enum if sheet corrupted (normally called by initAll) |
| ensureDisplayTextForEnumRows() | Re-fill empty DISPLAY_TEXT |
| ensureDisplayTextForMasterCodeRows() | Re-fill empty DISPLAY_TEXT |
| clearDisplayMappingCache() | After manual sheet edits |

---

## 7. Schema

- ADMIN_AUDIT_LOG, MASTER_CODE, ENUM_DICTIONARY (enum by seed)
- HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION
- TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT
- FINANCE_ATTACHMENT, FINANCE_TRANSACTION, FINANCE_LOG

## 8. Final Callable Function List (by layer)

### Bootstrap / Init
| Function | File | Purpose |
|----------|------|---------|
| initAll | 90_BOOTSTRAP_INIT | Sheets, enum seed, display fill |
| seedEnumDictionary | 01_ENUM_SEED | Idempotent enum seed |
| installTriggers | 90_BOOTSTRAP_INSTALL | Install triggers |

### Enum
| Function | File | Purpose |
|----------|------|---------|
| getEnumValues, getActiveEnumValues | 01_ENUM_SERVICE | Active values |
| assertValidEnumValue | 01_ENUM_SERVICE | Validation |
| getEnumDisplay | 40_DISPLAY_MAPPING_SERVICE | Display string |

### Master Code
| Function | File | Purpose |
|----------|------|---------|
| getMasterCodes, getMasterCodeValues | 02_MASTER_CODE_SERVICE | Active codes |
| assertValidMasterCode | 02_MASTER_CODE_SERVICE | Validation |
| getMasterCodeDisplay | 40_DISPLAY_MAPPING_SERVICE | Display string |

### Admin (ADMIN_EMAILS required)
| Function | File | Purpose |
|----------|------|---------|
| adminCreateEnumRow | 01_ENUM_ADMIN_SERVICE | Create enum |
| adminUpdateEnumRow | 01_ENUM_ADMIN_SERVICE | Update enum |
| adminSetEnumActive | 01_ENUM_ADMIN_SERVICE | Activate/inactivate enum |
| adminCreateMasterCodeRow | 02_MASTER_CODE_ADMIN_SERVICE | Create master code |
| adminUpdateMasterCodeRow | 02_MASTER_CODE_ADMIN_SERVICE | Update master code |
| adminSetMasterCodeStatus | 02_MASTER_CODE_ADMIN_SERVICE | Set status |

### Module (HoSo, Task, Finance)
| Function | File | Purpose |
|----------|------|---------|
| createHoSo, updateHoSo, setHoSoStatus, attachHoSoFile | 10_HOSO_SERVICE | HoSo CRUD + attachments |
| createTask, setTaskStatus, createTaskAttachment | 20_TASK_SERVICE | Task CRUD + attachments |
| createTransaction, setFinanceStatus, createFinanceAttachment | 30_FINANCE_SERVICE | Finance CRUD + attachments |

### Audit
| Function | File | Purpose |
|----------|------|---------|
| auditEnumConsistency | 01_ENUM_AUDIT | Enum check |
| verifyAppSheetReadiness | 50_APPSHEET_VERIFY | AppSheet readiness |
| selfAuditBootstrap, auditSystem | 90_BOOTSTRAP_AUDIT | System audit |

---

## 9. Admin Operating Checklist

See **04_APPSHEET/ADMIN_OPERATING_CHECKLIST.md**.

---

## 10. Limitations / Deferred Items

- **auditMasterCodeConsistency():** Not implemented. Master code integrity is maintained via Admin Panel guards and ALLOW_EDIT/IS_SYSTEM checks.
- **ENUM_DICTIONARY:** Not in schema_manifest.json. Created by `seedEnumDictionary()` (01_ENUM_SEED.gs). `verifyAppSheetReadiness()` checks the 11 schema sheets only; ENUM_DICTIONARY must exist after `initAll()`.
- **Role automation:** Role assignment is manual (AppSheet Accounts). No USER_ROLE sheet or automatic role sync.
- **Triggers:** Optional. `dailyHealthCheck` is the only scheduled trigger; no automatic workflow transitions.
