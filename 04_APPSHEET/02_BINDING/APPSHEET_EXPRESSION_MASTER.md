# AppSheet Expression Master — CBV_SSA_LAOCONG_PRO

Reusable expressions: Valid_If, Editable_If, Show_If, filters, action conditions.

---

## Slice Conditions

### TASK_OPEN
```
IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))
```

### TASK_DONE
```
[STATUS] = "DONE"
```

### HO_SO_ACTIVE
```
[IS_DELETED] = FALSE
```

### FIN_DRAFT
```
[STATUS] = "NEW"
```

### FIN_CONFIRMED
```
[STATUS] = "CONFIRMED"
```

---

## Action Conditions

### Is open task
```
IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))
```

### Is current owner
```
[OWNER_ID] = USEREMAIL()
```

### Can complete task
```
AND(
  IN([STATUS], LIST("IN_PROGRESS", "WAITING")),
  COUNT(SELECT(TASK_CHECKLIST[ID], AND([TASK_ID] = [_THISROW].[ID], [IS_REQUIRED] = TRUE, [IS_DONE] <> TRUE))) = 0
)
```

### Can confirm finance
```
AND([STATUS] = "NEW", [AMOUNT] > 0, ISNOTBLANK([CATEGORY]))
```

---

## Editable_If

### FINANCE business fields (lock when CONFIRMED)
```
[STATUS] <> "CONFIRMED"
```

---

## Valid_If (Enum)

Standard pattern — see APPSHEET_ENUM_MASTER_CODE_BINDING:
```
IN([FIELD], SELECT(ENUM_DICTIONARY[ENUM_VALUE], AND(ENUM_DICTIONARY[ENUM_GROUP] = "GROUP", ENUM_DICTIONARY[IS_ACTIVE] = TRUE)))
```
