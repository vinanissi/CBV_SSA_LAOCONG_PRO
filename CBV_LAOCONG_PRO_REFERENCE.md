# CBV LAOCONG PRO — Consolidated Reference

Behavior, schema, GAS/AppSheet mapping, and enum/master-code layers are unchanged. This doc consolidates structure, docs, and run order.

---

## Functions to Run (in order)

1. **initAll()** — sheets, headers, enum seed, display fill
2. **installTriggers()** — if using triggers
3. **auditEnumConsistency()** — verify enum layer
4. **verifyAppSheetReadiness()** — tables, keys, enum coverage

---

## 1. Stable Structure

```
05_GAS_RUNTIME/
├── config.gs                 # CBV_CONFIG, SHEETS
├── enum.gs                   # CBV_ENUM fallback (when sheet empty)
├── enum_repository.gs        # ENUM_DICTIONARY sheet loader
├── enum_service.gs           # getEnumValues, assertValidEnumValue
├── enum_seed.gs              # seedEnumDictionary()
├── enum_audit.gs             # auditEnumConsistency()
├── util.gs                   # cbvNow, cbvUser, cbvAssert, buildStructuredBootstrapReport
├── repository.gs             # _sheet, _rows, _findById, _appendRecord, _updateRow
├── validation_service.gs     # ensureRequired, ensureEnum, ensureTransition
├── log_service.gs            # log helpers
├── schema_manifest.gs        # CBV_SCHEMA_MANIFEST, getRequiredSheetNames
├── init_schema.gs            # initAll(), initCoreSheets()
├── master_code_service.gs    # getMasterCodes, assertValidMasterCode
├── display_mapping_service.gs # getEnumDisplay, getMasterCodeDisplay, ensureDisplayText*
├── ho_so_service.gs
├── task_service.gs
├── finance_service.gs
├── audit_service.gs
├── bootstrap_menu.gs
├── triggers.gs
├── install.gs
└── verify_appsheet.gs

03_SHARED/
├── ENUM_DICTIONARY_STANDARD.md
├── ENUM_DICTIONARY.md
├── MASTER_CODE_STANDARD.md
└── SHEET_DICTIONARY_MASTER.md

04_APPSHEET/
├── APPSHEET_ENUM_BINDING.md      # Enum Valid_If formulas
├── APPSHEET_MASTER_CODE_BINDING.md
└── APPSHEET_DISPLAY_MAPPING.md

06_DATABASE/
├── schema_manifest.json
├── MASTER_CODE_SCHEMA.md
├── ENUM_DICTIONARY_SCHEMA.md
└── _generated_schema/*.csv

09_AUDIT/
├── ENUM_SYNC_AUDIT.md
├── MAPPING_AUDIT.md
└── DISPLAY_MAPPING_AUDIT.md
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

```
1. clasp push                    # Deploy GAS
2. initAll()                     # Sheets + headers + enum seed + display fill
3. installTriggers()             # If using triggers
4. auditEnumConsistency()        # Verify enum layer
5. verifyAppSheetReadiness()     # Verify tables for AppSheet
6. Configure AppSheet:
   - Add ENUM_DICTIONARY table
   - Add MASTER_CODE table
   - Apply Valid_If from 04_APPSHEET/APPSHEET_ENUM_BINDING.md
   - Apply display config from 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md
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

## 7. Schema (No Change)

- MASTER_CODE, HO_SO_MASTER, HO_SO_FILE, HO_SO_RELATION
- TASK_MAIN, TASK_CHECKLIST, TASK_UPDATE_LOG, TASK_ATTACHMENT
- FINANCE_TRANSACTION, FINANCE_LOG
- ENUM_DICTIONARY (created by seed, not in schema_manifest)
