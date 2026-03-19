# AppSheet Attachment Field Policy

Field policy for attachment tables. See APPSHEET_FIELD_POLICY_MAP.md for full schema.

---

## HO_SO_FILE

| Field | Show | Editable | Notes |
|-------|------|----------|-------|
| ID | OFF | FALSE | Hidden |
| HO_SO_ID | ON | FALSE (inline) | Set by parent when IsPartOf |
| FILE_GROUP | ON | TRUE | Valid_If ENUM_DICTIONARY FILE_GROUP |
| FILE_NAME | ON | TRUE | |
| FILE_URL | ON | TRUE | Type = File |
| DRIVE_FILE_ID | OFF | FALSE | Hidden |
| STATUS | ON | FALSE | Controlled |
| NOTE | ON | TRUE | |
| CREATED_AT | OFF | FALSE | Hidden |
| CREATED_BY | OFF | FALSE | Hidden |

---

## TASK_ATTACHMENT

| Field | Show | Editable | Notes |
|-------|------|----------|-------|
| ID | OFF | FALSE | Hidden |
| TASK_ID | ON | FALSE (inline) | Set by parent when IsPartOf |
| ATTACHMENT_TYPE | ON | TRUE | Valid_If ENUM_DICTIONARY TASK_ATTACHMENT_TYPE |
| TITLE | ON | TRUE | Label column |
| FILE_NAME | ON | TRUE | |
| FILE_URL | ON | TRUE | Type = File |
| DRIVE_FILE_ID | OFF | FALSE | Hidden |
| NOTE | ON | TRUE | |
| CREATED_AT | OFF | FALSE | Hidden |
| CREATED_BY | OFF | FALSE | Hidden |

---

## FINANCE_ATTACHMENT

| Field | Show | Editable | Notes |
|-------|------|----------|-------|
| ID | OFF | FALSE | Hidden |
| FINANCE_ID | ON | FALSE (inline) | Set by parent when IsPartOf |
| ATTACHMENT_TYPE | ON | TRUE | Valid_If ENUM_DICTIONARY FINANCE_ATTACHMENT_TYPE |
| TITLE | ON | TRUE | Label column |
| FILE_NAME | ON | TRUE | |
| FILE_URL | ON | TRUE | Type = File |
| DRIVE_FILE_ID | OFF | FALSE | Hidden |
| NOTE | ON | TRUE | |
| CREATED_AT | OFF | FALSE | Hidden |
| CREATED_BY | OFF | FALSE | Hidden |

---

## Valid_If Expressions

### HO_SO_FILE.FILE_GROUP
```
IN([FILE_GROUP], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FILE_GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

### TASK_ATTACHMENT.ATTACHMENT_TYPE
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "TASK_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

### FINANCE_ATTACHMENT.ATTACHMENT_TYPE
```
IN([ATTACHMENT_TYPE], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "FINANCE_ATTACHMENT_TYPE", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```

---

## Recommended Form Behavior

- **Inline create:** Parent ref hidden; auto-linked
- **FILE_URL:** Type = File; user uploads; AppSheet stores URL
- **TITLE:** Optional; defaults to FILE_NAME if blank
- **ATTACHMENT_TYPE / FILE_GROUP:** Dropdown; do not allow other values
