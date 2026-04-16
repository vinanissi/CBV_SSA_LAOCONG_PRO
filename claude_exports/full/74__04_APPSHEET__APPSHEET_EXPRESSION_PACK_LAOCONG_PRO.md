# APPSHEET EXPRESSION PACK - LAOCONG PRO

## Is open task
```appsheet
IN([STATUS], LIST("NEW", "ASSIGNED", "IN_PROGRESS", "WAITING"))
```

## Is current owner
```appsheet
[OWNER_ID] = USEREMAIL()
```

## Can complete task
```appsheet
AND(
  IN([STATUS], LIST("IN_PROGRESS", "WAITING")),
  COUNT(
    SELECT(
      TASK_CHECKLIST[ID],
      AND(
        [TASK_ID] = [_THISROW].[ID],
        [IS_REQUIRED] = TRUE,
        [IS_DONE] <> TRUE
      )
    )
  ) = 0
)
```

## Can confirm finance
```appsheet
AND(
  [STATUS] = "NEW",
  [AMOUNT] > 0,
  ISNOTBLANK([CATEGORY])
)
```
