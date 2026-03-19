# Display Mapping Audit

## Design Rules

1. **DB stores machine value** — CODE, ENUM_VALUE
2. **UI shows display value** — DISPLAY_TEXT or computed fallback
3. **GAS translates when needed** — getEnumDisplay(), getMasterCodeDisplay()
4. **No joins by name**
5. **No storing display strings as source of truth**

---

## Auto-Generation Rules

### ENUM_DICTIONARY DISPLAY_TEXT
- **When empty:** Humanize ENUM_VALUE (IN_PROGRESS → "In Progress")
- **When present:** Preserve explicit DISPLAY_TEXT
- **Never overwrite** non-empty DISPLAY_TEXT

### MASTER_CODE DISPLAY_TEXT
- **When empty:** 
  - if SHORT_NAME exists: SHORT_NAME + " - " + NAME
  - else if CODE and NAME exist: CODE + " - " + NAME
  - else: NAME or CODE
- **When present:** Preserve explicit DISPLAY_TEXT
- **Never overwrite** non-empty DISPLAY_TEXT

---

## GAS Functions

| Function | Purpose |
|----------|---------|
| getEnumDisplay(enumGroup, enumValue) | Lookup display for enum; fallback to humanized |
| getMasterCodeDisplay(masterGroup, code) | Lookup display for master code; fallback to computed |
| ensureDisplayTextForEnumRows() | Idempotent fill of empty DISPLAY_TEXT in ENUM_DICTIONARY |
| ensureDisplayTextForMasterCodeRows() | Idempotent fill of empty DISPLAY_TEXT in MASTER_CODE |
| clearDisplayMappingCache() | Clear caches after sheet edits |

---

## Records/Fields Affected

### ENUM_DICTIONARY
- **DISPLAY_TEXT** — filled when empty; never overwritten when present
- **UPDATED_AT, UPDATED_BY** — set when DISPLAY_TEXT is updated

### MASTER_CODE
- **DISPLAY_TEXT** — filled when empty; never overwritten when present
- **UPDATED_AT, UPDATED_BY** — set when DISPLAY_TEXT is updated

---

## Audit Run Order

1. seedEnumDictionary()
2. ensureDisplayTextForEnumRows()
3. ensureDisplayTextForMasterCodeRows()
4. auditEnumConsistency()
