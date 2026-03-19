# Mapping Audit — ENUM_DICTIONARY / MASTER_CODE → GAS / AppSheet

## Runtime Sources
- **ENUM_DICTIONARY** — locked workflow enums (TASK_STATUS, FINANCE_TYPE, etc.)
- **MASTER_CODE** — dynamic business codes (TASK_GROUP, FINANCE_CATEGORY, DOCUMENT_TYPE, etc.)

## GAS Functions

### Enum (ENUM_DICTIONARY)
| Function | Returns | Use |
|----------|---------|-----|
| getEnumValues(enumGroup) | string[] | Active ENUM_VALUE list |
| getActiveEnumValues(enumGroup) | string[] | Same as getEnumValues |
| isValidEnumValue(enumGroup, value) | boolean | Check validity |
| assertValidEnumValue(enumGroup, value, fieldName) | void | Throw if invalid |

### Master Code (MASTER_CODE)
| Function | Returns | Use |
|----------|---------|-----|
| getMasterCodes(masterGroup) | string[] | Active CODE list |
| getActiveMasterCodes(masterGroup) | string[] | Same as getMasterCodes |
| getMasterCodeValues(masterGroup) | string[] | Same as getMasterCodes |
| isValidMasterCode(masterGroup, code) | boolean | Check validity |
| assertValidMasterCode(masterGroup, code, fieldName) | void | Throw if invalid |

---

## Enum Field Mapping

| Table.Field | ENUM_GROUP | In Schema | GAS Validation |
|-------------|------------|-----------|----------------|
| HO_SO_MASTER.HO_SO_TYPE | HO_SO_TYPE | ✓ | assertValidEnumValue('HO_SO_TYPE', ...) |
| HO_SO_MASTER.STATUS | HO_SO_STATUS | ✓ | assertValidEnumValue('HO_SO_STATUS', ...) |
| TASK_MAIN.TASK_TYPE | TASK_TYPE | ✓ | assertValidEnumValue('TASK_TYPE', ...) |
| TASK_MAIN.STATUS | TASK_STATUS | ✓ | ensureTransition (non-editable) |
| TASK_MAIN.PRIORITY | TASK_PRIORITY | ✓ | assertValidEnumValue('TASK_PRIORITY', ...) |
| TASK_ATTACHMENT.ATTACHMENT_TYPE | ATTACHMENT_TYPE | ✗ | — |
| TASK_UPDATE_LOG.ACTION | UPDATE_TYPE | ✓ (column=ACTION) | — |
| FINANCE_TRANSACTION.TRANS_TYPE | FINANCE_TYPE | ✓ | assertValidEnumValue('FINANCE_TYPE', ...) |
| FINANCE_TRANSACTION.STATUS | FINANCE_STATUS | ✓ | ensureTransition (non-editable) |
| FINANCE_TRANSACTION.PAYMENT_METHOD | PAYMENT_METHOD | ✓ | assertValidEnumValue('PAYMENT_METHOD', ...) |

---

## MASTER_CODE Field Mapping

| Table.Field | MASTER_GROUP | In Schema | GAS Validation |
|-------------|--------------|-----------|----------------|
| TASK_MAIN.TASK_GROUP_CODE | TASK_GROUP | ✗ | — |
| FINANCE_TRANSACTION.CATEGORY_CODE | FINANCE_CATEGORY | ✗ | — |
| TASK_ATTACHMENT.DOC_GROUP_CODE | DOCUMENT_TYPE | ✗ | — |

**Note:** FINANCE_TRANSACTION.CATEGORY exists and uses FIN_CATEGORY (enum). CATEGORY_CODE would be a separate field for dynamic categories.

---

## Missing Fields

| Field | Table | Status |
|-------|-------|--------|
| ATTACHMENT_TYPE | TASK_ATTACHMENT | Not in schema |
| TASK_GROUP_CODE | TASK_MAIN | Not in schema |
| CATEGORY_CODE | FINANCE_TRANSACTION | Not in schema |
| DOC_GROUP_CODE | TASK_ATTACHMENT | Not in schema |

---

## Display Mapping
- **ENUM_DICTIONARY:** DISPLAY_TEXT (if populated) else ENUM_VALUE
- **MASTER_CODE:** DISPLAY_TEXT (if populated) else NAME

---

## AppSheet Binding Rules
1. GAS is the real validator; AppSheet Valid_If is UI-only
2. Do NOT enable "Allow other values"
3. Add ENUM_DICTIONARY and MASTER_CODE as tables in AppSheet
4. Use IN([Field], SELECT(...)) for Valid_If

---

## Audit Run Order
1. seedEnumDictionary()
2. auditEnumConsistency()
3. verifyAppSheetReadiness()
