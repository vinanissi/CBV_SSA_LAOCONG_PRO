# AppSheet Enum & Master Code Binding — CBV_SSA_LAOCONG_PRO

ENUM_DICTIONARY, MASTER_CODE, display mapping, Valid_If patterns.

---

## ENUM_DICTIONARY

**Source:** Google Sheets, ENUM_DICTIONARY table. Filter: ENUM_GROUP = "[group]", IS_ACTIVE = TRUE.

**GAS:** getEnumValues(), assertValidEnumValue()

### Valid_If Pattern

```
IN([FIELD], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "GROUP_NAME", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

### Field Mappings (Phase 1)

| Field | ENUM_GROUP |
|-------|------------|
| HO_SO_MASTER.HO_SO_TYPE | HO_SO_TYPE |
| HO_SO_MASTER.STATUS | HO_SO_STATUS |
| HO_SO_FILE.FILE_GROUP | FILE_GROUP |
| TASK_MAIN.TASK_TYPE | TASK_TYPE |
| TASK_MAIN.STATUS | TASK_STATUS |
| TASK_MAIN.PRIORITY | TASK_PRIORITY |
| TASK_MAIN.RELATED_ENTITY_TYPE | RELATED_ENTITY_TYPE |
| TASK_ATTACHMENT.ATTACHMENT_TYPE | TASK_ATTACHMENT_TYPE |
| FINANCE_TRANSACTION.TRANS_TYPE | FINANCE_TYPE |
| FINANCE_TRANSACTION.STATUS | FINANCE_STATUS |
| FINANCE_TRANSACTION.CATEGORY | FIN_CATEGORY |
| FINANCE_TRANSACTION.PAYMENT_METHOD | PAYMENT_METHOD |
| FINANCE_ATTACHMENT.ATTACHMENT_TYPE | FINANCE_ATTACHMENT_TYPE |

**Rules:** Do NOT enable "Allow other values". STATUS fields: Editable=FALSE.

---

## MASTER_CODE

**Source:** Google Sheets, MASTER_CODE table. Filter: MASTER_GROUP = "[group]", STATUS = "ACTIVE", IS_DELETED = FALSE.

**GAS:** getMasterCodes(), assertValidMasterCode()

### Valid_If Pattern (when field stores CODE)

```
IN([FIELD], SELECT(MASTER_CODE[CODE], AND(MASTER_CODE[MASTER_GROUP] = "GROUP", MASTER_CODE[STATUS] = "ACTIVE", MASTER_CODE[IS_DELETED] = FALSE)))
```

### Phase 1 MASTER_CODE Usage

- **UNIT_ID** (FINANCE_TRANSACTION): Ref to MASTER_CODE; MASTER_GROUP = "UNIT" (when data exists)
- **TASK_GROUP_CODE, CATEGORY_CODE, DOC_GROUP_CODE:** ⚠️ NOT IN SCHEMA — future/optional. Do not add to Phase 1.

---

## Display Mapping

| Source | Value Stored | Display Shown |
|--------|--------------|---------------|
| ENUM_DICTIONARY | ENUM_VALUE | DISPLAY_TEXT or humanized ENUM_VALUE |
| MASTER_CODE | CODE | DISPLAY_TEXT or SHORT_NAME+" - "+NAME or CODE |

**Rule:** DB stores machine value; UI shows display. No joins by name. GAS: getEnumDisplay(), getMasterCodeDisplay().

**AppSheet:** Value column = ENUM_VALUE or CODE; Display column = DISPLAY_TEXT. Run ensureDisplayTextForEnumRows(), ensureDisplayTextForMasterCodeRows() so DISPLAY_TEXT is populated.
