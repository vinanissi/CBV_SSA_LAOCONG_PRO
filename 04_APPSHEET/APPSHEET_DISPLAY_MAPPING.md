# AppSheet Display Mapping

## Enforcement Rule

- **DB stores machine value** (CODE, ENUM_VALUE)
- **UI shows display value** (DISPLAY_TEXT or fallback)
- **GAS translates when needed** via getEnumDisplay(), getMasterCodeDisplay()
- **No joins by name**
- **No storing display strings as source of truth**

---

## ENUM_DICTIONARY Fields

| Stored | Display |
|--------|---------|
| ENUM_VALUE | DISPLAY_TEXT (if populated) else humanized ENUM_VALUE |

### AppSheet Configuration
- **Value column:** ENUM_VALUE
- **Display column:** DISPLAY_TEXT
- **Display expression (if conditional):** `IF(ISBLANK([DISPLAY_TEXT]), [ENUM_VALUE], [DISPLAY_TEXT])`

For List/Choice with ENUM_DICTIONARY:
- **Value column:** ENUM_VALUE
- **Display column:** DISPLAY_TEXT
- **If DISPLAY_TEXT can be empty:** Use AppSheet formula `IF(ISBLANK([DISPLAY_TEXT]), [ENUM_VALUE], [DISPLAY_TEXT])` as virtual column or pick DISPLAY_TEXT as display (AppSheet shows blank as fallback)

### Per-Screen Usage
- **Do NOT** duplicate display logic per screen
- Add ENUM_DICTIONARY once as table; reference for all enum-backed fields
- Use same Display column configuration everywhere

---

## MASTER_CODE Fields

| Stored | Display |
|--------|---------|
| CODE | DISPLAY_TEXT (if populated) else SHORT_NAME + " - " + NAME, or CODE + " - " + NAME, or NAME, or CODE |

### AppSheet Configuration
- **Value column:** CODE
- **Display column:** DISPLAY_TEXT
- **Fallback:** `IF(ISBLANK([DISPLAY_TEXT]), IF(ISBLANK([SHORT_NAME]), IF(ISBLANK([NAME]), [CODE], [CODE] & " - " & [NAME]), [SHORT_NAME] & " - " & [NAME]), [DISPLAY_TEXT])`

Simpler approach: Use DISPLAY_TEXT as display column; run ensureDisplayTextForMasterCodeRows() so DISPLAY_TEXT is populated.

### Per-Screen Usage
- **Do NOT** duplicate display logic per screen
- Add MASTER_CODE once; use for all master-code-backed fields
- Value column = CODE always; Display = DISPLAY_TEXT or NAME

---

## Display Logic Summary

| Source | Value Stored | Display Shown |
|--------|--------------|---------------|
| ENUM_DICTIONARY | ENUM_VALUE | DISPLAY_TEXT or humanized ENUM_VALUE |
| MASTER_CODE | CODE | DISPLAY_TEXT or SHORT_NAME+" - "+NAME or CODE+" - "+NAME or NAME or CODE |

---

## GAS Helpers

- `getEnumDisplay(enumGroup, enumValue)` — returns display string for enum
- `getMasterCodeDisplay(masterGroup, code)` — returns display string for master code
- `ensureDisplayTextForEnumRows()` — fills empty DISPLAY_TEXT in ENUM_DICTIONARY
- `ensureDisplayTextForMasterCodeRows()` — fills empty DISPLAY_TEXT in MASTER_CODE

---

## Run Order

1. seedEnumDictionary()
2. ensureDisplayTextForEnumRows()
3. ensureDisplayTextForMasterCodeRows() (if MASTER_CODE has data)
