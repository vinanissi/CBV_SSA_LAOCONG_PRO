# AppSheet Enum Binding — ENUM_DICTIONARY

## Source
- Table: ENUM_DICTIONARY (Google Sheets)
- Filter: ENUM_GROUP = "[group]", IS_ACTIVE = TRUE

## Binding Method
Use Valid_If or List/Choice with SELECT from ENUM_DICTIONARY.

## GAS Validation
- `getEnumValues(enumGroup)` / `getActiveEnumValues(enumGroup)` — load from sheet
- `assertValidEnumValue(enumGroup, value, fieldName)` — throw if invalid

## Field Mappings

### TASK_MAIN.STATUS
- **Enum group:** TASK_STATUS
- **Non-editable:** Yes (change via GAS action only)
- **Valid_If (if editable):**
```
IN(
  [STATUS],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_STATUS", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### TASK_MAIN.PRIORITY
- **Enum group:** TASK_PRIORITY
- **Valid_If:**
```
IN(
  [PRIORITY],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_PRIORITY", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### TASK_MAIN.TASK_TYPE
- **Enum group:** TASK_TYPE
- **Valid_If:**
```
IN(
  [TASK_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### HO_SO_MASTER.HO_SO_TYPE_ID
- **Ref:** `MASTER_CODE` rows where `MASTER_GROUP = "HO_SO_TYPE"` (slice / Valid_If)
- **Valid_If:**
```
IN(
  [HO_SO_TYPE_ID],
  SELECT(MASTER_CODE[ID], AND([MASTER_GROUP] = "HO_SO_TYPE", [STATUS] = "ACTIVE", [IS_DELETED] = FALSE))
)
```

### HO_SO_MASTER.STATUS
- **Enum group:** HO_SO_STATUS
- **Source (production):** `HO_SO_ENUM` table — seed/sync via GAS `HOSO_EnumV2_syncAll()`. Stored value = `ENUM_VALUE`; label = `ENUM_LABEL` (tiếng Việt). Prefer dynamic `SELECT` below thay cho hardcode `SWITCH` / Enum tĩnh.
- **Non-editable:** Yes (change via GAS action only)
- **Valid_If (if editable):**
```
IN(
  [STATUS],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "HO_SO_STATUS", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

#### HO_SO_ENUM — dynamic Valid_If (STATUS + role + sort)

```
ORDERBY(
  SELECT(
    HO_SO_ENUM[ENUM_VALUE],
    AND(
      [ENUM_GROUP] = "HO_SO_STATUS",
      [IS_ACTIVE] = TRUE,
      OR(
        ISBLANK([ROLE_ALLOW]),
        IN(
          LOOKUP(USEREMAIL(), "USER_DIRECTORY", "EMAIL", "ROLE"),
          SPLIT([ROLE_ALLOW], ",")
        )
      ),
      NOT(
        IN(
          LOOKUP(USEREMAIL(), "USER_DIRECTORY", "EMAIL", "ROLE"),
          SPLIT([ROLE_DENY], ",")
        )
      )
    )
  ),
  [SORT_ORDER],
  TRUE
)
```

#### HO_SO_ENUM — label hiển thị (virtual / Display name column)

```
ANY(
  SELECT(
    HO_SO_ENUM[ENUM_LABEL],
    AND(
      [ENUM_GROUP] = "HO_SO_STATUS",
      [ENUM_VALUE] = [_THISROW].[STATUS]
    )
  )
)
```

#### HO_SO_ENUM — next status allowed (workflow transition)

```
SELECT(
  HO_SO_ENUM[ENUM_VALUE],
  AND(
    [ENUM_GROUP] = "HO_SO_STATUS",
    IN(
      [ENUM_VALUE],
      SPLIT(
        ANY(
          SELECT(
            HO_SO_ENUM[NEXT_ALLOWED_VALUES],
            AND(
              [ENUM_GROUP] = "HO_SO_STATUS",
              [ENUM_VALUE] = [_THISROW].[STATUS]
            )
          )
        ),
        ","
      )
    )
  )
)
```

*(Cảnh báo AppSheet: nếu `NEXT_ALLOWED_VALUES` hoặc `ROLE_DENY` trống, kiểm tra hành vi `SPLIT` / `IN` trên môi trường thật; có thể bọc `IFS` khi cần.)*

### FINANCE_TRANSACTION.TRANS_TYPE
- **Enum group:** FINANCE_TYPE
- **Non-editable when STATUS = CONFIRMED**
- **Valid_If:**
```
IN(
  [TRANS_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### FINANCE_TRANSACTION.STATUS
- **Enum group:** FINANCE_STATUS
- **Non-editable:** Yes (change via GAS action only)
- **Valid_If (if editable):**
```
IN(
  [STATUS],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_STATUS", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### FINANCE_TRANSACTION.CATEGORY
- **Enum group:** FIN_CATEGORY
- **Non-editable when STATUS = CONFIRMED**
- **Valid_If:**
```
IN(
  [CATEGORY],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FIN_CATEGORY", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### FINANCE_TRANSACTION.PAYMENT_METHOD
- **Enum group:** PAYMENT_METHOD
- **Valid_If:**
```
IN(
  [PAYMENT_METHOD],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "PAYMENT_METHOD", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### TASK_MAIN.RELATED_ENTITY_TYPE
- **Enum group:** RELATED_ENTITY_TYPE
- **Valid_If:**
```
IN(
  [RELATED_ENTITY_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "RELATED_ENTITY_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### FINANCE_TRANSACTION.RELATED_ENTITY_TYPE
- **Enum group:** RELATED_ENTITY_TYPE
- **Valid_If:**
```
IN(
  [RELATED_ENTITY_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "RELATED_ENTITY_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### HO_SO_FILE.FILE_GROUP
- **Enum group:** FILE_GROUP
- **Valid_If:**
```
IN(
  [FILE_GROUP],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FILE_GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### TASK_ATTACHMENT.ATTACHMENT_TYPE
- **Enum group:** TASK_ATTACHMENT_TYPE
- **Valid_If:**
```
IN(
  [ATTACHMENT_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### FINANCE_ATTACHMENT.ATTACHMENT_TYPE
- **Enum group:** FINANCE_ATTACHMENT_TYPE
- **Valid_If:**
```
IN(
  [ATTACHMENT_TYPE],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### TASK_UPDATE_LOG.ACTION
- **Enum group:** UPDATE_TYPE
- **Column name:** ACTION (maps to enum group UPDATE_TYPE)
- **Valid_If:**
```
IN(
  [ACTION],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "UPDATE_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

### MASTER_CODE.STATUS
- **Enum group:** MASTER_CODE_STATUS
- **Valid_If:**
```
IN(
  [STATUS],
  SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "MASTER_CODE_STATUS", ENUM_DICTIONARY[IS_ACTIVE] = TRUE))
)
```

## Display Mapping
- **Store:** ENUM_VALUE
- **Display:** DISPLAY_TEXT (if populated) else humanized ENUM_VALUE
- See 04_APPSHEET/APPSHEET_DISPLAY_MAPPING.md

## Choice/List Configuration
For dropdowns, add ENUM_DICTIONARY as a table and use:
- **List:** ENUM_DICTIONARY
- **Filter:** `AND([ENUM_GROUP] = "TASK_STATUS", [IS_ACTIVE] = TRUE)`
- **Display column:** ENUM_VALUE (or DISPLAY_TEXT if populated)
- **Value column:** ENUM_VALUE

## Rules
- Do NOT enable "Allow other values"
- Backend (GAS) validation is the real guard; AppSheet Valid_If is UI-only
- STATUS fields: keep non-editable; use GAS actions
